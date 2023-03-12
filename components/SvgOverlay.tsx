import SvgPolygonList from "./SvgPolygonList"
import SvgParagraph from "./SvgParagraph"
import * as React from "react"
import {useEffect, useState} from "react"
import {PageOcrResults} from "../model/PageOcrResults"
import {AnalysisResults} from "../model/AnalysisResults"
import SvgAnalysisOverlay from "./SvgAnalysisOverlay"
import {TextOrientation} from "../model/TextOrientation"
import {isChromiumBased} from "../util/Util"
import {Dimensions} from "../model/Dimensions"

interface Props {
  ocr: PageOcrResults,
  pageDimensions: Dimensions,
  analysis?: AnalysisResults,
  showParagraphs: boolean,
  showText: boolean,
  autoFontSize: boolean,
  textOrientation: TextOrientation,
  fontSize: number,
  minimumConfidence: number,
}

export default function SvgOverlay(
  {
    ocr,
    pageDimensions,
    analysis,
    showParagraphs,
    showText,
    autoFontSize,
    textOrientation,
    fontSize,
    minimumConfidence,
  }: Props) {
  const sizeDiv = 1000
  const scaleX = pageDimensions.w / sizeDiv
  const scaleY = pageDimensions.h / sizeDiv
  const filteredParagraphs = ocr.paragraphs
    .filter(it => it.confidence > minimumConfidence / 100)
  const paragraphPoints = filteredParagraphs.map(it => it.points)

  const [chromiumBased, setChromiumBased] = useState(false)
  useEffect(() => setChromiumBased(isChromiumBased()), [])

  return (
    <svg width="100%"
         height="100%"
         viewBox={`0 0 ${sizeDiv} ${sizeDiv}`}
         preserveAspectRatio="none"
         style={{
           position: "absolute",
           bottom: "0px",
           userSelect: "text",
         }}>
      {!showParagraphs || <SvgPolygonList polygons={paragraphPoints} scaleX={scaleX} scaleY={scaleY}/>}
      {analysis && <SvgAnalysisOverlay analysis={analysis} scaleX={scaleX} scaleY={scaleY}/>}
      {filteredParagraphs.map(paragraph =>
        <SvgParagraph
          key={paragraph.id}
          showText={showText}
          lines={paragraph.lines}
          scaleX={scaleX}
          scaleY={scaleY}
          autoFontSize={autoFontSize}
          fontSize={fontSize}
          textOrientation={textOrientation}
          chromiumBased={chromiumBased}
        />
      )}
    </svg>
  )
}
