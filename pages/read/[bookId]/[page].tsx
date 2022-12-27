import PageHead from "../../../components/PageHead"
import {Box, Flex, Grid, GridItem, HStack, IconButton, Image} from "@chakra-ui/react"
import React, {useState} from "react"
import {useRouter} from "next/router"
import {ColorModeSwitcher} from "../../../components/ColorModeSwitcher"
import {services} from "../../../service/Services"
import {GetServerSidePropsContext} from "next"
import {PageOcrResults} from "../../../model/PageOcrResults"
import FontSizeSelector from "../../../components/FontSizeSelector"
import ZoomSelector from "../../../components/ZoomSelector"
import SelectionColorOverride from "../../../components/SelectionColorOverride"
import PageSwitcher from "../../../components/PageSwitcher"
import {homeRoute, readBookRoute} from "../../../util/Route"
import {bookAnalyzePageUrl, bookPageUrl, bookTextDumpUrl} from "../../../util/Url"
import SvgOverlay from "../../../components/SvgOverlay"
import {AnalysisResults} from "../../../model/AnalysisResults"
import {ParsedUrlQuery} from "querystring"
import ReaderMenu from "../../../components/ReaderMenu"
import {TextOrientation} from "../../../model/TextOrientation"
import {ImExit} from "react-icons/im"

interface Props {
  ocr: PageOcrResults,
  jpdbEnabled: boolean,
}

function getParams(params: ParsedUrlQuery) {
  const {bookId, page} = params
  return {
    bookId: bookId as string,
    page: parseInt(page as string) || 1,
  }
}

export default function ReadBookPage({ocr, jpdbEnabled}: Props) {
  const router = useRouter()
  const {bookId, page} = getParams(router.query)

  const [zoom, setZoom] = useState(40)
  const [fontSize, setFontSize] = useState(17)
  const [fontSizeHover, setFontSizeHover] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showParagraphs, setShowParagraphs] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(true)
  const [textOrientation, setTextOrientation] = useState(TextOrientation.Vertical)
  const [analysis, setAnalysis] = useState<AnalysisResults | undefined>(undefined)
  const [analysisStarted, setAnalysisStarted] = useState(false)

  async function analyze() {
    if (analysisStarted) {
      return
    }
    setAnalysisStarted(true)
    const res = await fetch(bookAnalyzePageUrl(bookId, page - 1))
    if (res.ok) {
      setAnalysis(await res.json())
    } else {
      console.log("Failed to analyze page")
      console.log(res)
    }
  }

  const zoomPx = Math.round(ocr.width * zoom / 100) + "px"
  return (
    <>
      <PageHead/>
      <main>
        <SelectionColorOverride/>
        <Flex p={4} direction="column" alignItems="center">
          <Grid alignSelf="stretch" templateColumns='repeat(3, 1fr)' pb={4}>
            <GridItem>
              <IconButton
                size="md"
                fontSize="lg"
                variant="ghost"
                color="current"
                marginLeft="2"
                onClick={() => router.push(homeRoute())}
                icon={<ImExit/>}
                aria-label="Exit reader"
                disabled={zoom <= 5}
              />
            </GridItem>
            <GridItem justifySelf="center">
              <PageSwitcher
                page={page}
                pages={ocr.pages}
                onChange={(newPage) => router.push(readBookRoute(bookId, newPage))}
              />
            </GridItem>
            <GridItem justifySelf="end">
              <HStack>
                <ZoomSelector zoom={zoom} onChange={v => setZoom(v)}/>
                <Box pr={5}/>
                <FontSizeSelector
                  fontSize={fontSize}
                  onChange={v => setFontSize(v)}
                  onHover={v => setFontSizeHover(v)}
                />
                <Box pr={5}/>
                <ReaderMenu
                  showText={showText}
                  showParagraphs={showParagraphs}
                  showAnalysis={showAnalysis}
                  textOrientation={textOrientation}
                  analysisEnabled={jpdbEnabled && !analysisStarted}
                  hasAnalysis={analysis !== undefined}
                  onChangeShowText={it => setShowText(it)}
                  onChangeShowParagraphs={it => setShowParagraphs(it)}
                  onChangeShowAnalysis={it => setShowAnalysis(it)}
                  onChangeTextOrientation={it => setTextOrientation(it)}
                  onAnalyze={async () => await analyze()}
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
              showParagraphs={showParagraphs}
              showText={showText || fontSizeHover}
              fontSize={fontSize}
              textOrientation={textOrientation}
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
  await services.bookService.updateBookProgress(bookId, pageIndex)
  return {
    props: {
      ocr: ocr,
      jpdbEnabled: services.jpdbService.isJpdbEnalbed(),
    },
  }
}
