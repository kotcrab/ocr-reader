import {getEffectiveTextOrientation, scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {useContext, useState} from "react"
import {ImageAnalysisFragment} from "../model/ImageAnalysis"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import SvgSymbol from "./SvgSymbol"
import SvgHighlight from "./SvgHighlight"
import {JpdbRule} from "../model/JpdbRule"
import useDebounce from "../util/Debounce"

interface Props {
  fragment: ImageAnalysisFragment,
  rule: JpdbRule | undefined,
  vocabulary: JpdbVocabulary | undefined,
}

export default function SvgAnalysisFragment({fragment, rule, vocabulary}: Props) {
  const {scaleX, scaleY, textOrientation, showAnalysis} = useContext(SvgOverlayContext)

  const [mouseOver, setMouseOver] = useState(false)
  const debouncedMouseOver = useDebounce(mouseOver, 40)

  const bounds = scaleRectangle(fragment.bounds, scaleX, scaleY)
  const effectiveTextOrientation = getEffectiveTextOrientation(textOrientation, fragment.orientation)

  return <g
    onMouseEnter={() => setMouseOver(true)}
    onMouseLeave={() => setMouseOver(false)}
  >
    {showAnalysis && rule && <SvgHighlight
      bounds={bounds}
      rule={rule}
      vocabulary={vocabulary}
      textOrientation={effectiveTextOrientation}
      mouseOverGroup={debouncedMouseOver}
    />}
    {fragment.symbols.map((symbol, symbolIndex) =>
      <SvgSymbol
        key={symbolIndex}
        packedSymbol={symbol}
        textOrientation={effectiveTextOrientation}
      />
    )}
  </g>
}
