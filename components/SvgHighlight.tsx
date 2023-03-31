import * as React from "react"
import {useContext} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {Rectangle} from "../model/Rectangle"
import {JpdbRule} from "../model/JpdbRule"
import {SvgOverlayContext} from "../util/SvgOverlayContext"
import {rgba} from "color2k"
import JpdbPopupWrapper from "./JpdbPopupWrapper"
import {TextOrientation} from "../model/TextOrientation"

interface Props {
  bounds: Rectangle,
  rule: JpdbRule,
  vocabulary: JpdbVocabulary | undefined,
  textOrientation: TextOrientation,
  mouseOverGroup: boolean,
}

export default function SvgHighlight({bounds, rule, vocabulary, textOrientation, mouseOverGroup}: Props) {
  const {
    jpdbMiningDeckId,
    jpdbHorizontalTextPopupPosition,
    jpdbVerticalTextPopupPosition,
  } = useContext(SvgOverlayContext)

  return <JpdbPopupWrapper
    rule={rule}
    vocabulary={vocabulary}
    miningDeckId={jpdbMiningDeckId}
    position={textOrientation == TextOrientation.Horizontal ? jpdbHorizontalTextPopupPosition : jpdbVerticalTextPopupPosition}
    mouseOverRef={mouseOverGroup}
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
