import {effectiveTextOrientation, scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {useContext, useState} from "react"
import {ImageAnalysisFragment} from "../model/ImageAnalysis"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import SvgSymbol from "./SvgSymbol"
import SvgHighlight from "./SvgHighlight"

interface Props {
  fragment: ImageAnalysisFragment,
  color: string | undefined,
  vocabulary: JpdbVocabulary | undefined,
  showAnalysis: boolean,
}

export default function SvgAnalysisFragment({fragment, color, vocabulary, showAnalysis}: Props) {
  const {scaleX, scaleY, textOrientation} = useContext(SvgOverlayContext)
  const [popupOpen, setPopupOpen] = useState(false)

  const bounds = scaleRectangle(fragment.bounds, scaleX, scaleY)

  return <g
    onMouseEnter={() => setPopupOpen(true)}
    onMouseLeave={() => setPopupOpen(false)}
  >
    {color && showAnalysis ?
      <SvgHighlight
        bounds={bounds}
        color={color}
        vocabulary={vocabulary}
        popupOpen={popupOpen}
      /> : null}
    {fragment.symbols.map((symbol, symbolIndex) =>
      <SvgSymbol
        key={`as-${symbolIndex}`}
        packedSymbol={symbol}
        textOrientation={effectiveTextOrientation(textOrientation, fragment.orientation)}
      />
    )}
  </g>
}
