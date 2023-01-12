import {google} from "@google-cloud/vision/build/protos/protos"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {TextOrientation} from "../model/TextOrientation"
import IWord = google.cloud.vision.v1.IWord

interface Props {
  words: IWord[],
  scaleX: number,
  scaleY: number,
  showText: boolean,
  fontSize: number,
  textOrientation: TextOrientation,
}

export default function SvgWordList({words, scaleX, scaleY, showText, fontSize, textOrientation}: Props) {
  const textFill = showText ? "rgba(0,0,0,1)" : "transparent"
  return <>{
    words.map((word, index) => {
      const text = word?.symbols?.map(s => s.text || "").join("") || ""
      const vert = word?.boundingBox?.vertices || []
      const rect = calculateBoundingRectangle(vert, scaleX, scaleY)

      switch (textOrientation) {
        case TextOrientation.Vertical:
          return <text
            key={index}
            x={rect.x + rect.width / 2} y={rect.y}
            style={{
              writingMode: "vertical-lr",
              glyphOrientationVertical: "auto",
              fill: textFill,
            }}
            fontSize={fontSize}
            textLength={rect.height}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </text>
        case TextOrientation.Horizontal:
          return <text
            key={index}
            x={rect.x} y={rect.y + rect.height}
            style={{
              writingMode: "horizontal-tb",
              glyphOrientationVertical: "auto",
              fill: textFill,
            }}
            fontSize={fontSize}
            textLength={rect.width}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </text>
        default:
          throw new Error("Unsupported text orientation")
      }
    })
  }</>
}
