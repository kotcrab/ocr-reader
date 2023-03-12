export interface JpdbToken {
  readonly vocabularyIndex: number,
  readonly position: number,
  readonly length: number,
}

export const JPDB_TOKEN_API_FIELDS = ["vocabulary_index", "position_utf16", "length_utf16"]

export function unpackJpdbToken(packed: any[]): JpdbToken {
  return {
    vocabularyIndex: packed[0],
    position: packed[1],
    length: packed[2],
  }
}
