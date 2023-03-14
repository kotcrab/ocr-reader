import {Rectangle} from "./Rectangle"
import {TextOrientation} from "./TextOrientation"

export interface OcrPage {
  readonly paragraphs: readonly OcrParagraph[],
  readonly characterCount: number,
}

export interface OcrParagraph {
  readonly id: number,
  readonly lines: readonly OcrLine[],
  readonly points: readonly number[],
  readonly confidence: number,
}

export interface OcrLine {
  readonly orientation: TextOrientation,
  readonly symbols: readonly PackedOcrSymbol[],
}

export interface OcrSymbol {
  readonly text: string,
  readonly bounds: Rectangle
}

export type PackedOcrSymbol = [string, number, number, number, number]

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

export function textFromPackedOcrSymbol(packedOcrSymbol: PackedOcrSymbol): string {
  return packedOcrSymbol[0]
}
