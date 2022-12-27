import {calculateBoundingRectangle} from "../util/OverlayUtil"
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
      result.vertices.flatMap((vertices, index) => {
        const rect = calculateBoundingRectangle(vertices, scaleX, scaleY)
        return <rect
          key={`a-${resultIndex}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          style={{fill: getColorForStatus(result.status)}}
        />
      })
    )
  }</>
}

function getColorForStatus(status: WordStatus) {
  switch (status) {
    case WordStatus.Learning:
      return "rgba(74,231,129,0.3)"
    case WordStatus.Locked:
      return "rgba(84,65,67,0.3)"
    case WordStatus.New:
      return "rgba(32,48,145,0.3)"
    default:
      return "rgba(255,0,255,0.3)"
  }
}
