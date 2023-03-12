import {pointsToPolygonPoints} from "../util/OverlayUtil"
import * as React from "react"

interface Props {
  polygons: (readonly number[])[],
  scaleX: number,
  scaleY: number,
}

export default function SvgPolygonList({polygons, scaleX, scaleY}: Props) {
  return <>{
    polygons.map((points, index) =>
      <polygon
        key={`p-${index}`}
        points={pointsToPolygonPoints(points, scaleX, scaleY)}
        style={{fill: "rgba(255, 255, 255, .3)"}}
      />
    )
  }</>
}
