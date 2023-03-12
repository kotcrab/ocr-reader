import PageHead from "../components/PageHead"
import {Checkbox, Flex, Text, VStack} from "@chakra-ui/react"
import React, {useEffect, useRef, useState} from "react"
import NavBar from "../components/NavBar"
import useWebSocket, {ReadyState} from "react-use-websocket"
import {services} from "../service/Services"
import {analyzeTextUrl} from "../util/Url"
import {TextAnalysisResult} from "../model/TextAnalysisResults"
import ReadingTimer from "../components/ReadingTimer"
import {ReadingUnitType} from "../model/ReadingUnitType"
import {AppSettings} from "../model/AppSettings"
import {JpdbCardState} from "../model/JpdbCardState"

interface Props {
  jpdbEnabled: boolean,
  appSettings: AppSettings,
}

export default function TextHooker({jpdbEnabled, appSettings}: Props) {
  const bottomDivRef = useRef<HTMLDivElement>(null)
  const [analyze, setAnalyze] = useState(false)
  const [textHistory, setTextHistory] = useState<string[]>([])
  const [charactersRead, setCharactersRead] = useState(0)
  const [entriesRead, setEntriesRead] = useState(0)

  const {lastMessage, readyState} = useWebSocket(appSettings.textHookerWebSocketUrl)

  useEffect(() => {
    if (!lastMessage) {
      return
    }
    let text = ""
    try {
      const lastJsonMessage = JSON.parse(lastMessage.data)
      if (lastJsonMessage.sentence) {
        text = lastJsonMessage.sentence
      }
    } catch (e) {
      text = lastMessage.data
    }
    if (text) {
      setTextHistory((prev) => prev.concat(text))
      setCharactersRead(it => it + text.length)
      setEntriesRead(it => it + 1)
    }
  }, [lastMessage, setTextHistory])

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
            appSettings.readingTimerEnabled ?
            <ReadingTimer
              charactersRead={charactersRead}
              unitsRead={entriesRead}
              unitType={ReadingUnitType.Entries}
              onReset={onReadingTimerReset}/> : undefined
          }/>
          <VStack alignItems="start" spacing={2}>
            <Checkbox disabled={!jpdbEnabled} isChecked={analyze} onChange={(e) => setAnalyze(e.target.checked)}>
              Analyze with JPDB
            </Checkbox>
            <Text>The WebSocket is {connectionStatus.toLowerCase()}. ({appSettings.textHookerWebSocketUrl}). You
              can also paste text directly into this page.</Text>
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

  useEffect(() => {
    async function analyzeMessage() {
      if (!analyze || analysis) {
        return
      }
      const result = await fetch(analyzeTextUrl(encodeURIComponent(text)))
      if (result.ok) {
        setAnalysis(await result.json())
      }
    }

    analyzeMessage()
      .catch(console.error)
  }, [analyze, analysis, text])


  return <Text style={{whiteSpace: "pre-wrap"}}>
    {analysis ? analysis.map((it, index) =>
        <span key={index} style={{color: getColorForState(it.state)}}>{it.fragment}</span>)
      : text
    }
  </Text>
}

const MemoizedAnalyzedText = React.memo(AnalyzedText, () => true)

function getColorForState(state: JpdbCardState) {
  switch (state) {
    case JpdbCardState.Learning:
      return "#68D391"
    case JpdbCardState.Locked:
    case JpdbCardState.NotInDeck:
      return "#8999a2"
    case JpdbCardState.New:
      return "#63b3ed"
    default:
      return undefined
  }
}

export async function getServerSideProps() {
  return {
    props: {
      jpdbEnabled: await services.jpdbService.isEnabled(),
      appSettings: await services.settingsService.getAppSettings(),
    },
  }
}
