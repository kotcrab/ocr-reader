import {BookService} from "./BookService"
import * as crypto from "crypto"
import {TextAnalysis, TextAnalysisToken} from "../model/TextAnalysis"
import {SettingsService} from "./SettingsService"
import {JpdbCache} from "./JpdbCache"
import {RateLimiter} from "limiter"
import {JPDB_TOKEN_API_FIELDS, unpackJpdbToken} from "../model/JpdbToken"
import {JPDB_VOCABULARY_API_FIELDS, unpackJpdbVocabulary} from "../model/JpdbVocabulary"
import {JpdbPackedParseResult, JpdbParseResult} from "../model/JpdbParseResult"
import {fromPackedOcrSymbol, OcrParagraph, PackedOcrSymbol, textFromPackedOcrSymbol} from "../model/OcrPage"
import {ImageAnalysis, ImageAnalysisFragment, ImageAnalysisParagraph} from "../model/ImageAnalysis"
import {unionRectangles} from "../util/OverlayUtil"
import {JPDB_BASE} from "../util/JpdbUitl"
import {RequestError} from "../util/RequestError"
import {JpdbDeckId} from "../model/JpdbDeckId"

export class JpdbService {
  private readonly bookService: BookService
  private readonly settingsService: SettingsService
  private readonly jpdbCache: JpdbCache

  private readonly rateLimiter = new RateLimiter({tokensPerInterval: 1, interval: 250})

  constructor(bookService: BookService, settingsService: SettingsService, jpdbCache: JpdbCache) {
    this.bookService = bookService
    this.settingsService = settingsService
    this.jpdbCache = jpdbCache
  }

  async isEnabled() {
    return (await this.getJpdbApiKey()).length > 0
  }

  async analyzeBookPage(bookId: string, page: number): Promise<ImageAnalysis> {
    const {paragraphs} = await this.bookService.getBookOcrResults(bookId, page)

    const pageText = paragraphs
      .map(it =>
        it.lines
          .flatMap(it => it.symbols)
          .map(it => textFromPackedOcrSymbol(it))
          .filter(it => it != "\n")
          .join("")
      )
      .join("\n")

    const {tokens, vocabulary} = await this.analyzeText(pageText)

    const imageParagraphs: ImageAnalysisParagraph[] = []
    let pendingImageFragments: ImageAnalysisFragment[] = []

    function commitPendingImageFragments() {
      if (pendingImageFragments.length == 0) {
        return
      }
      const {id, confidence} = symbolStream.currentParagraph()
      imageParagraphs.push({
        id: id,
        confidence: confidence,
        fragments: pendingImageFragments,
      })
      pendingImageFragments = []
    }

    const symbolStream = new OcrSymbolStream(paragraphs)
    tokens.forEach(token => {
      if (token.text == "\n") {
        commitPendingImageFragments()
        symbolStream.nextParagraph()
      } else {
        pendingImageFragments.push(...symbolStream.nextSymbols(token.text.length, token.vocabularyIndex))
      }
    })
    commitPendingImageFragments()

    return {
      paragraphs: imageParagraphs,
      vocabulary: vocabulary,
    }
  }

  async analyzeText(text: string): Promise<TextAnalysis> {
    if (!text) {
      return {
        tokens: [],
        vocabulary: [],
      }
    }
    const parseResult = await this.parseText(text)
    const tokens = parseResult.tokens

    const analysisTokens: TextAnalysisToken[] = []
    let currentPosition = 0
    let currentToken = 0
    while (currentPosition < text.length) {
      if (currentToken < tokens.length && tokens[currentToken].position == currentPosition) {
        const token = tokens[currentToken]
        const end = currentPosition + token.length
        analysisTokens.push({
          text: text.slice(currentPosition, end),
          vocabularyIndex: token.vocabularyIndex,
        })
        currentPosition = end
        currentToken++
      } else {
        const end = currentToken < tokens.length ? tokens[currentToken].position : text.length
        analysisTokens.push({
          text: text.slice(currentPosition, end),
          vocabularyIndex: -1,
        })
        currentPosition = end
      }
    }
    return {
      tokens: this.normalizeTokens(analysisTokens),
      vocabulary: parseResult.vocabulary,
    }
  }

