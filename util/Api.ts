import {
  analyzeTextUrl,
  appSettingsUrl,
  bookAnalyzePageUrl,
  bookReaderSettingsUrl,
  booksUrl,
  bookTextDumpUrl,
  bookUrl,
  jpdbDecksUrl,
  jpdbListDecksUrl,
} from "./Url"
import {AppSettings} from "../model/AppSettings"
import {ReaderSettings} from "../model/ReaderSettings"
import {RequestError} from "./RequestError"
import {JpdbDeckId} from "../model/JpdbDeckId"
import {BookInfoUpdate} from "../model/BookInfoUpdate"
import {JpdbDeckUpdateMode} from "../model/JpdbDeckUpdateMode"
import {ImageAnalysis} from "../model/ImageAnalysis"
import {JpdbDeck} from "../model/JpdbDeck"
import {TextAnalysis} from "../model/TextAnalysis"

const jsonHeaders = {
  "Content-Type": "application/json",
}

export class Api {
  static async rescanBooks() {
    await fetch(booksUrl(), {method: "POST"})
  }

  static async updateAppSettings(appSettings: AppSettings) {
    const response = await fetch(appSettingsUrl(), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(appSettings),
    })
    if (!response.ok) {
      const body = await response.json()
      throw new RequestError(body["error"] || "Unknown error")
    }
  }

  static async updateReaderSettings(bookId: string, readerSettings: ReaderSettings) {
    await fetch(bookReaderSettingsUrl(bookId), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(readerSettings),
    })
  }

  static async ocrBook(bookId: string) {
    await fetch(bookUrl(bookId), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ocr: true}),
    })
  }

  static async updateBookInfo(bookId: string, info: BookInfoUpdate) {
    await fetch(bookUrl(bookId), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({info: info}),
    })
  }

  static async dumpBookText(bookId: string, removeLineBreaks: boolean) {
    const res = await fetch(bookTextDumpUrl(bookId, removeLineBreaks))
    return await res.blob()
  }

  static async analyze(bookId: string, pages: number[]) {
    return await Promise.all(pages.map(async page => {
      const res = await fetch(bookAnalyzePageUrl(bookId, page))
      if (res.ok) {
        return await res.json() as ImageAnalysis
      } else {
        console.log(`Failed to analyze page ${page}`)
        return undefined
      }
    }))
  }

  static async analyzeText(text: string) {
    const response = await fetch(analyzeTextUrl(), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({text: text}),
    })
    if (!response.ok) {
      throw new RequestError("Could not analyze text")
    }
    return await response.json() as TextAnalysis
  }

  static async modifyDeck(deckId: JpdbDeckId, vid: number, sid: number, mode: JpdbDeckUpdateMode) {
    const response = await fetch(jpdbDecksUrl(), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({deckId: deckId, vid: vid, sid: sid, mode: mode}),
    })
    if (!response.ok) {
      throw new RequestError("Could not modify deck")
    }
  }

  static async listDecks(overrideApiKey: string) {
    const response = await fetch(jpdbListDecksUrl(), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({overrideApiKey: overrideApiKey}),
    })
    if (!response.ok) {
      throw new RequestError("Could not list decks")
    }
    return (await response.json()).decks as JpdbDeck[]
  }
}
