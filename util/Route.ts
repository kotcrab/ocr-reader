export function homeRoute(): string {
  return "/"
}

export function readBookRoute(bookId: string, page: number): string {
  return `/read/${bookId}/${page}`
}
