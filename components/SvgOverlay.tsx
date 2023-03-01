import SvgPolygonList from "./SvgPolygonList"
import SvgParagraph from "./SvgParagraph"
import * as React from "react"
import {PageOcrResults} from "../model/PageOcrResults"
import {AnalysisResults} from "../model/AnalysisResults"
import SvgAnalysisOverlay from "./SvgAnalysisOverlay"
import {TextOrientation} from "../model/TextOrientation"

interface Props {
  ocr: PageOcrResults,
  analysis?: AnalysisResults,
  showParagraphs: boolean,
  showText: boolean,
  autoFontSize: boolean,
  textOrientation: TextOrientation,
  fontSize: number,
  minimumConfidence: number,
}

export default function SvgOverlay(
  {ocr, analysis, showParagraphs, showText, autoFontSize, textOrientation, fontSize, minimumConfidence}: Props
) {
  const sizeDiv = 1000
  const scaleX = ocr.width / sizeDiv
  const scaleY = ocr.height / sizeDiv
  const filteredParagraphs = ocr.paragraphs
    .filter(it => it.confidence > minimumConfidence / 100)
  const paragraphPoints = filteredParagraphs.map(it => it.points)
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
        />
      )}
    </svg>
  )
}
