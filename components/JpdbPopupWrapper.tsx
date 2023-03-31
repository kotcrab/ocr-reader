import * as React from "react"
import {useState} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {Portal, usePopper} from "@chakra-ui/react"
import {JpdbPopupDialog} from "./JpdbPopupDialog"
import {JpdbRule} from "../model/JpdbRule"
import {JpdbPopup} from "../model/JpdbPopup"
import {PopupPosition} from "../model/PopupPosition"

interface Props {
  rule: JpdbRule,
  vocabulary: JpdbVocabulary | undefined,
  miningDeckId: number,
  position: PopupPosition,
  mouseOverRef: boolean,
  wrapper: (ref: React.Ref<any>) => JSX.Element,
}

export default function JpdbPopupWrapper(
  {
    rule,
    vocabulary,
    miningDeckId,
    position,
    mouseOverRef,
    wrapper,
  }: Props
) {
  const {popperRef, referenceRef} = usePopper({placement: positionToPlacement(position)})

  const [mouseOverPopup, setMouseOverPopup] = useState(false)

  const popupOpen = mouseOverRef || mouseOverPopup
  const popupPossible = vocabulary && rule.popup !== JpdbPopup.None

  return <>
    {wrapper(referenceRef)}
    {popupOpen && popupPossible && <Portal>
      <JpdbPopupDialog
        ref={popperRef}
        vocabulary={vocabulary}
        miningDeckId={miningDeckId}
        compact={rule.popup === JpdbPopup.Compact}
        onMouseOver={(over) => setMouseOverPopup(over)}
      />
    </Portal>
    }
  </>
}

function positionToPlacement(position: PopupPosition) {
  switch (position) {
    case PopupPosition.BelowText:
      return "bottom"
    case PopupPosition.AboveText:
      return "top"
    case PopupPosition.LeftOfText:
      return "left"
    case PopupPosition.RightOfText:
      return "right"
  }
  throw new Error("Unhandled popup position")
}
