import {array, boolean, InferType, mixed, object, string} from "yup"
import {JpdbCardState} from "./JpdbCardState"
import {JpdbPopup} from "./JpdbPopup"

export const jpdbRuleSchema = object({
  enabled: boolean().required(),
  states: array(
    mixed<JpdbCardState>().oneOf(Object.values(JpdbCardState)).required()
  ).ensure().required(),
  overlayColor: string().length(9).matches(/^#[0-9a-f]{6,8}$/i),
  textColor: string().length(9).matches(/^#[0-9a-f]{6,8}$/i),
  popup: mixed<JpdbPopup>().oneOf(Object.values(JpdbPopup)).default(JpdbPopup.None),
})

export interface JpdbRule extends InferType<typeof jpdbRuleSchema> {
}
