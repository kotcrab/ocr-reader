import {TextOrientationSetting} from "./TextOrientationSetting"
import {ReadingDirection} from "./ReadingDirection"

export interface ReaderSettings {
  zoom: number,
  autoFontSize: boolean,
  fontSize: number,
  minimumConfidence: number,
  showText: boolean,
  showParagraphs: boolean,
  showAnalysis: boolean,
  textOrientation: TextOrientationSetting,
  readingDirection: ReadingDirection,
}
