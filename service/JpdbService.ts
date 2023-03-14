import {BookService} from "./BookService"
import * as crypto from "crypto"
import {TextAnalysisResult, TextAnalysisToken} from "../model/TextAnalysis"
import {SettingsService} from "./SettingsService"
import {JpdbCache} from "./JpdbCache"
import {RateLimiter} from "limiter"
import {JPDB_TOKEN_API_FIELDS, unpackJpdbToken} from "../model/JpdbToken"
import {JPDB_VOCABULARY_API_FIELDS, unpackJpdbVocabulary} from "../model/JpdbVocabulary"
import {JpdbPackedParseResult, JpdbParseResult} from "../model/JpdbParseResult"
import {fromPackedOcrSymbol, OcrParagraph, textFromPackedOcrSymbol} from "../model/OcrPage"
import {ImageAnalysisFragment, ImageAnalysisParagraph, ImageAnalysis} from "../model/ImageAnalysis"
import {Rectangle} from "../model/Rectangle"
import {unionRectangles} from "../util/OverlayUtil"

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
      imageParagraphs.push({
        confidence: boundsStream.currentParagraphConfidence(),
        fragments: pendingImageFragments,
      })
      pendingImageFragments = []
    }

    const boundsStream = new OcrBoundsStream(paragraphs)
    tokens.forEach(token => {
      if (token.text == "\n") {
        commitPendingImageFragments()
        boundsStream.nextParagraph()
      } else {
        const bounds = boundsStream.nextBounds(token.text.length)
        pendingImageFragments.push({
          vocabularyIndex: token.vocabularyIndex,
          bounds: bounds,
        })
      }
    })
    commitPendingImageFragments()

    return {
      paragraphs: imageParagraphs,
      vocabulary: vocabulary,
    }
  }

  async analyzeText(text: string): Promise<TextAnalysisResult> {
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
          }
        )
        currentPosition = end
        currentToken++
      } else {
        const end = currentToken < tokens.length ? tokens[currentToken].position : text.length
        analysisTokens.push({
            text: text.slice(currentPosition, end),
            vocabularyIndex: -1,
          }
        )
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
    const response = await fetch("https://jpdb.io/api/v1/parse", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + await this.getJpdbApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          text: text,
          token_fields: JPDB_TOKEN_API_FIELDS,
          vocabulary_fields: JPDB_VOCABULARY_API_FIELDS,
        }
      ),
    })
    const parseResult = await response.json() as JpdbPackedParseResult
    return {
      tokens: parseResult.tokens.map(it => unpackJpdbToken(it))
        .sort((a, b) => a.position - b.position),
      vocabulary: parseResult.vocabulary.map(it => unpackJpdbVocabulary(it)),
    }
  }

  private getTextCacheKey(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex")
  }

  private async getJpdbApiKey() {
    return (await this.settingsService.getAppSettings()).jpdbApiKey
  }
}

class OcrBoundsStream {
  private readonly paragraphs: readonly OcrParagraph[]
  private paragraphIndex = 0
  private lineIndex = 0
  private symbolIndex = 0

  constructor(paragraphs: readonly OcrParagraph[]) {
    this.paragraphs = paragraphs
  }

  nextBounds(length: number): Rectangle[] {
    const bounds: Rectangle[] = []
    let pendingBounds: Rectangle[] = []

    function commitPendingBounds() {
      if (pendingBounds.length == 0) {
        return
      }
      bounds.push(unionRectangles(pendingBounds))
      pendingBounds = []
    }

    const paragraph = this.paragraphs[this.paragraphIndex]
    for (let i = 0; i < length; i++) {
      const line = paragraph.lines[this.lineIndex]
      const symbol = fromPackedOcrSymbol(line.symbols[this.symbolIndex])
      pendingBounds.push(symbol.bounds)
      this.symbolIndex++
      if (this.symbolIndex >= line.symbols.length) {
        this.lineIndex++
        this.symbolIndex = 0
        commitPendingBounds()
      }
    }
    commitPendingBounds()
    return bounds
  }

  currentParagraphConfidence(): number {
    return this.paragraphs[this.paragraphIndex].confidence
  }

  nextParagraph() {
    this.paragraphIndex++
    this.lineIndex = 0
    this.symbolIndex = 0
  }
}
