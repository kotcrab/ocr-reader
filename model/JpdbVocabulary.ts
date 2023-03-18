import {JpdbCardState} from "./JpdbCardState"

export interface JpdbVocabulary {
  readonly vid: number,
  readonly sid: number,
  readonly rid: number,
  readonly spelling: string,
  readonly reading: string,
  readonly frequencyRank?: number,
  readonly meanings: string[],
  readonly cardStates: JpdbCardState[]
}

export const JPDB_VOCABULARY_API_FIELDS = [
  "vid", "sid", "rid", "spelling", "reading", "frequency_rank", "meanings", "card_state",
]

export function unpackJpdbVocabulary(packed: any[]): JpdbVocabulary {
  return {
    vid: packed[0],
    sid: packed[1],
    rid: packed[2],
    spelling: packed[3],
    reading: packed[4],
    frequencyRank: packed[5],
    meanings: packed[6],
    cardStates: packed[7] ?? [JpdbCardState.NotInDecks],
  }
}
