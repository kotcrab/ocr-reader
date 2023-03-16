import * as React from "react"
import {useState} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {Rectangle} from "../model/Rectangle"
import {Portal, usePopper,} from "@chakra-ui/react"
import {JpdbPopupDialog} from "./JpdbPopup"
import {JpdbRule} from "../model/JpdbRule"
import {JpdbPopup} from "../model/JpdbPopup"

interface Props {
  bounds: Rectangle,
  rule: JpdbRule,
  vocabulary?: JpdbVocabulary,
  mouseOverGroup: boolean,
}

export default function SvgHighlight({bounds, rule, vocabulary, mouseOverGroup}: Props) {
  const {popperRef, referenceRef} = usePopper({placement: "right"})

  const [mouseOverPopup, setMouseOverPopup] = useState(false)

  const popupOpen = mouseOverGroup || mouseOverPopup
  const popupPossible = vocabulary && rule.popup !== JpdbPopup.None

  return <>
    <rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.w}
      height={bounds.h}
      style={{fill: rule.overlayColor}}
      ref={referenceRef}
    />
    {popupOpen && popupPossible && <Portal>
      <JpdbPopupDialog
        ref={popperRef}
        vocabulary={vocabulary}
        compact={rule.popup === JpdbPopup.Compact}
        onMouseOver={(over) => setMouseOverPopup(over)}
      />
    </Portal>
    }
  </>
}
