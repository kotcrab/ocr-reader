import * as React from "react"
import {ImageAnalysisParagraph} from "../model/ImageAnalysis"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import SvgAnalysisFragment from "./SvgAnalysisFragment"
import {JpdbRule} from "../model/JpdbRule"
import {evaluateJpdbRules} from "../util/JpdbUitl"

interface Props {
  paragraphs: readonly ImageAnalysisParagraph[],
  vocabulary: readonly JpdbVocabulary[],
  rules: readonly JpdbRule[],
  showAnalysis: boolean,
}

export default function SvgAnalysis({paragraphs, vocabulary, rules, showAnalysis}: Props) {
  return <>{
    paragraphs.flatMap(paragraph =>
      paragraph.fragments.flatMap((fragment, fragmentIndex) =>
        <SvgAnalysisFragment
          key={`${paragraph.id}-${fragmentIndex}`}
          fragment={fragment}
          rule={evaluateJpdbRules(rules, vocabulary[fragment.vocabularyIndex])}
          showAnalysis={showAnalysis}
          vocabulary={vocabulary[fragment.vocabularyIndex]}
        />
      )
    )
  }</>
}
