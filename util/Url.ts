export function analyzeTextUrl(text: string): string {
  return `/api/analyze?text=${text}`
}

export function appSettingsUrl(): string {
  return "/api/settings"
}

export function booksUrl(): string {
  return "/api/books"
}

export function bookUrl(bookId: string): string {
  return `/api/books/${bookId}`
}

export function bookReaderSettingsUrl(bookId: string): string {
  return `/api/books/${bookId}/reader-settings`
}

export function bookTextDumpUrl(bookId: string, removeLineBreaks: Boolean): string {
  return `/api/books/${bookId}/text?removeLineBreaks=${removeLineBreaks}`
}

export function bookThumbnailUrl(bookId: string): string {
  return `/api/books/${bookId}/pages/0`
}

export function bookPageUrl(bookId: string, page: number): string {
  return `/api/books/${bookId}/pages/${page}`
}

export function bookAnalyzePageUrl(bookId: string, page: number): string {
  return `/api/books/${bookId}/pages/${page}?analyze=true`
}

export function decksUrl(): string {
  return "/api/decks"
}

export function isValidWebSocketUrl(value: string) {
  let url
  try {
    url = new URL(value)
  } catch (_) {
    return false
  }
  return url.protocol === "ws:" || url.protocol === "wss:"
}

export function isValidWebUrl(value: string) {
  let url
  try {
    url = new URL(value)
  } catch (_) {
    return false
  }
  return url.protocol === "http:" || url.protocol === "https:"
}
