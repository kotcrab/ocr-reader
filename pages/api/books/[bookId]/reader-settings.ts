import type {NextApiRequest, NextApiResponse} from "next"
import {ReaderSettings} from "../../../../model/ReaderSettings"
import {services} from "../../../../service/Services"

function getParams(req: NextApiRequest) {
  const {bookId} = req.query
  return {
    bookId: bookId as string,
  }
}

interface Body {
  readerSettings: ReaderSettings | undefined
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

  if (body.readerSettings) {
    const book = await services.bookService.getBookById(bookId)
    await services.storageService.writeReaderSettings(book, body.readerSettings)
    res.status(200).end()
  } else {
    res.status(400).end()
  }
}
