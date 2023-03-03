import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../service/Services"
import {BookInfoUpdate} from "../../../model/Book"

function getParams(req: NextApiRequest) {
  const {bookId} = req.query
  return {
    bookId: bookId as string,
  }
}

interface Body {
  ocr: boolean | undefined
  currentPage: number | undefined
  info: BookInfoUpdate | undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(400).end()
    return
  }
  const {bookId} = getParams(req)
  const body = req.body as Body

  if (body.ocr) {
    res.status(200).end()
    await services.bookService.ocrBook(bookId)
  } else if (body.currentPage) {
    await services.bookService.updateBookProgress(bookId, body.currentPage)
    res.status(200).end()
  } else if (body.info) {
    await services.bookService.updateBookInfo(bookId, body.info)
    res.status(200).end()
  } else {
    res.status(400).end()
  }
}
