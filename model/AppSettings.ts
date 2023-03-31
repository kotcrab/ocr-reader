import {jpdbRuleSchema} from "./JpdbRule"
import {array, boolean, InferType, mixed, number, object, string} from "yup"
import {PopupPosition} from "./PopupPosition"
import {FloatingPageTurnAction} from "./FloatingPageTurnAction"
import {isValidWebSocketUrl} from "../util/Url"

const floatingPageSchema = object({
  panningVelocity: boolean().required(),
  turnAction: mixed<FloatingPageTurnAction>().oneOf(Object.values(FloatingPageTurnAction)).required(),
  animateTurn: boolean().required(),
  limitToBounds: boolean().required(),
})

export const appSettingsSchema = object({
  readingTimerEnabled: boolean().required(),
  floatingPage: floatingPageSchema.required(),
  jpdbApiKey: string().required().default(""),
  jpdbMiningDeckId: number().integer().required().default(0),
  jpdbHorizontalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbVerticalTextPopupPosition: mixed<PopupPosition>().oneOf(Object.values(PopupPosition)).required(),
  jpdbRules: array().of(jpdbRuleSchema).ensure().required(),
  textHookerWebSocketUrl: string().required()
    .test("websocket-url", "WebSocket URL is not valid", isValidWebSocketUrl),
})

export interface FloatingPageSettings extends InferType<typeof floatingPageSchema> {
}

export interface AppSettings extends InferType<typeof appSettingsSchema> {
}
