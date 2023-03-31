import {Dimensions} from "./Dimensions"
import {OcrPage} from "./OcrPage"

export interface ReaderPage {
  readonly index: number,
  readonly dimensions: Dimensions,
  readonly ocr: OcrPage,
}
