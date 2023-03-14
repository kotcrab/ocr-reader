import {scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {useContext} from "react"
import {fromPackedOcrSymbol, PackedOcrSymbol} from "../model/OcrPage"
import {TextOrientation} from "../model/TextOrientation"
import {SvgOverlayContext} from "../util/SvgOverlayContext"

interface Props {
  packedSymbol: PackedOcrSymbol,
  textOrientation: TextOrientation,
}

export default function SvgSymbol({packedSymbol, textOrientation}: Props) {
  const {scaleX, scaleY, showText, autoFontSize, fontSize, chromiumBased} = useContext(SvgOverlayContext)

  const symbol = fromPackedOcrSymbol(packedSymbol)
  const bounds = scaleRectangle(symbol.bounds, scaleX, scaleY)
  const textFill = showText ? "rgba(0,0,0,1)" : "transparent"
  switch (textOrientation) {
    case TextOrientation.Vertical: {
      const w = chromiumBased ? bounds.h : bounds.w
      const h = chromiumBased ? bounds.w : bounds.h
      return <text
        x={bounds.x + bounds.w / 2} y={bounds.y}
        style={{
          writingMode: "vertical-lr",
          glyphOrientationVertical: "auto",
          fill: textFill,
        }}
        fontSize={autoFontSize ? h : fontSize}
        textLength={w}
        lengthAdjust="spacingAndGlyphs"
      >
        {symbol.text}
      </text>
    }
    case TextOrientation.Horizontal: {
      return <text
        x={bounds.x} y={bounds.y + bounds.h}
        style={{
          writingMode: "horizontal-tb",
          glyphOrientationVertical: "auto",
          fill: textFill,
        }}
        fontSize={autoFontSize ? bounds.h : fontSize}
        textLength={bounds.w}
        lengthAdjust="spacingAndGlyphs"
      >
        {symbol.text}
      </text>
    }
    default:
      throw new Error("Unsupported text orientation")
  }
}
