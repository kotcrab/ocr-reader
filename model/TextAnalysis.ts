import {JpdbVocabulary} from "./JpdbVocabulary"

export interface TextAnalysis {
  readonly tokens: readonly TextAnalysisToken[],
  readonly vocabulary: readonly JpdbVocabulary[],
}

export interface TextAnalysisToken {
  readonly text: string,
  readonly vocabularyIndex: number,
}
