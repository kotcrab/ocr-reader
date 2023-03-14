import * as React from "react"
import {JpdbCardState} from "../model/JpdbCardState"
import {ImageAnalysisParagraph} from "../model/ImageAnalysis"
import {getJpdbVocabularyCardStates, JpdbVocabulary} from "../model/JpdbVocabulary"
import SvgAnalysisFragment from "./SvgAnalysisFragment"

interface Props {
  paragraphs: readonly ImageAnalysisParagraph[],
  vocabulary: readonly JpdbVocabulary[],
  showAnalysis: boolean,
}

export default function SvgAnalysis({paragraphs, vocabulary, showAnalysis}: Props) {
  return <>{
    paragraphs.flatMap(paragraph =>
      paragraph.fragments.flatMap((fragment, fragmentIndex) =>
        <SvgAnalysisFragment
          key={`ag-${paragraph.id}-${fragmentIndex}`}
          fragment={fragment}
          color={getColorForState(getJpdbVocabularyCardStates(vocabulary, fragment.vocabularyIndex))}
          showAnalysis={showAnalysis}
          vocabulary={vocabulary[fragment.vocabularyIndex]}
        />
      )
    )
  }</>
}

function getColorForState(states: JpdbCardState[]): string | undefined {
  switch (states[0]) {
    case JpdbCardState.Learning:
      return "rgba(74,231,129,0.15)"
    case JpdbCardState.Locked:
    case JpdbCardState.NotInDeck:
      return "rgba(84,65,67,0.15)"
    case JpdbCardState.New:
      return "rgba(32,48,145,0.15)"
    default:
      return undefined
  }
}
