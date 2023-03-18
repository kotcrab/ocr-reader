import {jpdbRuleSchema} from "./JpdbRule"
import {array, boolean, InferType, number, object, string} from "yup"

export const appSettingsSchema = object({
  readingTimerEnabled: boolean().required(),
  jpdbApiKey: string().required(),
  jpdbMiningDeckId: number().integer().required(),
  jpdbRules: array().of(jpdbRuleSchema).ensure().required(),
  textHookerWebSocketUrl: string().required(),
})

export interface AppSettings extends InferType<typeof appSettingsSchema> {
}
