import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../../service/Services"
import {JpdbStandardDeckId} from "../../../model/JpdbDeckId"
import {JpdbDeckUpdateMode} from "../../../model/JpdbDeckUpdateMode"
import {InferType, lazy, mixed, number, object} from "yup"
import {validatePost} from "../../../util/Validate"

const bodySchema = object({
  deckId: lazy((value) =>
    typeof value === "string"
      ? mixed<JpdbStandardDeckId>().oneOf(Object.values(JpdbStandardDeckId)).required()
      : number().positive().required()
  ),
  vid: number().positive().required(),
  sid: number().positive().required(),
  mode: mixed<JpdbDeckUpdateMode>().oneOf(Object.values(JpdbDeckUpdateMode)).required(),
})
type Body = InferType<typeof bodySchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as Body
  await services.jpdbService.modifyVocabularyInDeck(body.deckId, body.vid, body.sid, body.mode)
  res.status(200).end()
}

export default validatePost(bodySchema, handler)
