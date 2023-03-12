export interface Book {
  readonly title: string,
  readonly author: string,
  readonly baseDir: string,
  readonly appDir: string,
  readonly ocrDir: string,
  readonly infoFile: string,
  readonly readerSettingsFile: string,
  readonly info: BookInfo,
  readonly images: readonly string[],
  readonly ocrFiles: readonly string[],
  readonly ocrDone: boolean,
}

export interface BookInfo {
  id: string,
  description: string,
  notes: string,
  source: string,
  archived: boolean,
  pinned: boolean,
  currentPage: number,
}

export interface BookInfoUpdate {
  description?: string,
  notes?: string,
  source?: string,
  archived?: boolean,
  pinned?: boolean,
}
