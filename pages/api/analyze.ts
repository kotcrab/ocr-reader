import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {TextAnalysis} from "../../model/TextAnalysis"
import {validateGet} from "../../util/Validate"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAnalysis>
) {
  const text = req.query.text as string || ""
  const results = await services.jpdbService.analyzeText(text)
  res.status(200).json(results)
}

export default validateGet(handler)
