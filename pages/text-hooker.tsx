import PageHead from "../components/PageHead"
import {Badge, Checkbox, Flex, HStack, Text, Tooltip, VStack} from "@chakra-ui/react"
import React, {useEffect, useRef, useState} from "react"
import NavBar from "../components/NavBar"
import useWebSocket, {ReadyState} from "react-use-websocket"
import {services} from "../service/Services"
import {WarningTwoIcon} from "@chakra-ui/icons"
import {analyzeTextUrl} from "../util/Url"
import {WordStatus} from "../model/WordStatus"
import {TextAnalysisResult} from "../model/TextAnalysisResults"
import ReadingTimer from "../components/ReadingTimer"
import {ReadingTimerUnitType} from "../model/ReadingTimerUnitType"

interface Props {
  jpdbEnabled: boolean,
  webSocketUrl: string,
}

export default function TextHooker({jpdbEnabled, webSocketUrl}: Props) {
  const bottomDivRef = useRef<HTMLDivElement>(null)
  const [analyze, setAnalyze] = useState(false)
  const [textHistory, setTextHistory] = useState<string[]>([])
  const [charactersRead, setCharactersRead] = useState(0)
  const [entriesRead, setEntriesRead] = useState(0)

  const {lastJsonMessage, readyState} = useWebSocket(webSocketUrl)

  useEffect(() => {
    if (lastJsonMessage !== null && (lastJsonMessage as any).sentence) {
      const text = (lastJsonMessage as any).sentence as string
      setTextHistory((prev) => prev.concat(text))
      setCharactersRead(it => it + text.length)
      setEntriesRead(it => it + 1)
    }
  }, [lastJsonMessage, setTextHistory])

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Disconnecting",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState]

  useEffect(() => {
    function handlePaste(event: Event) {
      const text = (event as ClipboardEvent).clipboardData?.getData("text")
      if (text) {
        setTextHistory((prev) => prev.concat(text))
        setCharactersRead(it => it + text.length)
        setEntriesRead(it => it + 1)
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

  useEffect(
    () => {
      bottomDivRef.current?.scrollIntoView()
    },
    [textHistory]
  )

  function onReadingTimerReset() {
    setCharactersRead(0)
    setEntriesRead(0)
  }

  return (
    <>
      <PageHead title="Text hooker"/>
      <main>
        <Flex p={4} align="stretch" direction="column">
          <NavBar extraEndElement={
            <ReadingTimer
              charactersRead={charactersRead}
              unitsRead={entriesRead}
              unitType={ReadingTimerUnitType.Entries}
              onReset={onReadingTimerReset}/>
          }/>
          <VStack alignItems="start" spacing={2}>
            <Checkbox disabled={!jpdbEnabled} isChecked={analyze} onChange={(e) => setAnalyze(e.target.checked)}>
              Analyze with JPDB <Badge ml='1' colorScheme='red'>Experimental</Badge>
            </Checkbox>
            <Text>The WebSocket is {connectionStatus.toLowerCase()}. ({webSocketUrl}). You can also paste text directly
              into this page.</Text>
            {textHistory.map((text, idx) => (
              <MemoizedAnalyzedText key={idx} text={text} analyze={analyze}/>
            ))}
          </VStack>
        </Flex>
        <div ref={bottomDivRef}/>
      </main>
    </>
  )
}

interface AnalyzedTextProps {
  text: string,
  analyze: boolean,
}

function AnalyzedText({text, analyze}: AnalyzedTextProps) {
  const [analysis, setAnalysis] = useState<TextAnalysisResult[] | undefined>(undefined)
  const [rateLimited, setRateLimited] = useState(false)

  useEffect(() => {
    async function analyzeMessage() {
      if (!analyze || analysis) {
        return
      }
      const result = await fetch(analyzeTextUrl(encodeURIComponent(text)))
      if (result.status == 429) {
        setRateLimited(true)
        return
      }
      if (result.ok) {
        setAnalysis(await result.json())
      }
    }

    analyzeMessage()
      .catch(console.error)
  }, [analyze, analysis, text])

  const rateLimitedIcon = rateLimited ?
    <Tooltip label='Analysis skipped due to rate limiting'>
      <WarningTwoIcon/>
    </Tooltip> : null

  const coloredText = <Text style={{whiteSpace: "pre-wrap"}}>
    {analysis ? analysis.map((it, index) =>
        <span key={index} style={{color: getColorForStatus(it.status)}}>{it.fragment}</span>)
      : text
    }
  </Text>

  return <HStack>
    {coloredText}
    {rateLimitedIcon}
  </HStack>
}

const MemoizedAnalyzedText = React.memo(AnalyzedText, () => true)

function getColorForStatus(status: WordStatus) {
  switch (status) {
    case WordStatus.Learning:
      return "#68D391"
    case WordStatus.Locked:
    case WordStatus.NotInDeck:
      return "#8999a2"
    case WordStatus.New:
      return "#63b3ed"
    default:
      return undefined
  }
}

export async function getServerSideProps() {
  const appSettings = await services.settingsService.getAppSettings()
  return {
    props: {
      jpdbEnabled: await services.jpdbService.isEnabled(),
      webSocketUrl: appSettings.textHookerWebSocketUrl,
    },
  }
}
