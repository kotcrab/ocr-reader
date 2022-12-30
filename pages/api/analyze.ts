import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {TextAnalysisResult} from "../../model/TextAnalysisResults"

let lastRequest = Date.now()
const requestIntervalMs = 1000

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAnalysisResult[]>
) {
  if (Date.now() - lastRequest < requestIntervalMs) {
    res.status(429).end()
    return
  }
  if (req.method === "GET") {
    const text = req.query.text as string || ""
    const results = await services.jpdbService.analyzeText(text)
    lastRequest = Date.now()
    res.status(200).json(results)
  } else {
    res.status(400).end()
  }
}
