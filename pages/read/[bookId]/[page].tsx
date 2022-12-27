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
import {bookPageUrl} from "../../../util/Url"
import SvgOverlay from "../../../components/SvgOverlay"
import {AnalysisResults} from "../../../model/AnalysisResults"
import {ParsedUrlQuery} from "querystring"
import ReaderMenu from "../../../components/ReaderMenu"
import {TextOrientation} from "../../../model/TextOrientation"
import {ImExit} from "react-icons/im"

interface Props {
  ocr: PageOcrResults,
  analysis?: AnalysisResults,
}

function getParams(params: ParsedUrlQuery) {
  const {bookId, page, analyze} = params
  return {
    bookId: bookId as string,
    page: parseInt(page as string) || 0,
    analyze: analyze === "true",
  }
}

export default function ReadBookPage({ocr, analysis}: Props) {
  const router = useRouter()
  const {bookId, page} = getParams(router.query)

  const [zoom, setZoom] = useState(40)
  const [fontSize, setFontSize] = useState(17)
  const [fontSizeHover, setFontSizeHover] = useState(false)
  const [showText, setShowText] = useState(true)
  const [showParagraphs, setShowParagraphs] = useState(false)
  const [textOrientation, setTextOrientation] = useState(TextOrientation.Vertical)

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
                <Box pr={4}/>
                <FontSizeSelector
                  fontSize={fontSize}
                  onChange={v => setFontSize(v)}
                  onHover={v => setFontSizeHover(v)}
                />
                <Box pr={4}/>
                <ReaderMenu
                  showText={showText}
                  showParagraphs={showParagraphs}
                  textOrientation={textOrientation}
                  onChangeShowText={it => setShowText(it)}
                  onChangeShowParagraphs={it => setShowParagraphs(it)}
                  onChangeTextOrientation={it => setTextOrientation(it)}
                />
                <ColorModeSwitcher/>
              </HStack>
            </GridItem>
          </Grid>
          <div style={{position: "relative", width: zoomPx}}>
            <Image alt="Page" width="100%" src={bookPageUrl(bookId, page)}/>
            <SvgOverlay
              ocr={ocr}
              analysis={analysis}
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
  const {bookId, page, analyze} = getParams(context.query)
  const ocr = await services.bookService.getBookOcrResults(bookId, page)
  const analysis = analyze ? await services.jpdbService.analyze(bookId, page) : null
  await services.bookService.updateBookProgress(bookId, page)
  return {
    props: {
      ocr: ocr,
      analysis: analysis,
    },
  }
}
