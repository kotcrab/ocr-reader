import PageHead from "../components/PageHead"
import {Checkbox, Flex, Text, useToast, VStack} from "@chakra-ui/react"
import React, {useEffect, useRef, useState} from "react"
import NavBar from "../components/NavBar"
import useWebSocket, {ReadyState} from "react-use-websocket"
import {services} from "../service/Services"
import {analyzeTextUrl} from "../util/Url"
import {TextAnalysis} from "../model/TextAnalysis"
import ReadingTimer from "../components/ReadingTimer"
import {ReadingUnitType} from "../model/ReadingUnitType"
import {evaluateJpdbRules} from "../util/JpdbUitl"
import {JpdbRule} from "../model/JpdbRule"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import JpdbPopupWrapper from "../components/JpdbPopupWrapper"
import useDebounce from "../util/Debounce"
import {PopupPosition} from "../model/PopupPosition"
import {Api} from "../util/Api"

interface Props {
  jpdbEnabled: boolean,
  jpdbRules: readonly JpdbRule[],
  jpdbMiningDeckId: number,
  jpdbPopupPosition: PopupPosition,
  readingTimerEnabled: boolean,
  textHookerWebSocketUrl: string,
}

export default function TextHooker(
  {
    jpdbEnabled,
    jpdbRules,
    jpdbMiningDeckId,
    jpdbPopupPosition,
    readingTimerEnabled,
    textHookerWebSocketUrl,
  }: Props
) {
  const bottomDivRef = useRef<HTMLDivElement>(null)
  const [analyze, setAnalyze] = useState(false)
  const [textHistory, setTextHistory] = useState<string[]>([])
  const [charactersRead, setCharactersRead] = useState(0)
  const [entriesRead, setEntriesRead] = useState(0)

  const {lastMessage, readyState} = useWebSocket(textHookerWebSocketUrl)

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
            readingTimerEnabled ? <ReadingTimer
              charactersRead={charactersRead}
              unitsRead={entriesRead}
              unitType={ReadingUnitType.Entries}
              onReset={onReadingTimerReset}/> : undefined
          }/>
          <VStack alignItems="start" spacing={2}>
            <Checkbox disabled={!jpdbEnabled} isChecked={analyze} onChange={(e) => setAnalyze(e.target.checked)}>
              Analyze with JPDB
            </Checkbox>
            <Text>The WebSocket is {connectionStatus.toLowerCase()}. ({textHookerWebSocketUrl}). You
              can also paste text directly into this page.</Text>
            {textHistory.map((text, idx) => (
              <AnalyzedText
                key={idx}
                text={text}
                analyze={analyze}
                jpdbRules={jpdbRules}
                jpdbMiningDeckId={jpdbMiningDeckId}
                jpdbPopupPosition={jpdbPopupPosition}
              />
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
  jpdbRules: readonly JpdbRule[],
  jpdbMiningDeckId: number,
  jpdbPopupPosition: PopupPosition,
}

function AnalyzedText({text, analyze, jpdbRules, jpdbMiningDeckId, jpdbPopupPosition}: AnalyzedTextProps) {
  const toast = useToast()

  const [wantsAnalyze, _] = useState(analyze)
  const [analysis, setAnalysis] = useState<TextAnalysis | undefined>(undefined)

  useEffect(() => {
    async function analyzeMessage() {
      if (!wantsAnalyze || analysis) {
        return
      }
      setAnalysis(await Api.analyzeText(text))
    }

    analyzeMessage()
      .catch(() => {
        toast.closeAll()
        toast({
          description: "Could not analyze text",
          status: "error",
          duration: 3000,
        })
      })
  }, [wantsAnalyze, analysis, text, toast])

  return <Text style={{whiteSpace: "pre-wrap"}}>
    {analysis ? analysis.tokens.map((it, index) => {
        const vocabulary = analysis.vocabulary[it.vocabularyIndex]
        const rule = evaluateJpdbRules(jpdbRules, vocabulary)
        return <TextToken
          key={index}
          text={it.text}
          rule={rule}
          vocabulary={vocabulary}
          miningDeckId={jpdbMiningDeckId}
          popupPosition={jpdbPopupPosition}
        />
      })
      : text
    }
  </Text>
}

interface TextTokenProps {
  text: string,
  rule: JpdbRule | undefined,
  vocabulary: JpdbVocabulary | undefined,
  miningDeckId: number,
  popupPosition: PopupPosition,
}

function TextToken({text, rule, vocabulary, miningDeckId, popupPosition}: TextTokenProps) {
  const [mouseOver, setMouseOver] = useState(false)
  const debouncedMouseOver = useDebounce(mouseOver, 40)

  if (!rule) {
    return <span>{text}</span>
  }

  return <JpdbPopupWrapper
    rule={rule}
    vocabulary={vocabulary}
    miningDeckId={miningDeckId}
    position={popupPosition}
    mouseOverRef={debouncedMouseOver}
    wrapper={(ref) => <span
      ref={ref}
      style={{color: rule.textColor}}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      {text}
    </span>}
  />
}


export async function getServerSideProps() {
  const appSettings = await services.settingsService.getAppSettings()
  return {
    props: {
      jpdbEnabled: await services.jpdbService.isEnabled(),
      jpdbRules: appSettings.jpdbRules,
      jpdbMiningDeckId: appSettings.jpdbMiningDeckId,
      jpdbPopupPosition: appSettings.jpdbHorizontalTextPopupPosition,
      readingTimerEnabled: appSettings.readingTimerEnabled,
      textHookerWebSocketUrl: appSettings.textHookerWebSocketUrl,
    },
  }
}
