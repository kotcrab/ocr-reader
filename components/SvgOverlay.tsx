import SvgPolygonList from "./SvgPolygonList"
import SvgWordList from "./SvgWordList"
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
  fontSize: number,
  textOrientation: TextOrientation,
}

export default function SvgOverlay(
  {ocr, analysis, showParagraphs, showText, autoFontSize, fontSize, textOrientation}: Props
) {
  const sizeDiv = 1000
  const scaleX = ocr.width / sizeDiv
  const scaleY = ocr.height / sizeDiv

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
      {!showParagraphs || <SvgPolygonList polygons={ocr.paragraphsPoints} scaleX={scaleX} scaleY={scaleY}/>}
      {analysis && <SvgAnalysisOverlay analysis={analysis} scaleX={scaleX} scaleY={scaleY}/>}
      <SvgWordList
        showText={showText}
        lines={ocr.lines}
        scaleX={scaleX}
        scaleY={scaleY}
        autoFontSize={autoFontSize}
        fontSize={fontSize}
        textOrientation={textOrientation}
      />
    </svg>
  )
}
