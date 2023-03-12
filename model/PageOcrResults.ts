import {TextOrientation} from "./TextOrientation"
import {Rectangle} from "./Rectangle"

export interface PageOcrResults {
  readonly paragraphs: OcrParagraph[],
  readonly characterCount: number,
  readonly width: number,
  readonly height: number,
}

export interface OcrParagraph {
  readonly id: number,
  readonly lines: OcrLine[],
  readonly points: number[],
  readonly confidence: number,
}

export interface OcrLine {
  readonly orientation: TextOrientation,
  readonly symbols: PackedOcrSymbol[],
}

export interface OcrSymbol {
  readonly text: string,
  readonly bounds: Rectangle
}

type PackedOcrSymbol = [string, number, number, number, number]

export function toPackedOcrSymbol(ocrSymbol: OcrSymbol): PackedOcrSymbol {
  return [ocrSymbol.text, ocrSymbol.bounds.x, ocrSymbol.bounds.y, ocrSymbol.bounds.w, ocrSymbol.bounds.h]
}

export function fromPackedOcrSymbol(packedOcrSymbol: PackedOcrSymbol): OcrSymbol {
  return {
    text: packedOcrSymbol[0],
    bounds: {
      x: packedOcrSymbol[1],
      y: packedOcrSymbol[2],
      w: packedOcrSymbol[3],
      h: packedOcrSymbol[4],
    },
  }
}
