import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {TextAnalysisResult} from "../../model/TextAnalysisResults"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAnalysisResult[]>
) {
  if (req.method === "GET") {
    const text = req.query.text as string || ""
    const results = await services.jpdbService.analyzeText(text)
    res.status(200).json(results)
  } else {
    res.status(400).end()
  }
}
