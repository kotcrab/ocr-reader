import {google} from "@google-cloud/vision/build/protos/protos"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import * as React from "react"
import IWord = google.cloud.vision.v1.IWord

interface Props {
  words: IWord[],
  scaleX: number,
  scaleY: number,
  showText: boolean,
  fontSize: number,
}

export default function SvgWordList({words, scaleX, scaleY, showText, fontSize}: Props) {
  return <>{
    words.map((word, index) => {
      const text = word?.symbols?.map(s => s.text || "").join("") || ""
      const vert = word?.boundingBox?.vertices || []
      const rect = calculateBoundingRectangle(vert, scaleX, scaleY)

      return <text
        key={index}
        x={rect.x + rect.width / 2} y={rect.y}
        style={{
          writingMode: "vertical-lr", // TODO horizontal text
          glyphOrientationVertical: "auto",
          fill: showText ? "rgba(0,0,0,1)" : "transparent",
        }}
        fontSize={fontSize}
        textLength={rect.height}
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>
    })
  }</>
}
