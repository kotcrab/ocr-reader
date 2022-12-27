import {google} from "@google-cloud/vision/build/protos/protos"
import {verticesToPolygonPoints} from "../util/OverlayUtil"
import * as React from "react"
import IBoundingPoly = google.cloud.vision.v1.IBoundingPoly

interface Props {
  polys: IBoundingPoly[],
  scaleX: number,
  scaleY: number,
}

export default function SvgPolygonList({polys, scaleX, scaleY}: Props) {
  return <>{
    polys.map((poly, index) =>
      <polygon key={`p-${index}`}
               points={verticesToPolygonPoints(poly?.vertices || [], scaleX, scaleY)}
               style={{fill: "rgba(255, 255, 255, .3)"}}
      />
    )
  }</>
}
