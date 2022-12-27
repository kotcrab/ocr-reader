import {google} from "@google-cloud/vision/build/protos/protos"
import IVertex = google.cloud.vision.v1.IVertex
import {WordStatus} from "./WordStatus"

export interface AnalysisResults {
  readonly results: AnalysisResult[],
}

export interface AnalysisResult {
  readonly fragment: string,
  readonly status: WordStatus,
  readonly vertices: IVertex[][],
}
