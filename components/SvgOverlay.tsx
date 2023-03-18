import SvgPolygons from "./SvgPolygons"
import * as React from "react"
import {useEffect, useState} from "react"
import {OcrPage} from "../model/OcrPage"
import SvgAnalysis from "./SvgAnalysis"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {isChromiumBased} from "../util/Util"
import {Dimensions} from "../model/Dimensions"
import {ImageAnalysis} from "../model/ImageAnalysis"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import SvgParagraph from "./SvgParagraph"
import {JpdbRule} from "../model/JpdbRule"

interface Props {
  ocr: OcrPage,
  pageDimensions: Dimensions,
  analysis: ImageAnalysis | undefined,
  jpdbRules: readonly JpdbRule[],
  showParagraphs: boolean,
  showText: boolean,
  showAnalysis: boolean,
  autoFontSize: boolean,
  fontSize: number,
  textOrientation: TextOrientationSetting,
  minimumConfidence: number,
  jpdbMiningDeckId: number,
}

export default function SvgOverlay(
  {
    ocr,
    pageDimensions,
    analysis,
    jpdbRules,
    showParagraphs,
    showText,
    showAnalysis,
    autoFontSize,
    fontSize,
    textOrientation,
    minimumConfidence,
    jpdbMiningDeckId,
  }: Props
) {
  const sizeDiv = 1000
  const scaleX = pageDimensions.w / sizeDiv
  const scaleY = pageDimensions.h / sizeDiv
  const filteredParagraphs = ocr.paragraphs
    .filter(it => it.confidence > minimumConfidence / 100)
  const filteredAnalysisParagraphs = analysis?.paragraphs
    .filter(it => it.confidence > minimumConfidence / 100)
  const paragraphPoints = filteredParagraphs.map(it => it.points)

  const [chromiumBased, setChromiumBased] = useState(false)
  useEffect(() => setChromiumBased(isChromiumBased()), [])

  return (
    <SvgOverlayContext.Provider value={{
      scaleX: scaleX,
      scaleY: scaleY,
      showParagraphs: showParagraphs,
      showText: showText,
      showAnalysis: showAnalysis,
      autoFontSize: autoFontSize,
      fontSize: fontSize,
      textOrientation: textOrientation,
      chromiumBased: chromiumBased,
      jpdbMiningDeckId: jpdbMiningDeckId,
    }}>
      <svg width="100%"
           height="100%"
           viewBox={`0 0 ${sizeDiv} ${sizeDiv}`}
           preserveAspectRatio="none"
           style={{
             position: "absolute",
             bottom: "0px",
             userSelect: "text",
           }}>
        {!showParagraphs || <SvgPolygons polygons={paragraphPoints}/>}
        {analysis ?
          <SvgAnalysis
            paragraphs={filteredAnalysisParagraphs || []}
            vocabulary={analysis.vocabulary}
            rules={jpdbRules}/>
          : filteredParagraphs.map(paragraph => <SvgParagraph key={paragraph.id} lines={paragraph.lines}/>)
        }
      </svg>
    </SvgOverlayContext.Provider>
  )
}
