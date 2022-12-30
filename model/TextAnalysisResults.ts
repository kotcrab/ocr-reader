import {WordStatus} from "./WordStatus"

export interface TextAnalysisResult {
  readonly fragment: string,
  readonly status: WordStatus,
}
