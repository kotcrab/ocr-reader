import {JpdbCardState} from "../model/JpdbCardState"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {JpdbRule} from "../model/JpdbRule"

export const JPDB_BASE = "https://jpdb.io"

export function evaluateJpdbRules(
  rules: readonly JpdbRule[],
  vocabulary: JpdbVocabulary | undefined
): JpdbRule | undefined {
  const states = vocabulary?.cardStates || [JpdbCardState.Unparsed]
  for (const rule of rules) {
    if (!rule.enabled) {
      continue
    }
    if (rule.states.length == 0) {
      return rule
    }
    if (states.some(it => rule.states.includes(it))) {
      return rule
    }
  }
  return undefined
}
