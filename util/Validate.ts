import {NextApiHandler, NextApiRequest, NextApiResponse} from "next"
import {ISchema, ValidationError} from "yup"

export function validatePost(schema: ISchema<any>, handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      res.status(400).json({error: "Invalid HTTP method"})
      return
    }

    try {
      req.body = await schema
        .validate(req.body, {abortEarly: false, stripUnknown: true})
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({error: error.message, errorDetails: error.errors})
        return
      }
      res.status(400).json({error: "Unknown error"})
      return
    }

    await handler(req, res)
  }
}

export function validateGet(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.status(400).json({error: "Invalid HTTP method"})
      return
    }

    await handler(req, res)
  }
}
