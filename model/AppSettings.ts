import {jpdbRuleSchema} from "./JpdbRule"
import {array, boolean, InferType, mixed, number, object, string} from "yup"
import {PopupPosition} from "./PopupPosition"

export const appSettingsSchema = object({
  readingTimerEnabled: boolean().required(),
  jpdbApiKey: string().required(),
  jpdbMiningDeckId: number().integer().required(),
  jpdbHorizontalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbVerticalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbRules: array().of(jpdbRuleSchema).ensure().required(),
  textHookerWebSocketUrl: string().required(),
})

export interface AppSettings extends InferType<typeof appSettingsSchema> {
}
