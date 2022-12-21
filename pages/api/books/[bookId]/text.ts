import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../../service/Services"

function getParams(req: NextApiRequest) {
  const {bookId, removeLineBreaks} = req.query
  return {
    bookId: bookId as string,
    removeLineBreaks: removeLineBreaks === "true",
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(400).end()
  }
  const {bookId, removeLineBreaks} = getParams(req)

  res.status(200).send(await services.bookService.getBookTextDump(bookId, removeLineBreaks))
}
