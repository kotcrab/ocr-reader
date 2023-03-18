import type {NextApiRequest, NextApiResponse} from "next"
import {AppSettings, appSettingsSchema} from "../../model/AppSettings"
import {services} from "../../service/Services"
import {validatePost} from "../../util/Validate"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const appSettings = req.body as AppSettings
  await services.settingsService.updateAppSettings(appSettings)
  res.status(200).end()
}

export default validatePost(appSettingsSchema, handler)
