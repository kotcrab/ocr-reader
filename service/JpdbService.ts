import {BookService} from "./BookService"
import {google} from "@google-cloud/vision/build/protos/protos"
import {AnalysisResults} from "../model/AnalysisResults"
import * as crypto from "crypto"
import {TextAnalysisResult} from "../model/TextAnalysisResults"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import {SettingsService} from "./SettingsService"
import {JpdbCache} from "./JpdbCache"
import {RateLimiter} from "limiter"
import {JPDB_TOKEN_API_FIELDS, unpackJpdbToken} from "../model/JpdbToken"
import {JPDB_VOCABULARY_API_FIELDS, unpackJpdbVocabulary} from "../model/JpdbVocabulary"
import {JpdbPackedParseResult, JpdbParseResult} from "../model/JpdbParseResult"
import {JpdbCardState} from "../model/JpdbCardState"
import ISymbol = google.cloud.vision.v1.ISymbol
import IVertex = google.cloud.vision.v1.IVertex


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

  async analyze(bookId: string, page: number): Promise<AnalysisResults> {
    const {annotations} = await this.bookService.getBookOcrAnnotations(bookId, page)
    const ocrBlocks = annotations.pages?.[0].blocks || []
    // TODO should separate paragraphs instead of joining everything
    const pageSymbols = ocrBlocks
      .flatMap(block => block.paragraphs)
      .flatMap(paragraph => paragraph?.words)
      .flatMap(words => words?.symbols || [])
      .flatMap(symbol => mapSymbol(symbol))
      .filter(it => it.text && it.vertices)
    const pageText = pageSymbols.map(it => it.text).join("")

    const results = (await this.analyzeText(pageText)).map(it => {
      const symbols = pageSymbols.splice(0, it.fragment.length)
      const vertices = this.partitionSymbolsVertices(symbols)
      const bounds = vertices.map(it => calculateBoundingRectangle(it))
      return {
        fragment: it.fragment,
        state: it.state,
        bounds: bounds,
      }
    })
    return {results: results}
  }

  private partitionSymbolsVertices(symbols: MappedSymbol[]): IVertex[][] {
    const vertices: IVertex[][] = [[]]
    for (const symbol of symbols) {
      vertices[vertices.length - 1].push(...symbol.vertices)
      if (symbol.detectedBreak) {
        vertices.push([])
      }
    }
    if (vertices[vertices.length - 1].length == 0) {
      vertices.pop()
    }
    return vertices
  }

  async analyzeText(text: string): Promise<TextAnalysisResult[]> {
    if (!text) {
      return []
    }
    const parseResult = await this.parseText(text)
    const tokens = parseResult.tokens

    const fragments: TextAnalysisResult[] = []
    let currentPosition = 0
    let currentToken = 0
    while (currentPosition < text.length) {
      if (currentToken < tokens.length && tokens[currentToken].position == currentPosition) {
        const token = tokens[currentToken]
        const end = currentPosition + token.length
        fragments.push({
            fragment: text.slice(currentPosition, end),
            state: parseResult.vocabulary[token.vocabularyIndex].cardState[0],
          }
        )
        currentPosition = end
        currentToken++
      } else {
        const end = currentToken < tokens.length ? tokens[currentToken].position : text.length
        fragments.push({
            fragment: text.slice(currentPosition, end),
            state: JpdbCardState.Unparsed,
          }
        )
        currentPosition = end
      }
    }
    return fragments
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

function mapSymbol(symbol: ISymbol): MappedSymbol {
  return {
    text: symbol.text || "",
    vertices: symbol.boundingBox?.vertices || [],
    detectedBreak: !!symbol.property?.detectedBreak,
  }
}

interface MappedSymbol {
  text: string,
  vertices: IVertex[],
  detectedBreak: boolean,
}
