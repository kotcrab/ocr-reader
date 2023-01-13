import {calculateBoundingRectangle, scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {AnalysisResults} from "../model/AnalysisResults"
import {WordStatus} from "../model/WordStatus"

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
        return <rect
          key={`a-${resultIndex}-${index}`}
          x={bounds.x}
          y={bounds.y}
          width={bounds.w}
          height={bounds.h}
          style={{fill: getColorForStatus(result.status)}}
        />
      })
    )
  }</>
}

function getColorForStatus(status: WordStatus) {
  switch (status) {
    case WordStatus.Learning:
      return "rgba(74,231,129,0.15)"
    case WordStatus.Locked:
    case WordStatus.NotInDeck:
      return "rgba(84,65,67,0.15)"
    case WordStatus.New:
      return "rgba(32,48,145,0.15)"
    default:
      return "rgba(255,0,255,0.15)"
  }
}
