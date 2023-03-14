import {JpdbVocabulary} from "./JpdbVocabulary"
import {Rectangle} from "./Rectangle"
import {PackedOcrSymbol} from "./OcrPage"
import {TextOrientation} from "./TextOrientation"

export interface ImageAnalysis {
  readonly paragraphs: readonly ImageAnalysisParagraph[],
  readonly vocabulary: readonly JpdbVocabulary[],
}

export interface ImageAnalysisParagraph {
  readonly id: number,
  readonly confidence: number,
  readonly fragments: readonly ImageAnalysisFragment[],
}

export interface ImageAnalysisFragment {
  readonly vocabularyIndex: number,
  readonly bounds: Rectangle,
  readonly orientation: TextOrientation,
  readonly symbols: PackedOcrSymbol[],
}
