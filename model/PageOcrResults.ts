import {TextOrientation} from "./TextOrientation"
import {Rectangle} from "./Rectangle"

export interface PageOcrResults {
  readonly lines: OcrLine[],
  readonly paragraphsPoints: number[][],
  readonly width: number,
  readonly height: number,
  readonly pages: number,
}

export interface OcrLine {
  readonly orientation: TextOrientation,
  readonly words: OcrWord[],
}

export interface OcrWord {
  readonly text: string,
  readonly bounds: Rectangle,
}
