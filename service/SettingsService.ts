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
import {PopupPosition} from "../model/PopupPosition"
import {PageView} from "../model/PageView"
import {FloatingPageTurnAction} from "../model/FloatingPageTurnAction"

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
      floatingPage: {
        panningVelocity: true,
        turnAction: FloatingPageTurnAction.FitToScreen,
        animateTurn: true,
        limitToBounds: false,
      },
      jpdbApiKey: "",
      jpdbMiningDeckId: 0,
      jpdbHorizontalTextPopupPosition: PopupPosition.BelowText,
      jpdbVerticalTextPopupPosition: PopupPosition.LeftOfText,
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
      floatingPage: {
        panningVelocity: data.floatingPage?.panningVelocity ?? defaultSettings.floatingPage.panningVelocity,
        turnAction: data.floatingPage?.turnAction ?? defaultSettings.floatingPage.turnAction,
        animateTurn: data.floatingPage?.animateTurn ?? defaultSettings.floatingPage.animateTurn,
        limitToBounds: data.floatingPage?.limitToBounds ?? defaultSettings.floatingPage.limitToBounds,
      },
      jpdbApiKey: data.jpdbApiKey ?? defaultSettings.jpdbApiKey,
      jpdbMiningDeckId: data.jpdbMiningDeckId ?? defaultSettings.jpdbMiningDeckId,
      jpdbHorizontalTextPopupPosition: data.jpdbHorizontalTextPopupPosition ?? defaultSettings.jpdbHorizontalTextPopupPosition,
      jpdbVerticalTextPopupPosition: data.jpdbVerticalTextPopupPosition ?? defaultSettings.jpdbVerticalTextPopupPosition,
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
      pageView: PageView.Fixed,
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
      pageView: data.pageView ?? defaultSettings.pageView,
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
    textColor: "#68D391",
    popup: JpdbPopup.Full,
  },
  {
    enabled: false,
    states: [JpdbCardState.Known, JpdbCardState.NeverForget],
    overlayColor: "#248D4926",
    textColor: "#449462",
    popup: JpdbPopup.Compact,
  },
  {
    enabled: true,
    states: [JpdbCardState.Locked, JpdbCardState.Suspended],
    overlayColor: "#54414326",
    textColor: "#8999A2",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.New],
    overlayColor: "#20309126",
    textColor: "#63B3ED",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.NotInDecks],
    overlayColor: "#1B246426",
    textColor: "#618AB0",
    popup: JpdbPopup.Full,
  },
  {
    enabled: true,
    states: [JpdbCardState.Due],
    overlayColor: "#FF450020",
    textColor: "#FF4500",
    popup: JpdbPopup.Full,
  },
  {
    enabled: false,
    states: [JpdbCardState.Failed],
    overlayColor: "#FF000020",
    textColor: "#FF0000",
    popup: JpdbPopup.Full,
  },
  {
    enabled: false,
    states: [],
    overlayColor: "#8134B426",
    textColor: "#AA1DB4",
    popup: JpdbPopup.None,
  },
]
