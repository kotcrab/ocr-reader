import {google} from "@google-cloud/vision/build/protos/protos"
import ITextAnnotation = google.cloud.vision.v1.ITextAnnotation;

export interface PageOcrResults {
  annotations: ITextAnnotation,
  width: number,
  height: number,
  pages: number,
}
