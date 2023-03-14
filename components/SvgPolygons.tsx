import {pointsToPolygonPoints} from "../util/OverlayUtil"
import * as React from "react"
import {useContext} from "react"
import {SvgOverlayContext} from "../util/SvgOverlayContext"

interface Props {
  polygons: (readonly number[])[],
}

export default function SvgPolygons({polygons}: Props) {
  const {scaleX, scaleY} = useContext(SvgOverlayContext)

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
