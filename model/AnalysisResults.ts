import {WordStatus} from "./WordStatus"
import {Rectangle} from "./Rectangle"

export interface AnalysisResults {
  readonly results: AnalysisResult[],
}

export interface AnalysisResult {
  readonly fragment: string,
  readonly status: WordStatus,
  readonly bounds: Rectangle[],
}
