import type {NextApiRequest, NextApiResponse} from "next"
import {AppSettings} from "../../model/AppSettings"
import {services} from "../../service/Services"

interface Body {
  appSettings: AppSettings | undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(400).end()
    return
  }
  const body = req.body as Body

  if (body.appSettings) {
    await services.storageService.writeAppSettings(body.appSettings)
    services.jpdbService.reloadSettings()
    res.status(200).end()
  } else {
    res.status(400).end()
  }
}
