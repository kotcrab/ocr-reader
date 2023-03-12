import {scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {AnalysisResults} from "../model/AnalysisResults"
import {JpdbCardState} from "../model/JpdbCardState"

interface Props {
  analysis: AnalysisResults,
  scaleX: number,
  scaleY: number,
}

export default function SvgAnalysisOverlay({analysis, scaleX, scaleY}: Props) {
  return <>{
    analysis.results.flatMap((result, resultIndex) =>
      result.bounds.flatMap((rectangle, index) => {
        const bounds = scaleRectangle(rectangle, scaleX, scaleY)
        const color = getColorForState(result.state)
        if (!color) {
          return null
        }
        return <rect
          key={`a-${resultIndex}-${index}`}
          x={bounds.x}
          y={bounds.y}
          width={bounds.w}
          height={bounds.h}
          style={{fill: color}}
        />
      })
    )
  }</>
}

function getColorForState(state: JpdbCardState) {
  switch (state) {
    case JpdbCardState.Learning:
      return "rgba(74,231,129,0.15)"
    case JpdbCardState.Locked:
    case JpdbCardState.NotInDeck:
      return "rgba(84,65,67,0.15)"
    case JpdbCardState.New:
      return "rgba(32,48,145,0.15)"
    default:
      return null
  }
}
