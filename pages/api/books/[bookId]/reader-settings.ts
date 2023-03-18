import type {NextApiRequest, NextApiResponse} from "next"
import {ReaderSettings, readerSettingsSchema} from "../../../../model/ReaderSettings"
import {services} from "../../../../service/Services"
import {validatePost} from "../../../../util/Validate"

function getParams(req: NextApiRequest) {
  const {bookId} = req.query
  return {
    bookId: bookId as string,
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {bookId} = getParams(req)
  const readerSettings = req.body as ReaderSettings
  const book = await services.bookService.getBookById(bookId)
  await services.settingsService.updateReaderSettings(book, readerSettings)
  res.status(200).end()
}

export default validatePost(readerSettingsSchema, handler)
