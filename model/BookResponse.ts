import {Book} from "./Book"

export interface BookResponse {
  readonly id: string,
  readonly title: string,
  readonly author: string,
  readonly description: string,
  readonly archived: boolean,
  readonly currentPage: number,
  readonly pages: number,
  readonly ocrDone: boolean,
}

export function bookToBookResponse(book: Book): BookResponse {
  return {
    id: book.info.id,
    title: book.title,
    author: book.author,
    description: book.info.description,
    archived: book.info.archived,
    currentPage: book.info.currentPage,
    pages: book.images.length,
    ocrDone: book.ocrDone,
  }
}
