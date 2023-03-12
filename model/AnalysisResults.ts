import {Rectangle} from "./Rectangle"
import {JpdbCardState} from "./JpdbCardState"

export interface AnalysisResults {
  readonly results: readonly AnalysisResult[],
}

export interface AnalysisResult {
  readonly fragment: string,
  readonly state: JpdbCardState,
  readonly bounds: readonly Rectangle[],
}
