import {JpdbVocabulary} from "./JpdbVocabulary"
import {Rectangle} from "./Rectangle"

export interface ImageAnalysisResult {
  readonly paragraphs: readonly ImageAnalysisParagraph[],
  readonly vocabulary: readonly JpdbVocabulary[],
}

export interface ImageAnalysisParagraph {
  readonly confidence: number,
  readonly fragments: readonly ImageAnalysisFragment[],
}

export interface ImageAnalysisFragment {
  readonly vocabularyIndex: number,
  readonly bounds: readonly Rectangle[],
}
