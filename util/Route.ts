export function homeRoute(): string {
  return "/"
}

export function textHookerRoute(): string {
  return "/text-hooker"
}

export function readBookRoute(bookId: string, page: number): string {
  return `/read/${bookId}/${page}`
}
