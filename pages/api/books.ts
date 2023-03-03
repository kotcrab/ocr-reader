import type {NextApiRequest, NextApiResponse} from "next"
import {BookResponse} from "../../model/BookResponse"
import {services} from "../../service/Services"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookResponse[]>
) {
  if (req.method === "GET") {
    res.status(200).json(await services.bookService.getAllBooks())
  } else if (req.method === "POST") {
    await services.bookService.scanBooks()
    res.status(200).end()
  } else {
    res.status(400).end()
  }
}
