import {AppSettings} from "../model/AppSettings"
import fs from "fs"
import {StorageService} from "./StorageService"
import {Book} from "../model/Book"
import {ReaderSettings} from "../model/ReaderSettings"
import {TextOrientation} from "../model/TextOrientation"
import {ReadingDirection} from "../model/ReadingDirection"

export class SettingsService {
  private readonly appSettingsFile: string

  private appSettings?: AppSettings
  private readerSettings: Map<string, ReaderSettings> = new Map()

  constructor(storageService: StorageService) {
    this.appSettingsFile = storageService.appSettingsFile
  }

  getDefaultAppSettings(): AppSettings {
    return {
      readingTimerEnabled: true,
      jpdbApiKey: "",
      textHookerWebSocketUrl: "ws://127.0.0.1:9001",
    }
  }

  async getAppSettings(): Promise<AppSettings> {
    if (!this.appSettings) {
      this.appSettings = await this.readAppSettings()
    }
    return this.appSettings
  }

  async updateAppSettings(appSettings: AppSettings) {
    this.appSettings = appSettings
    await this.writeAppSettings(appSettings)
  }

  private async readAppSettings(): Promise<AppSettings> {
    const defaultSettings = this.getDefaultAppSettings()
    const fileExists = await fs.promises.stat(this.appSettingsFile).then(() => true, () => false)
    if (!fileExists) {
      return defaultSettings
    }
    const data = JSON.parse(await fs.promises.readFile(this.appSettingsFile, "utf8"))
    return {
      readingTimerEnabled: data.readingTimerEnabled ?? defaultSettings.readingTimerEnabled,
      jpdbApiKey: data.jpdbApiKey ?? defaultSettings.jpdbApiKey,
      textHookerWebSocketUrl: data.textHookerWebSocketUrl ?? defaultSettings.textHookerWebSocketUrl,
    }
  }

  private async writeAppSettings(appSettings: AppSettings) {
    await fs.promises.writeFile(this.appSettingsFile, JSON.stringify(appSettings), "utf8")
  }

  async getReaderSettings(book: Book): Promise<ReaderSettings> {
    const cachedReaderSettings = this.readerSettings.get(book.info.id)
    if (cachedReaderSettings) {
      return cachedReaderSettings
    }
    const readerSettings = await this.readReaderSettings(book)
    this.readerSettings.set(book.info.id, readerSettings)
    return readerSettings
  }

  async updateReaderSettings(book: Book, readerSettings: ReaderSettings) {
    this.readerSettings.set(book.info.id, readerSettings)
    await this.writeReaderSettings(book, readerSettings)
    return readerSettings
  }

  private async readReaderSettings(book: Book): Promise<ReaderSettings> {
    const defaultSettings: ReaderSettings = {
      zoom: 40,
      autoFontSize: true,
      fontSize: 17,
      minimumConfidence: 40,
      showText: false,
      showParagraphs: false,
      showAnalysis: true,
      textOrientation: TextOrientation.Auto,
      readingDirection: ReadingDirection.RightToLeft,
    }
    const fileExists = await fs.promises.stat(book.readerSettingsFile).then(() => true, () => false)
    if (!fileExists) {
      return defaultSettings
    }
    const data = JSON.parse(await fs.promises.readFile(book.readerSettingsFile, "utf8"))
    return {
      zoom: data.zoom ?? defaultSettings.zoom,
      autoFontSize: data.autoFontSize ?? defaultSettings.autoFontSize,
      fontSize: data.fontSize ?? defaultSettings.fontSize,
      minimumConfidence: data.minimumConfidence ?? defaultSettings.minimumConfidence,
      showText: data.showText ?? defaultSettings.showText,
      showParagraphs: data.showParagraphs ?? defaultSettings.showParagraphs,
      showAnalysis: data.showAnalysis ?? defaultSettings.showAnalysis,
      textOrientation: data.textOrientation ?? defaultSettings.textOrientation,
      readingDirection: data.readingDirection ?? defaultSettings.readingDirection,
    }
  }

  private async writeReaderSettings(book: Book, readerSettings: ReaderSettings) {
    await fs.promises.writeFile(book.readerSettingsFile, JSON.stringify(readerSettings), "utf8")
  }
}
