import PageHead from "../../../components/PageHead"
import {Box, Flex, HStack, Image} from "@chakra-ui/react"
import React, {useState} from "react"
import {useRouter} from "next/router"
import {ColorModeSwitcher} from "../../../components/ColorModeSwitcher"
import {services} from "../../../service/Services"
import {GetServerSidePropsContext} from "next"
import {PageOcrResults} from "../../../model/PageOcrResults"
import ShowTextSwitcher from "../../../components/TextVisibleSwitcher"
import ShowParagraphsSwitcher from "../../../components/ParagraphsVisibleSwitcher"
import FontSizeSelector from "../../../components/FontSizeSelector"
import ZoomSelector from "../../../components/ZoomSelector"
import SelectionColorOverride from "../../../components/SelectionColorOverride"
import PageSwitcher from "../../../components/PageSwitcher"
import {readBookRoute} from "../../../util/Route"
import {bookPageUrl} from "../../../util/Url"
import SvgOverlay from "../../../components/SvgOverlay"

interface Props {
  ocr: PageOcrResults,
}

function getParams(params: any) {
  const {bookId, page} = params
  return {
    bookId: bookId as string,
    page: parseInt(page as string) || 0,
  }
}

export default function ReadBookPage({ocr}: Props) {
  const router = useRouter()
  const {bookId, page} = getParams(router.query)

  const [zoom, setZoom] = useState(40)
  const [showText, setShowText] = useState(false)
  const [fontSize, setFontSize] = useState(17)
  const [showParagraphs, setShowParagraphs] = useState(false)

  const changePage = async (newPage: number) => {
    await router.push(readBookRoute(bookId, newPage))
  }

  const zoomPx = Math.round(ocr.width * zoom / 100) + "px"
  return (
    <>
      <PageHead/>
      <main>
        <SelectionColorOverride/>
        <Flex p={4} direction="column" alignItems="center">
          <HStack alignSelf="flex-end" pb={4}>
            <PageSwitcher page={page} pages={ocr.pages} onChange={changePage}/>
            <Box pr={4}/>
            <ZoomSelector zoom={zoom} onChange={v => setZoom(v)}/>
            <Box pr={4}/>
            <ShowTextSwitcher showText={showText} onClick={() => setShowText(!showText)}/>
            <FontSizeSelector fontSize={fontSize} onChange={v => setFontSize(v)}/>
            <Box pr={4}/>
            <ShowParagraphsSwitcher showParagraphs={showParagraphs} onClick={() => setShowParagraphs(!showParagraphs)}/>
            <ColorModeSwitcher/>
          </HStack>
          <div style={{position: "relative", width: zoomPx}}>
            <Image alt="Page" width="100%" src={bookPageUrl(bookId, page)}/>
            <SvgOverlay ocr={ocr} showParagraphs={showParagraphs} showText={showText} fontSize={fontSize}/>
          </div>
        </Flex>
      </main>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const {bookId, page} = getParams(context.params)
  const ocr = await services.bookService.getBookOcrResults(bookId, page)
  await services.bookService.updateBookProgress(bookId, page)
  return {
    props: {
      ocr: ocr,
    },
  }
}
