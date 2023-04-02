import {PageDisplay} from "../model/PageDisplay"

export function calculatePageStep(page: number, pageDisplay: PageDisplay): number {
  if (isCurrentPageCoverOrOnePageDisplay(page, pageDisplay)) {
    return 1
  }
  return 2
}

export function calculateWantedPages(page: number, totalPages: number, pageDisplay: PageDisplay): number[] {
  return calculateIdealWantedPages(page, pageDisplay)
    .filter(it => it >= 0 && it < totalPages)
}

function calculateIdealWantedPages(page: number, pageDisplay: PageDisplay): number[] {
  if (isCurrentPageCoverOrOnePageDisplay(page, pageDisplay)) {
    return [page]
  }
  const offset = pageDisplay === PageDisplay.TwoPagesWithCover ? 1 : 0
  const lowPage = Math.floor((page + offset) / 2) * 2 - offset
  return [lowPage, lowPage + 1]
}

export function isCurrentPageCoverOrOnePageDisplay(page: number, pageDisplay: PageDisplay): boolean {
  return pageDisplay === PageDisplay.OnePage || (pageDisplay === PageDisplay.TwoPagesWithCover && page === 0)
}
