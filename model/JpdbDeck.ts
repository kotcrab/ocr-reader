export interface JpdbDeck {
  readonly id: number,
  readonly name: string,
}

export const JPDB_DECK_API_FIELDS = ["id", "name"]

export function unpackJpdbDeck(packed: any[]): JpdbDeck {
  return {
    id: packed[0],
    name: packed[1],
  }
}

export interface JpdbPackedDecksResult {
  readonly decks: readonly any[][],
}
