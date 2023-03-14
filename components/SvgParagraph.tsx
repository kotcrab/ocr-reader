import * as React from "react"
import {useContext} from "react"
import {OcrLine} from "../model/OcrPage"
import SvgSymbol from "./SvgSymbol"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import {effectiveTextOrientation} from "../util/OverlayUtil"

interface Props {
  lines: readonly OcrLine[],
}

export default function SvgParagraph({lines}: Props) {
  const {textOrientation} = useContext(SvgOverlayContext)

  return <>{
    lines.flatMap((line, lineIndex) =>
      line.symbols.flatMap((packedSymbol, index) => {
        return <SvgSymbol
          key={`s-${lineIndex}-${index}`}
          packedSymbol={packedSymbol}
          textOrientation={effectiveTextOrientation(textOrientation, line.orientation)}
        />
      })
    )}</>
}
