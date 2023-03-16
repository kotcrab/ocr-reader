import {JpdbRule} from "./JpdbRule"

export interface AppSettings {
  readonly readingTimerEnabled: boolean,
  readonly jpdbApiKey: string,
  readonly jpdbMiningDeckId: number,
  readonly jpdbRules: JpdbRule[],
  readonly textHookerWebSocketUrl: string,
}
