import {JpdbCardState} from "./JpdbCardState"

export interface TextAnalysisResult {
  readonly fragment: string,
  readonly state: JpdbCardState,
}
