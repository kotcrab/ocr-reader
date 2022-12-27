import SvgPolygonList from "./SvgPolygonList"
import SvgWordList from "./SvgWordList"
import * as React from "react"
import {PageOcrResults} from "../model/PageOcrResults"
import {AnalysisResults} from "../model/AnalysisResults"
import SvgAnalysisOverlay from "./SvgAnalysisOverlay"

interface Props {
  ocr: PageOcrResults,
  analysis?: AnalysisResults,
  showParagraphs: boolean,
  showText: boolean,
  fontSize: number,
}

export default function SvgOverlay({ocr, analysis, showParagraphs, showText, fontSize}: Props) {
  const sizeDiv = 1000
  const scaleX = ocr.width / sizeDiv
  const scaleY = ocr.height / sizeDiv

  const blocks = ocr.annotations.pages?.[0].blocks || []
  const paragraphs = blocks.flatMap((block) =>
    block?.paragraphs?.flatMap((paragraph) =>
      paragraph.boundingBox || []
    ) || []
  )
  const words = blocks.flatMap((block) =>
    block?.paragraphs?.flatMap((paragraph) =>
      paragraph.words || []
    ) || []
  )

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
      {!showParagraphs || <SvgPolygonList polys={paragraphs} scaleX={scaleX} scaleY={scaleY}/>}
      {analysis && <SvgAnalysisOverlay analysis={analysis} scaleX={scaleX} scaleY={scaleY}/>}
      <SvgWordList showText={showText} words={words} scaleX={scaleX} scaleY={scaleY} fontSize={fontSize}/>
    </svg>
  )
}
