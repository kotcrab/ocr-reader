import {createContext} from "react"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import {PopupPosition} from "../model/PopupPosition"

export const SvgOverlayContext = createContext({
  scaleX: 1,
  scaleY: 1,
  chromiumBased: false,
  showParagraphs: false,
  showText: false,
  showAnalysis: false,
  autoFontSize: true,
  fontSize: 1,
  textOrientation: TextOrientationSetting.Auto,
  jpdbMiningDeckId: 0,
  jpdbHorizontalTextPopupPosition: PopupPosition.AboveText,
  jpdbVerticalTextPopupPosition: PopupPosition.AboveText,
})
