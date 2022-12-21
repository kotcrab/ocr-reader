export interface OcrJob {
  running: boolean,
  currentImage: number,
  totalImages: number,
}

export function emptyOcrJob(): OcrJob {
  return {
    running: false,
    currentImage: 0,
    totalImages: 0,
  }
}
