import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../service/Services"
import {boolean, InferType, number, object} from "yup"
import {bookInfoUpdateSchema} from "../../../model/BookInfoUpdate"
import {validatePost} from "../../../util/Validate"

function getParams(req: NextApiRequest) {
  const {bookId} = req.query
  return {
    bookId: bookId as string,
  }
}

const bodySchema = object({
  ocr: boolean(),
  currentPage: number().integer(),
  info: bookInfoUpdateSchema,
})
type Body = InferType<typeof bodySchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

export default validatePost(bodySchema, handler)
