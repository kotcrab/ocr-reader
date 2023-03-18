import {TextOrientationSetting} from "./TextOrientationSetting"
import {ReadingDirection} from "./ReadingDirection"
import {boolean, InferType, mixed, number, object} from "yup"

export const readerSettingsSchema = object({
  zoom: number().integer().positive().required(),
  autoFontSize: boolean().required(),
  fontSize: number().integer().positive().required(),
  minimumConfidence: number().integer().positive().required(),
  showText: boolean().required(),
  showParagraphs: boolean().required(),
  showAnalysis: boolean().required(),
  textOrientation: mixed<TextOrientationSetting>().oneOf(Object.values(TextOrientationSetting)).required(),
  readingDirection: mixed<ReadingDirection>().oneOf(Object.values(ReadingDirection)).required(),
})

export interface ReaderSettings extends InferType<typeof readerSettingsSchema> {
}
