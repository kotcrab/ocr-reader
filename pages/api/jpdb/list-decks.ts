import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../service/Services"
import {InferType, object, string} from "yup"
import {validatePost} from "../../../util/Validate"

const bodySchema = object({
  overrideApiKey: string(),
})
type Body = InferType<typeof bodySchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as Body
  const decks = await services.jpdbService.listDecks(body.overrideApiKey)
  res.status(200).json({decks: decks})
}

export default validatePost(bodySchema, handler)
