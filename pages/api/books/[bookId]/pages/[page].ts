import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../../../service/Services"
import * as fs from "fs"

function getParams(req: NextApiRequest) {
  const {bookId, page, ocr} = req.query
  return {
    bookId: bookId as string,
    page: parseInt(page as string),
    ocr: ocr === "true",
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(400).end()
  }
  const {bookId, page, ocr} = getParams(req)

  if (ocr) {
    res.status(200).json(await services.bookService.getBookOcrResults(bookId, page))
    return
  }

  const imagePath = await services.bookService.getBookImage(bookId, page)
  const stat = await fs.promises.stat(imagePath)
  res.writeHead(200, {"Content-Length": stat.size})
  fs.createReadStream(imagePath).pipe(res)
}
