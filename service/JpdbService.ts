import {BookService} from "./BookService"
import {services} from "./Services"
import {google} from "@google-cloud/vision/build/protos/protos"
import {StorageService} from "./StorageService"
import {AnalysisResults} from "../model/AnalysisResults"
import {WordStatus} from "../model/WordStatus"
import * as crypto from "crypto"
import ISymbol = google.cloud.vision.v1.ISymbol
import IVertex = google.cloud.vision.v1.IVertex

const jsdom = require("jsdom")
const {JSDOM} = jsdom

export class JpdbService {
  private readonly queriedStatuses = [WordStatus.Learning, WordStatus.Locked, WordStatus.New]

  private readonly storageService: StorageService
  private readonly bookService: BookService
  private readonly jpdbSid: string

  constructor(storageService: StorageService, bookService: BookService, jpdbSid: string) {
    this.storageService = storageService
    this.bookService = bookService
    this.jpdbSid = jpdbSid
  }

  isJpdbEnalbed() {
    return this.jpdbSid.length > 0
  }

  async analyze(bookId: string, page: number): Promise<AnalysisResults> {
    const ocr = await services.bookService.getBookOcrResults(bookId, page)
    const ocrBlocks = ocr.annotations.pages?.[0].blocks || []
    const sentenceSymbols = ocrBlocks.flatMap(block =>
      block?.paragraphs?.flatMap(paragraph =>
        paragraph.words?.flatMap(word =>
          word.symbols?.flatMap(symbol => mapSymbol(symbol)) || []
        ) || []
      ) || []
    )
      .filter(it => it.text && it.vertices)

    const sentenceText = sentenceSymbols.map(it => it.text).join("")
    const html = await this.getOrFetchJpdbHtml(sentenceText)
    const document = new JSDOM(html).window.document

    const ruby = [...document.getElementsByTagName("rt")] as Element[]
    ruby.forEach(it => it.remove())

    const parsedSentence = [...document.getElementsByClassName("floating-sentence")[0].children] as Element[]
    const results = parsedSentence.map(fragment => {
      const fragmentText = fragment.textContent || ""
      const symbols = sentenceSymbols.splice(0, fragmentText.length)
      const reference = fragment.querySelector("a")?.href.split("#")[1]
      const status = this.queryWordStatusFromReference(document, reference)
      const vertices = this.partitionSymbolsVertices(symbols)
      return {
        fragment: fragmentText,
        status: status,
        vertices: vertices,
      }
    })
      .filter(it => it.status !== WordStatus.Other)

    return {results: results}
  }

  private queryWordStatusFromReference(
    document: Document,
    reference: string | undefined,
    defaultStatus = WordStatus.Other
  ): WordStatus {
    if (!reference) {
      return defaultStatus
    }
    const referenceDiv = document.getElementById(reference)
    for (const queriedStatus of this.queriedStatuses) {
      if (referenceDiv?.querySelector(this.jpdbStatusSelectorFor(queriedStatus))) {
        return queriedStatus
      }
    }
    return defaultStatus
  }

  private jpdbStatusSelectorFor(status: WordStatus) {
    switch (status) {
      case WordStatus.Learning:
        return "div.tag.learning"
      case WordStatus.Locked:
        return "div.tag.locked"
      case WordStatus.New:
        return "div.tag.new"
      default:
        throw new Error("Unsupported word status")
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

  private async getOrFetchJpdbHtml(text: string): Promise<string> {
    const cacheFile = crypto.createHash("sha256").update(text).digest("hex") + ".json"
    const cache = await this.storageService.readJpdbCache(cacheFile)
    if (!cache || Date.now() > cache.expireAt) {
      console.log(`JPDB cache miss for ${cacheFile}`)
      const html = await this.fetchJpdbHtml(text)
      const expireAt = new Date()
      expireAt.setDate(expireAt.getDate() + 1)
      await this.storageService.writeJpdbCache(cacheFile, {expireAt: expireAt.getTime(), html: html})
      return html
    } else {
      console.log(`JPDB cache hit for ${cacheFile}`)
      return cache.html
    }
  }

  private async fetchJpdbHtml(text: string): Promise<string> {
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
