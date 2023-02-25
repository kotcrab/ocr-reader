import {scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {TextOrientation} from "../model/TextOrientation"
import {fromPackedOcrSymbol, OcrLine} from "../model/PageOcrResults"

interface Props {
  lines: OcrLine[],
  scaleX: number,
  scaleY: number,
  showText: boolean,
  fontSize: number,
  textOrientation: TextOrientation,
}

export default function SvgWordList({lines, scaleX, scaleY, showText, fontSize, textOrientation}: Props) {
  const textFill = showText ? "rgba(0,0,0,1)" : "transparent"

  return <>{
    lines.flatMap((line, lineIndex) =>
      line.symbols.flatMap((packedSymbol, index) => {
        const symbol = fromPackedOcrSymbol(packedSymbol)
        const bounds = scaleRectangle(symbol.bounds, scaleX, scaleY)
        const key = `w-${lineIndex}-${index}`
        switch (textOrientation == TextOrientation.Auto ? line.orientation : textOrientation) {
          case TextOrientation.Vertical:
            return <text
              key={key}
              x={bounds.x + bounds.w / 2} y={bounds.y}
              style={{
                writingMode: "vertical-lr",
                glyphOrientationVertical: "auto",
                fill: textFill,
              }}
              fontSize={fontSize}
              textLength={bounds.h}
              lengthAdjust="spacingAndGlyphs"
            >
              {symbol.text}
            </text>
          case TextOrientation.Horizontal:
            return <text
              key={key}
              x={bounds.x} y={bounds.y + bounds.h}
              style={{
                writingMode: "horizontal-tb",
                glyphOrientationVertical: "auto",
                fill: textFill,
              }}
              fontSize={fontSize}
              textLength={bounds.w}
              lengthAdjust="spacingAndGlyphs"
            >
              {symbol.text}
            </text>
          default:
            throw new Error("Unsupported text orientation")
        }
      })
    )}</>
}