  private normalizeTokens(tokens: TextAnalysisToken[]): TextAnalysisToken[] {
    return tokens
      .flatMap(it => {
        if (it.text.includes("\n")) {
          const parts = it.text.split(/(\n)/g)
          return parts.map(part => ({text: part, vocabularyIndex: it.vocabularyIndex}))
        } else {
          return it
        }
      })
      .filter(it => !!it.text)
  }

  private async parseText(text: string): Promise<JpdbParseResult> {
    const cacheKey = this.getTextCacheKey(text)
    const cachedResult = this.jpdbCache.retrieveItemValue(cacheKey)
    if (cachedResult) {
      console.log(`JPDB cache hit for ${cacheKey}`)
      return cachedResult
    }
    console.log(`JPDB cache miss for ${cacheKey}`)
    const parseResult = await this.fetchParseText(text)
    this.jpdbCache.storeExpiringItem(cacheKey, parseResult, 60 * 5)
    return parseResult
  }

  private async fetchParseText(text: string): Promise<JpdbParseResult> {
    await this.rateLimiter.removeTokens(1)
    const response = await fetch(`${JPDB_BASE}/api/v1/parse`, {
      method: "POST",
      headers: await this.getStandardPostHeaders(),
      body: JSON.stringify({
          text: text,
          token_fields: JPDB_TOKEN_API_FIELDS,
          vocabulary_fields: JPDB_VOCABULARY_API_FIELDS,
        }
      ),
    })
    if (!response.ok) {
      console.log(await response.json())
      throw new RequestError("Could not parse text")
    }
    const parseResult = await response.json() as JpdbPackedParseResult
    return {
      tokens: parseResult.tokens.map(it => unpackJpdbToken(it))
        .sort((a, b) => a.position - b.position),
      vocabulary: parseResult.vocabulary.map(it => unpackJpdbVocabulary(it)),
    }
  }

  async modifyVocabularyInDeck(deckId: JpdbDeckId, vid: number, sid: number, mode: "add" | "remove") {
    await this.rateLimiter.removeTokens(1)
    const response = await fetch(`${JPDB_BASE}/api/v1/deck/${mode}-vocabulary`, {
      method: "POST",
      headers: await this.getStandardPostHeaders(),
      body: JSON.stringify({
          id: deckId,
          vocabulary: [[vid, sid]],
        }
      ),
    })
    if (!response.ok) {
      console.log(await response.json())
      throw new RequestError(`Could not modify vocabulary ${vid} in deck ${deckId}`)
    }
    this.jpdbCache.clear()
  }

  private async getStandardPostHeaders() {
    return {
      "Authorization": "Bearer " + await this.getJpdbApiKey(),
      "Content-Type": "application/json",
    }
  }

  private getTextCacheKey(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex")
  }

  private async getJpdbApiKey() {
    return (await this.settingsService.getAppSettings()).jpdbApiKey
  }
}

class OcrSymbolStream {
  private readonly paragraphs: readonly OcrParagraph[]
  private paragraphIndex = 0
  private lineIndex = 0
  private symbolIndex = 0

  constructor(paragraphs: readonly OcrParagraph[]) {
    this.paragraphs = paragraphs
  }

  nextSymbols(length: number, vocabularyIndex: number): ImageAnalysisFragment[] {
    const fragments: ImageAnalysisFragment[] = []
    let pendingSymbols: PackedOcrSymbol[] = []

    const commitPendingSymbols = () => {
      if (pendingSymbols.length == 0) {
        return
      }
      fragments.push({
        vocabularyIndex: vocabularyIndex,
        bounds: unionRectangles(pendingSymbols.map(it => fromPackedOcrSymbol(it).bounds)),
        orientation: this.paragraphs[this.paragraphIndex].lines[this.lineIndex].orientation,
        symbols: pendingSymbols,
      })
      pendingSymbols = []
    }

    const paragraph = this.paragraphs[this.paragraphIndex]
    for (let i = 0; i < length; i++) {
      const line = paragraph.lines[this.lineIndex]
      pendingSymbols.push(line.symbols[this.symbolIndex])
      this.symbolIndex++
      if (this.symbolIndex >= line.symbols.length) {
        commitPendingSymbols()
        this.lineIndex++
        this.symbolIndex = 0
      }
    }
    commitPendingSymbols()
    return fragments
  }

  currentParagraph(): OcrParagraph {
    return this.paragraphs[this.paragraphIndex]
  }

  nextParagraph() {
    this.paragraphIndex++
    this.lineIndex = 0
    this.symbolIndex = 0
  }
}
