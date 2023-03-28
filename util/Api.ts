import {appSettingsUrl, bookReaderSettingsUrl, booksUrl, bookTextDumpUrl, bookUrl, jpdbDecksUrl} from "./Url"
import {AppSettings} from "../model/AppSettings"
import {ReaderSettings} from "../model/ReaderSettings"
import {RequestError} from "./RequestError"
import {JpdbDeckId} from "../model/JpdbDeckId"
import {BookInfoUpdate} from "../model/BookInfoUpdate"
import {JpdbDeckUpdateMode} from "../model/JpdbDeckUpdateMode"

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
}
