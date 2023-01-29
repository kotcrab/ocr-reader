import {BookService} from "./BookService"
import {services} from "./Services"
import {google} from "@google-cloud/vision/build/protos/protos"
import {StorageService} from "./StorageService"
import {AnalysisResults} from "../model/AnalysisResults"
import {WordStatus} from "../model/WordStatus"
import * as crypto from "crypto"
import {TextAnalysisResult} from "../model/TextAnalysisResults"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import ISymbol = google.cloud.vision.v1.ISymbol
import IVertex = google.cloud.vision.v1.IVertex

const jsdom = require("jsdom")
const {JSDOM} = jsdom

export class JpdbService {
  private readonly queriedStatuses = [
    WordStatus.New, WordStatus.Known, WordStatus.Due, WordStatus.Suspended, WordStatus.Locked,
    WordStatus.Learning, WordStatus.Failed, WordStatus.Blacklisted,
  ]
  private readonly analysisStatuses = [WordStatus.New, WordStatus.Locked, WordStatus.Learning, WordStatus.NotInDeck]

  private readonly storageService: StorageService
  private readonly bookService: BookService
  private readonly jpdbSid: string

  constructor(storageService: StorageService, bookService: BookService, jpdbSid: string) {
    this.storageService = storageService
    this.bookService = bookService
    this.jpdbSid = jpdbSid
  }

  isEnabled() {
    return this.jpdbSid.length > 0
  }

  async analyze(bookId: string, page: number): Promise<AnalysisResults> {
    const {annotations} = await services.bookService.getBookOcrAnnotations(bookId, page)
    const ocrBlocks = annotations.pages?.[0].blocks || []
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
        status: it.status,
        bounds: bounds,
      }
    })
      .filter(it => this.analysisStatuses.includes(it.status))
    return {results: results}
  }

  async analyzeText(text: string, preserveNewLines: boolean = false): Promise<TextAnalysisResult[]> {
    if (!text) {
      return []
    }
    const html = await this.getOrFetchJpdbHtmlFor(text)
    const document = new JSDOM(html).window.document

    const ruby = [...document.getElementsByTagName("rt")] as Element[]
    ruby.forEach(it => it.remove())

    const floatingSentence = document.getElementsByClassName("floating-sentence")
    if (floatingSentence.length === 0) {
      return [{fragment: text, status: WordStatus.Missing}]
    }
    const parsedSentence = [...floatingSentence[0].children] as Element[]
    let textPos = 0
    return parsedSentence.map(fragment => {
      const fragmentText = fragment.textContent || ""
      let formattedFragmentText = ""
      if (preserveNewLines) {
        for (const char of fragmentText) {
          if (text[textPos] == "\n") {
            formattedFragmentText += "\n"
            textPos++
          }
          formattedFragmentText += char
          textPos++
        }
        if (text[textPos] == "\n") {
          formattedFragmentText += "\n"
          textPos++
        }
      } else {
        formattedFragmentText = fragmentText
      }
      const reference = fragment.querySelector("a")?.href.split("#")[1]
      const status = this.queryWordStatusFromReference(document, reference)
      return {
        fragment: formattedFragmentText,
        status: status,
      }
    })
  }

  private queryWordStatusFromReference(
    document: Document,
    reference: string | undefined,
  ): WordStatus {
    if (!reference) {
      return WordStatus.Missing
    }
    const referenceDiv = document.getElementById(reference)
    for (const queriedStatus of this.queriedStatuses) {
      if (referenceDiv?.querySelector(this.jpdbStatusSelectorFor(queriedStatus))) {
        return queriedStatus
      }
    }
    return WordStatus.NotInDeck
  }

  private jpdbStatusSelectorFor(status: WordStatus) {
    switch (status) {
      case WordStatus.New:
        return "div.tag.new"
      case WordStatus.Known:
        return "div.tag.known"
      case WordStatus.Due:
        return "div.tag.overdue"
      case WordStatus.Suspended:
        return "div.tag.suspended"
      case WordStatus.Failed:
        return "div.tag.failed"
      case WordStatus.Blacklisted:
        return "div.tag.blacklisted"
      case WordStatus.Learning:
        return "div.tag.learning"
      case WordStatus.Locked:
        return "div.tag.locked"
      default:
        throw new Error(`No selector for word status: ${status}`)
    }
  }

  private partitionSymbolsVertices(symbols: MappedSymbol[]): IVertex[][] {
    const vertices: IVertex[][] = [[]]
    for (const symbol of symbols) {
      vertices[vertices.length - 1].push(...symbol.vertices)
      if (symbol.detectedBreak) {
        vertices.push([])
      }
    }
    return vertices
  }

  private async getOrFetchJpdbHtmlFor(text: string): Promise<string> {
    const cacheFile = crypto.createHash("sha256").update(text).digest("hex") + ".json"
    const cache = await this.storageService.readJpdbCache(cacheFile)
    if (!cache || Date.now() > cache.expireAt) {
      console.log(`JPDB cache miss for ${cacheFile}`)
      const html = await this.fetchJpdbHtmlFor(text)
      const expireAt = new Date()
      expireAt.setDate(expireAt.getDate() + 1)
      await this.storageService.writeJpdbCache(cacheFile, {expireAt: expireAt.getTime(), html: html})
      return html
    } else {
      console.log(`JPDB cache hit for ${cacheFile}`)
      return cache.html
    }
  }

  private async fetchJpdbHtmlFor(text: string): Promise<string> {
    console.log("Sending request to JPDB")
    const response = await fetch("https://jpdb.io/search?q=" + text, {
      headers: {
        cookie: "sid=" + this.jpdbSid,
      },
    })
    return await response.text()
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
