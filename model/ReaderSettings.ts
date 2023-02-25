import {TextOrientation} from "./TextOrientation"
import {ReadingDirection} from "./ReadingDirection"

export interface ReaderSettings {
  zoom: number,
  autoFontSize: boolean,
  fontSize: number,
  showText: boolean,
  showParagraphs: boolean,
  showAnalysis: boolean,
  textOrientation: TextOrientation,
  readingDirection: ReadingDirection,
}
