import {effectiveTextOrientation, scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {useContext, useState} from "react"
import {ImageAnalysisFragment} from "../model/ImageAnalysis"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import SvgSymbol from "./SvgSymbol"
import SvgHighlight from "./SvgHighlight"
import {JpdbRule} from "../model/JpdbRule"
import useDebounce from "../util/Debouce"

interface Props {
  fragment: ImageAnalysisFragment,
  rule: JpdbRule | undefined,
  vocabulary: JpdbVocabulary | undefined,
  showAnalysis: boolean,
}

export default function SvgAnalysisFragment({fragment, rule, vocabulary, showAnalysis}: Props) {
  const {scaleX, scaleY, textOrientation} = useContext(SvgOverlayContext)
  const [mouseOver, setMouseOver] = useState(false)
  const debouncedMouseOver = useDebounce(mouseOver, 40)

  const bounds = scaleRectangle(fragment.bounds, scaleX, scaleY)

  return <g
    onMouseEnter={() => setMouseOver(true)}
    onMouseLeave={() => setMouseOver(false)}
  >
    {showAnalysis && rule ?
      <SvgHighlight
        bounds={bounds}
        rule={rule}
        vocabulary={vocabulary}
        mouseOverGroup={debouncedMouseOver}
      /> : null}
    {fragment.symbols.map((symbol, symbolIndex) =>
      <SvgSymbol
        key={symbolIndex}
        packedSymbol={symbol}
        textOrientation={effectiveTextOrientation(textOrientation, fragment.orientation)}
      />
    )}
  </g>
}
