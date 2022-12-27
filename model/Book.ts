export interface Book {
  readonly title: string,
  readonly author: string,
  readonly baseDir: string,
  readonly appDir: string,
  readonly ocrDir: string,
  readonly infoFile: string,
  readonly info: BookInfo,
  readonly images: string[],
  readonly ocrFiles: string[],
  readonly ocrDone: boolean,
}

export interface BookInfo {
  id: string,
  description: string,
  archived: boolean,
  currentPage: number,
}
