export function readBookRoute(bookId: string, page: number): string {
  return `/read/${bookId}/${page}`
}
