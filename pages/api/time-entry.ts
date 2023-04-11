import type {NextApiRequest, NextApiResponse} from "next"
import {InferType, number, object, string} from "yup"
import {validatePost} from "../../util/Validate"
import {services} from "../../service/Services"

const bodySchema = object({
  description: string().required(),
  startTime: number().positive().required(),
  elapsedTime: number().min(0).required(),
})
type Body = InferType<typeof bodySchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as Body
  await services.timeTrackerService.addTimeEntry(body.description, body.startTime, body.elapsedTime)
  res.status(200).end()
}

export default validatePost(bodySchema, handler)
