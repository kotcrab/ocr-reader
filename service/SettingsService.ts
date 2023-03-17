import {AppSettings} from "../model/AppSettings"
import fs from "fs"
import {StorageService} from "./StorageService"
import {Book} from "../model/Book"
import {ReaderSettings} from "../model/ReaderSettings"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {ReadingDirection} from "../model/ReadingDirection"
import {JpdbRule} from "../model/JpdbRule"
import {JpdbCardState} from "../model/JpdbCardState"
import {JpdbPopup} from "../model/JpdbPopup"

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
      jpdbMiningDeckId: 0,
      jpdbRules: DEFAULT_JPDB_RULES,
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
      jpdbMiningDeckId: data.jpdbMiningDeckId ?? defaultSettings.jpdbMiningDeckId,
      jpdbRules: data.jpdbRules ?? defaultSettings.jpdbRules,
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
      textOrientation: TextOrientationSetting.Auto,
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

const DEFAULT_JPDB_RULES: JpdbRule[] = [
  {
    enabled: true,
    states: [JpdbCardState.Learning],
    overlayColor: "#4AE78126",
    textColor: "#68D391FF",
    popup: JpdbPopup.Compact,
  },
  {
    enabled: false,
    states: [JpdbCardState.Known, JpdbCardState.NeverForget],
    overlayColor: "#33B25E26",
    textColor: "#449462FF",
    popup: JpdbPopup.Compact,
  },
  {
    enabled: true,
    states: [JpdbCardState.Locked, JpdbCardState.Suspended],
    overlayColor: "#54414326",
    textColor: "#8999A2FF",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.New],
    overlayColor: "#20309126",
    textColor: "#63B3EDFF",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.NotInDecks],
    overlayColor: "#2A3BB026",
    textColor: "#618AB0FF",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.Due],
    overlayColor: "#FF450026",
    textColor: "#FF4500FF",
    popup: JpdbPopup.Full,
  },
  {
    enabled: false,
    states: [JpdbCardState.Failed],
    overlayColor: "#FF000026",
    textColor: "#FF0000FF",
    popup: JpdbPopup.Full,
  },
  {
    enabled: false,
    states: [],
    overlayColor: "#8134B426",
    textColor: "#AA1DB4FF",
    popup: JpdbPopup.None,
  },
]
