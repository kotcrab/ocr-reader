import {createContext} from "react"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {PopupPosition} from "../model/PopupPosition"

export const SvgOverlayContext = createContext({
  scaleX: 1,
  scaleY: 1,
  showParagraphs: false,
  showText: false,
  showAnalysis: false,
  autoFontSize: true,
  fontSize: 1,
  textOrientation: TextOrientationSetting.Auto,
  chromiumBased: false,
  jpdbMiningDeckId: 0,
  jpdbHorizontalTextPopupPosition: PopupPosition.AboveText,
  jpdbVerticalTextPopupPosition: PopupPosition.AboveText,
})
