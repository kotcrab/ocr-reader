import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {TextAnalysis} from "../../model/TextAnalysis"
import {validatePost} from "../../util/Validate"
import {InferType, object, string} from "yup"

const bodySchema = object({
  text: string().required(),
})
type Body = InferType<typeof bodySchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAnalysis>
) {
  const body = req.body as Body
  const results = await services.jpdbService.analyzeText(body.text)
  res.status(200).json(results)
}

export default validatePost(bodySchema, handler)
