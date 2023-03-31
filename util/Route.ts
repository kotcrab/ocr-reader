export function homeRoute(): string {
  return "/"
}

export function homeArchiveRoute(): string {
  return "/?archived"
}

export function textHookerRoute(): string {
  return "/text-hooker"
}

export function settingsRoute(): string {
  return "/settings"
}

export function readBookRoute(bookId: string, page: number): string {
  return `/read/${bookId}/${page}`
}

export function notFoundRoute(): string {
  return "/404"
}
