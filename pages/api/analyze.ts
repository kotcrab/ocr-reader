import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {TextAnalysis} from "../../model/TextAnalysis"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAnalysis>
) {
  if (req.method === "GET") {
    const text = req.query.text as string || ""
    const results = await services.jpdbService.analyzeText(text)
    res.status(200).json(results)
  } else {
    res.status(400).end()
  }
}
