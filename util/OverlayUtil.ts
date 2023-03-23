import {google} from "@google-cloud/vision/build/protos/protos"
import {Rectangle} from "../model/Rectangle"
import IVertex = google.cloud.vision.v1.IVertex
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {TextOrientation, textOrientationFromSetting} from "../model/TextOrientation"

export function scaleRectangle(rectangle: Rectangle, scaleX: number, scaleY: number): Rectangle {
  return {
    x: rectangle.x / scaleX,
    y: rectangle.y / scaleY,
    w: rectangle.w / scaleX,
    h: rectangle.h / scaleY,
  }
}

export function calculateBoundingRectangle(vertices: IVertex[]): Rectangle {
  let minX = Number.MAX_VALUE
  let maxX = -Number.MAX_VALUE
  let minY = Number.MAX_VALUE
  let maxY = -Number.MAX_VALUE

  for (const v of vertices) {
    minX = Math.min(minX, v.x!)
    maxX = Math.max(maxX, v.x!)
    minY = Math.min(minY, v.y!)
    maxY = Math.max(maxY, v.y!)
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

export function unionRectangles(rectangles: Rectangle[]): Rectangle {
  let minX = Number.MAX_VALUE
  let maxX = -Number.MAX_VALUE
  let minY = Number.MAX_VALUE
  let maxY = -Number.MAX_VALUE

  for (const r of rectangles) {
    minX = Math.min(minX, r.x)
    maxX = Math.max(maxX, r.x + r.w)
    minY = Math.min(minY, r.y)
    maxY = Math.max(maxY, r.y + r.h)
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

export function pointsToPolygonPoints(points: readonly number[], scaleX: number, scaleY: number): string {
  let polygon = ""
  for (let i = 0; i < points.length; i += 2) {
    polygon += `${points[i] / scaleX},${points[i + 1] / scaleY},`
  }
  return polygon.substring(0, polygon.length - 1)
}

export function getEffectiveTextOrientation(setting: TextOrientationSetting, detected: TextOrientation) {
  return setting == TextOrientationSetting.Auto ? detected : textOrientationFromSetting(setting)
}
