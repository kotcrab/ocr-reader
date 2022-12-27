import {google} from "@google-cloud/vision/build/protos/protos"
import IVertex = google.cloud.vision.v1.IVertex
import {BoundingRectangle} from "../model/BoundingRectangle"

export function calculateBoundingRectangle(vertices: IVertex[], scaleX: number, scaleY: number): BoundingRectangle {
  let minX = Number.MAX_VALUE
  let maxX = -Number.MAX_VALUE
  let minY = Number.MAX_VALUE
  let maxY = -Number.MAX_VALUE

  for (const v of vertices) {
    minX = Math.min(minX, v.x! / scaleX)
    maxX = Math.max(maxX, v.x! / scaleX)
    minY = Math.min(minY, v.y! / scaleY)
    maxY = Math.max(maxY, v.y! / scaleY)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function verticesToPolygonPoints(vertices: IVertex[], scaleX: number, scaleY: number): string {
  let points = ""
  for (const v of vertices) {
    points += `${v.x! / scaleX},${v.y! / scaleY},`
  }
  return points.substring(0, points.length - 1)
}
