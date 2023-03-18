import * as React from "react"
import {useContext} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {Rectangle} from "../model/Rectangle"
import {JpdbRule} from "../model/JpdbRule"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import {rgba} from "color2k"
import JpdbPopupWrapper from "./JpdbPopupWrapper"

interface Props {
  bounds: Rectangle,
  rule: JpdbRule,
  vocabulary: JpdbVocabulary | undefined,
  mouseOverGroup: boolean,
}

export default function SvgHighlight({bounds, rule, vocabulary, mouseOverGroup}: Props) {
  const {jpdbMiningDeckId} = useContext(SvgOverlayContext)

  return <JpdbPopupWrapper
    placement="right"
    rule={rule}
    vocabulary={vocabulary}
    miningDeckId={jpdbMiningDeckId}
    mouseOverReference={mouseOverGroup}
    wrapper={(ref) => <rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.w}
      height={bounds.h}
      style={{fill: rule.overlayColor || rgba(0, 0, 0, 0)}}
      ref={ref}
    />}
  />
}
