import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../../service/Services"
import {validateGet} from "../../../../util/Validate"

function getParams(req: NextApiRequest) {
  const {bookId, removeLineBreaks} = req.query
  return {
    bookId: bookId as string,
    removeLineBreaks: removeLineBreaks === "true",
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {bookId, removeLineBreaks} = getParams(req)

  res.status(200).send(await services.bookService.getBookTextDump(bookId, removeLineBreaks))
}

export default validateGet(handler)
