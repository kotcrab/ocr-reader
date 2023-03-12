import {JpdbToken} from "./JpdbToken"
import {JpdbVocabulary} from "./JpdbVocabulary"

export interface JpdbParseResult {
  readonly tokens: readonly JpdbToken[],
  readonly vocabulary: readonly JpdbVocabulary[],
}

export interface JpdbPackedParseResult {
  readonly tokens: readonly any[][],
  readonly vocabulary: readonly any[][],
}
