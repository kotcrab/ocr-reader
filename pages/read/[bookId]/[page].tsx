import PageHead, {defaultPageTitle} from "../../../components/PageHead"
import {Box, Flex, Grid, GridItem, HStack, Image} from "@chakra-ui/react"
import React, {useEffect, useState} from "react"
import {useRouter} from "next/router"
import {ColorModeSwitcher} from "../../../components/ColorModeSwitcher"
import {services} from "../../../service/Services"
import {GetServerSidePropsContext} from "next"
import {PageOcrResults} from "../../../model/PageOcrResults"
import ZoomSelector from "../../../components/ZoomSelector"
import SelectionColorOverride from "../../../components/SelectionColorOverride"
import PageSwitcher from "../../../components/PageSwitcher"
import {readBookRoute} from "../../../util/Route"
import {bookAnalyzePageUrl, bookPageUrl, bookReaderSettingsUrl} from "../../../util/Url"
import SvgOverlay from "../../../components/SvgOverlay"
import {AnalysisResults} from "../../../model/AnalysisResults"
import {ParsedUrlQuery} from "querystring"
import ReaderMenu from "../../../components/ReaderMenu"
import ExitButton from "../../../components/ExitButton"
import {ReaderSettings} from "../../../model/ReaderSettings"
import ReadingTimer from "../../../components/ReadingTimer"
import {AppSettings} from "../../../model/AppSettings"
import {ReadingTimerUnitType} from "../../../model/ReadingTimerUnitType"

interface Props {
  title: string,
  ocr: PageOcrResults,
  jpdbEnabled: boolean,
  readerSettings: ReaderSettings,
  appSettings: AppSettings,
}

function getParams(params: ParsedUrlQuery) {
  const {bookId, page} = params
  return {
    bookId: bookId as string,
    page: parseInt(page as string) || 1,
  }
}

