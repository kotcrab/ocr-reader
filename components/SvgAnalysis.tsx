import {effectiveTextOrientation, scaleRectangle} from "../util/OverlayUtil"
import * as React from "react"
import {useContext} from "react"
import {JpdbCardState} from "../model/JpdbCardState"
import {ImageAnalysisParagraph} from "../model/ImageAnalysis"
import {getJpdbVocabularyCardStates, JpdbVocabulary} from "../model/JpdbVocabulary"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import SvgSymbol from "./SvgSymbol"

interface Props {
  paragraphs: readonly ImageAnalysisParagraph[],
  vocabulary: readonly JpdbVocabulary[],
  showAnalysis: boolean,
}

export default function SvgAnalysis({paragraphs, vocabulary, showAnalysis}: Props) {
  const {scaleX, scaleY, textOrientation} = useContext(SvgOverlayContext)

  return <>{
    paragraphs.flatMap(paragraph =>
      paragraph.fragments.flatMap((fragment, fragmentIndex) => {
        const bounds = scaleRectangle(fragment.bounds, scaleX, scaleY)
        const color = getColorForState(getJpdbVocabularyCardStates(vocabulary, fragment.vocabularyIndex))
        return <g key={`ag-${paragraph.id}-${fragmentIndex}`}>
          {color && showAnalysis ? <rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.w}
            height={bounds.h}
            style={{fill: color}}
          /> : null}
          {fragment.symbols.map((symbol, symbolIndex) =>
            <SvgSymbol
              key={`as-${paragraph.id}-${fragmentIndex}-${symbolIndex}`}
              packedSymbol={symbol}
              textOrientation={effectiveTextOrientation(textOrientation, fragment.orientation)}
            />
          )}
        </g>
      })
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
