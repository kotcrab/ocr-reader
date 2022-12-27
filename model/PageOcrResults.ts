import {google} from "@google-cloud/vision/build/protos/protos"
import ITextAnnotation = google.cloud.vision.v1.ITextAnnotation

export interface PageOcrResults {
  readonly annotations: ITextAnnotation,
  readonly width: number,
  readonly height: number,
  readonly pages: number,
}
