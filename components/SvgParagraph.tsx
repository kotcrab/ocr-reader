import * as React from "react"
import {useContext} from "react"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {OcrLine} from "../model/OcrPage"
import {textOrientationFromSetting} from "../model/TextOrientation"
import SvgSymbol from "./SvgSymbol"
import {SvgOverlayContext} from "../util/SvgOverlayContext"

interface Props {
  lines: readonly OcrLine[],
}

export default function SvgParagraph({lines}: Props) {
  const {textOrientation} = useContext(SvgOverlayContext)

  return <>{
    lines.flatMap((line, lineIndex) =>
      line.symbols.flatMap((packedSymbol, index) => {
        const key = `s-${lineIndex}-${index}`
        const effectiveTextOrientation = textOrientation == TextOrientationSetting.Auto
          ? line.orientation : textOrientationFromSetting(textOrientation)
        return <SvgSymbol
          key={key}
          packedSymbol={packedSymbol}
          textOrientation={effectiveTextOrientation}
        />
      })
    )}</>
}
