import {Select} from "@chakra-ui/react"
import * as React from "react"
import {useEffect, useState} from "react"
import {JpdbDeck} from "../model/JpdbDeck"
import useDebounce from "../util/Debounce"
import {Api} from "../util/Api"

interface Props {
  apiKey: string,
  deckId: number,
  onChange: (newDeckId: number) => void,
}

export default function JpdbDeckSelect({apiKey, deckId, onChange}: Props) {
  const [loading, setLoading] = useState(false)
  const [decks, setDecks] = useState<JpdbDeck[]>([])

  const debouncedApiKey = useDebounce(apiKey, 100)

  useEffect(() => {
    if (debouncedApiKey.length < 32) {
      setDecks([])
      return
    }
    setLoading(true)
    Api.listDecks(debouncedApiKey)
      .then(it => setDecks(it))
      .catch(() => console.log("Could not list decks"))
      .finally(() => setLoading(false))
  }, [debouncedApiKey])

  const currentDeckUnknown = deckId !== 0 && !decks.some(it => it.id === deckId)

  return <Select
    value={deckId}
    onChange={event => onChange(parseInt(event.target.value))}
    disabled={loading}>
    <option value={0}>(none)</option>
    {decks.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
    {currentDeckUnknown && <option value={deckId}>(unknown deck {deckId})</option>}
  </Select>
}