export default function ReadBookPage({title, ocr, jpdbEnabled, readerSettings, appSettings}: Props) {
  const router = useRouter()
  const {bookId, page} = getParams(router.query)

  const [zoom, setZoom] = useState(readerSettings.zoom)
  const [autoFontSize, setAutoFontSize] = useState(readerSettings.autoFontSize)
  const [fontSize, setFontSize] = useState(readerSettings.fontSize)
  const [minimumConfidence, setMinimumConfidence] = useState(readerSettings.minimumConfidence)
  const [showText, setShowText] = useState(readerSettings.showText)
  const [showParagraphs, setShowParagraphs] = useState(readerSettings.showParagraphs)
  const [showAnalysis, setShowAnalysis] = useState(readerSettings.showAnalysis)
  const [textOrientation, setTextOrientation] = useState(readerSettings.textOrientation)
  const [readingDirection, setReadingDirection] = useState(readerSettings.readingDirection)

  const [fontSizeHover, setFontSizeHover] = useState(false)
  const [minimumConfidenceHover, setMinimumConfidenceHover] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResults | undefined>(undefined)
  const [analysisStarted, setAnalysisStarted] = useState(false)

  const [charactersRead, setCharactersRead] = useState(0)
  const [charactersReadMaxPage, setCharactersReadMaxPage] = useState(page)
  const [pagesRead, setPagesRead] = useState(0)

  useEffect(() => {
    const timer = setTimeout(async () => {
      const newReaderSettings: ReaderSettings = {
        zoom: zoom,
        autoFontSize: autoFontSize,
        fontSize: fontSize,
        minimumConfidence: minimumConfidence,
        showText: showText,
        showParagraphs: showParagraphs,
        showAnalysis: showAnalysis,
        textOrientation: textOrientation,
        readingDirection: readingDirection,
      }
      await fetch(bookReaderSettingsUrl(bookId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({readerSettings: newReaderSettings}),
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [bookId, zoom, autoFontSize, fontSize, minimumConfidence, showText, showParagraphs, showAnalysis, textOrientation, readingDirection])

  async function analyze() {
    if (analysisStarted) {
      return
    }
    setAnalysisStarted(true)
    const res = await fetch(bookAnalyzePageUrl(bookId, page - 1))
    if (res.ok) {
      setAnalysis(await res.json())
      setShowAnalysis(true)
    } else {
      setAnalysisStarted(false)
      console.log("Failed to analyze page")
      console.log(res)
    }
  }

  async function changePage(newPage: number) {
    setAnalysis(undefined)
    setAnalysisStarted(false)
    window.getSelection()?.removeAllRanges()

    if (newPage > charactersReadMaxPage) {
      setCharactersRead(it => it + ocr.characterCount)
      setCharactersReadMaxPage(newPage)
      setPagesRead(it => it + 1)
      console.log(`Stats: add ${ocr.characterCount} characters, new max page: ${newPage}`)
    }

    await router.push(readBookRoute(bookId, newPage))
  }

  function onReadingTimerReset() {
    setCharactersRead(0)
    setCharactersReadMaxPage(page)
    setPagesRead(0)
  }

  const zoomPx = Math.round(ocr.width * zoom / 100) + "px"
  return (
    <>
      <PageHead title={`${title} - ${defaultPageTitle}`}/>
      <main>
        <SelectionColorOverride/>
        <Flex p={4} direction="column" alignItems="center">
          <Grid alignSelf="stretch" templateColumns='repeat(3, 1fr)' pb={4}>
            <GridItem>
              <ExitButton/>
            </GridItem>
            <GridItem justifySelf="center">
              <PageSwitcher
                page={page}
                pages={ocr.pages}
                readingDirection={readingDirection}
                onChange={(newPage) => changePage(newPage)}
              />
            </GridItem>
            <GridItem justifySelf="end">
              <HStack>
                <Box pr={4}>
                  <ZoomSelector zoom={zoom} onChange={v => setZoom(v)}/>
                </Box>
                {appSettings.readingTimerEnabled ?
                  <ReadingTimer
                    charactersRead={charactersRead}
                    unitsRead={pagesRead}
                    unitType={ReadingTimerUnitType.Pages}
                    onReset={onReadingTimerReset}/> : null}
                <ReaderMenu
                  showText={showText}
                  showParagraphs={showParagraphs}
                  showAnalysis={showAnalysis}
                  textOrientation={textOrientation}
                  readingDirection={readingDirection}
                  analysisEnabled={jpdbEnabled && !analysisStarted}
                  hasAnalysis={analysis !== undefined}
                  autoFontSize={autoFontSize}
                  fontSize={fontSize}
                  minimumConfidence={minimumConfidence}
                  onChangeShowText={it => setShowText(it)}
                  onChangeShowParagraphs={it => setShowParagraphs(it)}
                  onChangeShowAnalysis={it => setShowAnalysis(it)}
                  onChangeTextOrientation={it => setTextOrientation(it)}
                  onChangeReadingDirection={it => setReadingDirection(it)}
                  onAnalyze={async () => await analyze()}
                  onAutoFontSizeChange={it => setAutoFontSize(it)}
                  onFontSizeChange={it => setFontSize(it)}
                  onFontSizeHover={it => setFontSizeHover(it)}
                  onMinimumConfidenceChange={it => setMinimumConfidence(it)}
                  onMinimumConfidenceHover={it => setMinimumConfidenceHover(it)}
                />
                <ColorModeSwitcher/>
              </HStack>
            </GridItem>
          </Grid>
          <div style={{position: "relative", width: zoomPx}}>
            <Image alt="Page" width="100%" src={bookPageUrl(bookId, page - 1)}/>
            <SvgOverlay
              ocr={ocr}
              analysis={showAnalysis ? analysis : undefined}
              showParagraphs={showParagraphs || minimumConfidenceHover}
              showText={showText || fontSizeHover}
              autoFontSize={autoFontSize}
              textOrientation={textOrientation}
              fontSize={fontSize}
              minimumConfidence={minimumConfidence}
            />
          </div>
        </Flex>
      </main>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const {bookId, page} = getParams(context.query)
  const pageIndex = page - 1
  const ocr = await services.bookService.getBookOcrResults(bookId, pageIndex)
  const book = await services.bookService.updateBookProgress(bookId, pageIndex)
  const readerSettings = await services.settingsService.getReaderSettings(book)
  const appSettings = await services.settingsService.getAppSettings()
  return {
    props: {
      title: book.title,
      ocr: ocr,
      jpdbEnabled: await services.jpdbService.isEnabled(),
      readerSettings: readerSettings,
      appSettings: appSettings,
    },
  }
}
