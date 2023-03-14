import {TextOrientationSetting} from "./TextOrientationSetting"

export enum TextOrientation {
  Vertical,
  Horizontal,
}

export function textOrientationFromSetting(textOrientation: TextOrientationSetting): TextOrientation {
  switch (textOrientation) {
    case TextOrientationSetting.Vertical:
      return TextOrientation.Vertical
    case TextOrientationSetting.Horizontal:
      return TextOrientation.Horizontal
    default:
      throw new Error("Unsupported text orientation")
  }
}
