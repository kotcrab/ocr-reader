import type {NextApiRequest, NextApiResponse} from "next"
import {services} from "../../service/Services"
import {JpdbDeckId} from "../../model/Jpdb"

interface Body {
  deckId?: JpdbDeckId,
  vid: number,
  sid: number,
  mode: "add" | "remove"
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
  if (body.mode !== "add" && body.mode !== "remove") {
    res.status(400).end()
    return
  }

  const appSettings = await services.settingsService.getAppSettings()
  const deckId = body.deckId || appSettings.jpdbMiningDeckId
  await services.jpdbService.modifyVocabularyInDeck(deckId, body.vid, body.sid, body.mode)
  res.status(200).end()
}
