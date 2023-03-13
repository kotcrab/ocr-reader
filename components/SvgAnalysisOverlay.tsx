import {scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {JpdbCardState} from "../model/JpdbCardState"
import {ImageAnalysisResult} from "../model/ImageAnalysisResults"
import {getJpdbVocabularyCardStates} from "../model/JpdbVocabulary"

interface Props {
  analysis: ImageAnalysisResult,
  scaleX: number,
  scaleY: number,
}

export default function SvgAnalysisOverlay({analysis, scaleX, scaleY}: Props) {
  return <>{
    analysis.paragraphs.flatMap((paragraph, paragraphIndex) =>
      paragraph.fragments.flatMap((fragment, fragmentIndex) =>
        fragment.bounds.flatMap((rectangle, index) => {
          const bounds = scaleRectangle(rectangle, scaleX, scaleY)
          const color = getColorForState(getJpdbVocabularyCardStates(analysis.vocabulary, fragment.vocabularyIndex))
          if (!color) {
            return null
          }
          return <rect
            key={`a-${paragraphIndex}-${fragmentIndex}-${index}`}
            x={bounds.x}
            y={bounds.y}
            width={bounds.w}
            height={bounds.h}
            style={{fill: color}}
          />
        })
      )
    )
  }</>
}

function getColorForState(states: JpdbCardState[]) {
  switch (states[0]) {
    case JpdbCardState.Learning:
      return "rgba(74,231,129,0.15)"
    case JpdbCardState.Locked:
    case JpdbCardState.NotInDeck:
      return "rgba(84,65,67,0.15)"
    case JpdbCardState.New:
      return "rgba(32,48,145,0.15)"
    default:
      return null
  }
}
