import {jpdbRuleSchema} from "./JpdbRule"
import {array, boolean, InferType, mixed, number, object, string} from "yup"
import {PopupPosition} from "./PopupPosition"
import {isValidWebSocketUrl} from "../util/Url"

export const appSettingsSchema = object({
  readingTimerEnabled: boolean().required(),
  jpdbApiKey: string().required().default(""),
  jpdbMiningDeckId: number().integer().required().default(0),
  jpdbHorizontalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbVerticalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbRules: array().of(jpdbRuleSchema).ensure().required(),
  textHookerWebSocketUrl: string().required()
    .test("websocket-url", "WebSocket URL is not valid", isValidWebSocketUrl),
})

export interface AppSettings extends InferType<typeof appSettingsSchema> {
}
