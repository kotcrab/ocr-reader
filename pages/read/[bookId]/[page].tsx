import PageHead, {defaultPageTitle} from "../../../components/PageHead"
import {Box, Flex, Grid, GridItem, HStack, IconButton, Image, Tooltip} from "@chakra-ui/react"
import React, {useCallback, useEffect, useRef, useState} from "react"
import {useRouter} from "next/router"
import {ColorModeSwitcher} from "../../../components/ColorModeSwitcher"
import {services} from "../../../service/Services"
import {GetServerSidePropsContext} from "next"
import ZoomSelector from "../../../components/ZoomSelector"
import SelectionColorOverride from "../../../components/SelectionColorOverride"
import PageSwitcher from "../../../components/PageSwitcher"
import {notFoundRoute, readBookRoute} from "../../../util/Route"
import {bookPageUrl} from "../../../util/Url"
import SvgOverlay from "../../../components/SvgOverlay"
import {ParsedUrlQuery} from "querystring"
import ReaderMenu from "../../../components/ReaderMenu"
import ExitButton from "../../../components/ExitButton"
import {ReaderSettings} from "../../../model/ReaderSettings"
import ReadingTimer from "../../../components/ReadingTimer"
import {ReadingUnitType} from "../../../model/ReadingUnitType"
import {Api} from "../../../util/Api"
import {ImageAnalysis} from "../../../model/ImageAnalysis"
import {JpdbRule} from "../../../model/JpdbRule"
import {PopupPosition} from "../../../model/PopupPosition"
import {PageViewWrapper, PageViewWrapperHandle} from "../../../components/PageViewWrapper"
import {PageView} from "../../../model/PageView"
import {FloatingPageSettings} from "../../../model/AppSettings"
import {useImmer} from "use-immer"
import {MdSettingsBackupRestore} from "react-icons/md"
import {TOOLTIP_OPEN_DELAY} from "../../../util/Util"
import {calculatePageStep, calculateWantedPages} from "../../../util/Pages"
import {ReaderPage} from "../../../model/ReaderPage"
import {ReadingDirection} from "../../../model/ReadingDirection"
import {PageDisplay} from "../../../model/PageDisplay"

interface Props {
  title: string,
  totalPages: number,
  pages: readonly ReaderPage[],
  lowPage: number,
  highPage: number,
  jpdbRules: readonly JpdbRule[],
  jpdbEnabled: boolean,
  jpdbMiningDeckId: number,
  jpdbHorizontalTextPopupPosition: PopupPosition,
  jpdbVerticalTextPopupPosition: PopupPosition,
  readingTimerEnabled: boolean,
  floatingPage: FloatingPageSettings,
  initialReaderSettings: ReaderSettings,
}

function getParams(params: ParsedUrlQuery) {
  const {bookId, page} = params
  return {
    bookId: bookId as string,
    page: parseInt(page as string) || 1,
  }
}

export default function ReadBookPage(
  {
    title,
    totalPages,
    pages,
    lowPage,
    highPage,
    jpdbRules,
    jpdbEnabled,
    jpdbMiningDeckId,
    jpdbHorizontalTextPopupPosition,
    jpdbVerticalTextPopupPosition,
    readingTimerEnabled,
    floatingPage,
    initialReaderSettings,
  }: Props
) {
  const router = useRouter()
  const {bookId} = getParams(router.query)

  const [readerSettings, updateReaderSettings] = useImmer(initialReaderSettings)

  const [fontSizeHover, setFontSizeHover] = useState(false)
  const [minimumConfidenceHover, setMinimumConfidenceHover] = useState(false)
  const [analysis, setAnalysis] = useState<(ImageAnalysis | undefined)[] | undefined>(undefined)
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [reloadRequired, setReloadRequired] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const [charactersRead, setCharactersRead] = useState(0)
  const [charactersReadMaxPage, setCharactersReadMaxPage] = useState(lowPage)
  const [pagesRead, setPagesRead] = useState(0)

  const pageViewWrapperRef = useRef<PageViewWrapperHandle>(null)

  const pushRouterPage = useCallback(async (pageNumber: number) => {
    await router.push(readBookRoute(bookId, pageNumber))
  }, [bookId, router])

  useEffect(() => {
    const timer = setTimeout(async () => {
      await Api.updateReaderSettings(bookId, readerSettings)
      if (reloadRequired) {
        setReloadRequired(false)
        await pushRouterPage(lowPage + 1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [bookId, lowPage, pushRouterPage, readerSettings, reloadRequired])

  useEffect(() => {
    pageViewWrapperRef.current?.zoomToPageNow()
  }, [readerSettings.pageView])

  async function analyze() {
    if (analysisStarted) {
      return
    }
    setAnalysisStarted(true)
    setAnalysis(await Api.analyze(bookId, pages.map(it => it.index)))
    updateReaderSettings(draft => {
      draft.showAnalysis = true
    })
  }

  async function changePage(newPage: number) {
    console.log(`Change page to ${newPage}`)
    setAnalysis(undefined)
    setAnalysisStarted(false)
    window.getSelection()?.removeAllRanges()

    if (newPage > charactersReadMaxPage) {
      const characterCount = pages
        .map(it => it.ocr.characterCount)
        .reduce((a, b) => a + b, 0)
      setCharactersRead(it => it + characterCount)
      setCharactersReadMaxPage(newPage)
      setPagesRead(it => it + pages.length)
      console.log(`Stats: add ${characterCount} characters, new max page: ${newPage}`)
    }
    await pushRouterPage(newPage)
  }

  function handleImageLoaded() {
    if (initialLoad) {
      setInitialLoad(false)
      pageViewWrapperRef.current?.zoomToPageNow()
    } else {
      pageViewWrapperRef.current?.pageTurned()
    }
  }

  function readingTimerReset() {
    setCharactersRead(0)
    setCharactersReadMaxPage(lowPage)
    setPagesRead(0)
  }

  return (
    <>
      <PageHead title={`${title} - ${defaultPageTitle}`}/>
      <main>
        <SelectionColorOverride/>
        <Flex direction="column" alignItems="stretch" height="100vh">
          <Grid alignSelf="stretch" templateColumns="repeat(3, 1fr)" p={4}>
            <GridItem>
              <ExitButton/>
            </GridItem>
            <GridItem justifySelf="center">
              <PageSwitcher
                lowPage={lowPage + 1}
                highPage={highPage + 1}
                totalPages={totalPages}
                step={calculatePageStep(lowPage, readerSettings.pageDisplay)}
                readingDirection={readerSettings.readingDirection}
                onChange={(newPage) => changePage(newPage)}
              />
            </GridItem>
            <GridItem justifySelf="end">
              <HStack>
                {readerSettings.pageView === PageView.Fixed ?
                  <Box pr={4}>
                    <ZoomSelector
                      zoom={readerSettings.zoom}
                      onChange={v => updateReaderSettings(draft => {
                        draft.zoom = v
                      })}/>
                  </Box> : <Tooltip label="Reset view" openDelay={TOOLTIP_OPEN_DELAY}>
                    <IconButton
                      size="md"
                      fontSize="lg"
                      variant="ghost"
                      color="current"
                      icon={<MdSettingsBackupRestore/>}
                      aria-label="Reset view"
                      onClick={() => pageViewWrapperRef.current?.zoomToPageNow()}
                    />
                  </Tooltip>}
                {readingTimerEnabled ?
                  <ReadingTimer
                    charactersRead={charactersRead}
                    unitsRead={pagesRead}
                    unitType={ReadingUnitType.Pages}
                    onReset={readingTimerReset}/> : null}
                <ReaderMenu
                  readerSettings={readerSettings}
                  analysisEnabled={jpdbEnabled && !analysisStarted}
                  hasAnalysis={analysis !== undefined}
                  onChangeShowText={it => updateReaderSettings(draft => {
                    draft.showText = it
                  })}
                  onChangeShowParagraphs={it => updateReaderSettings(draft => {
                    draft.showParagraphs = it
                  })}
                  onChangeShowAnalysis={it => updateReaderSettings(draft => {
                    draft.showAnalysis = it
                  })}
                  onChangeTextOrientation={it => updateReaderSettings(draft => {
                    draft.textOrientation = it
                  })}
                  onChangeReadingDirection={it => {
                    updateReaderSettings(draft => {
                      draft.readingDirection = it
                    })
                    if (readerSettings.pageDisplay !== PageDisplay.OnePage) {
                      setReloadRequired(true)
                    }
                  }}
                  onChangePageView={it => updateReaderSettings(draft => {
                    draft.pageView = it
                  })}
                  onChangePageDisplay={it => {
                    updateReaderSettings(draft => {
                      draft.pageDisplay = it
                    })
                    setReloadRequired(true)
                  }}
                  onAutoFontSizeChange={it => updateReaderSettings(draft => {
                    draft.autoFontSize = it
                  })}
                  onFontSizeChange={it => updateReaderSettings(draft => {
                    draft.fontSize = it
                  })}
                  onMinimumConfidenceChange={it => updateReaderSettings(draft => {
                    draft.minimumConfidence = it
                  })}
                  onAnalyze={async () => await analyze()}
                  onFontSizeHover={it => setFontSizeHover(it)}
                  onMinimumConfidenceHover={it => setMinimumConfidenceHover(it)}
                />
                <ColorModeSwitcher/>
              </HStack>
            </GridItem>
          </Grid>
          <PageViewWrapper
            pageView={readerSettings.pageView}
            zoom={readerSettings.zoom}
            floatingPage={floatingPage}
            ref={pageViewWrapperRef}
            wrapper={(divRef, width, alignSelf) =>
              <HStack alignSelf={alignSelf} ref={divRef} spacing={0}>
                {pages.map((page, index) => {
                  return <div
                    key={page.index}
                    style={{position: "relative", width: width(page.dimensions)}}
                  >
                    <Image
                      alt={`Page ${page.index + 1}`}
                      width="100%"
                      htmlWidth={page.dimensions.w}
                      htmlHeight={page.dimensions.h}
                      src={bookPageUrl(bookId, page.index)}
                      userSelect="none"
                      onLoad={() => handleImageLoaded()}
                    />
                    <SvgOverlay
                      ocr={page.ocr}
                      pageDimensions={page.dimensions}
                      analysis={analysis && analysis[index]}
                      jpdbRules={jpdbRules}
                      showParagraphs={readerSettings.showParagraphs || minimumConfidenceHover}
                      showText={readerSettings.showText || fontSizeHover}
                      showAnalysis={readerSettings.showAnalysis}
                      autoFontSize={readerSettings.autoFontSize}
                      fontSize={readerSettings.fontSize}
                      textOrientation={readerSettings.textOrientation}
                      minimumConfidence={readerSettings.minimumConfidence}
                      jpdbMiningDeckId={jpdbMiningDeckId}
                      jpdbHorizontalTextPopupPosition={jpdbHorizontalTextPopupPosition}
                      jpdbVerticalTextPopupPosition={jpdbVerticalTextPopupPosition}
                    />
                  </div>
                })}
              </HStack>
            }
          />
        </Flex>
      </main>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const {bookId, page} = getParams(context.query)
  const pageIndex = page - 1
  if (pageIndex < 0) {
    return {redirect: {destination: notFoundRoute(), permanent: false}}
  }
  const book = await services.bookService.getBookById(bookId)
  const readerSettings = await services.settingsService.getReaderSettings(book)
  const appSettings = await services.settingsService.getAppSettings()
  const totalPages = book.images.length
  const wantedPages = calculateWantedPages(pageIndex, totalPages, readerSettings.pageDisplay)

  if (wantedPages.length === 0) {
    return {redirect: {destination: notFoundRoute(), permanent: false}}
  }
  if (wantedPages[0] !== pageIndex) {
    return {redirect: {destination: readBookRoute(bookId, wantedPages[0] + 1), permanent: false}}
  }

  const lowPage = wantedPages[0]
  const highPage = wantedPages[wantedPages.length - 1]
  await services.bookService.updateBookProgress(bookId, highPage)
  if (readerSettings.readingDirection === ReadingDirection.RightToLeft) {
    wantedPages.reverse()
  }
  const pages = await Promise.all(wantedPages.map(async (pageIndex): Promise<ReaderPage> => {
    const ocr = await services.bookService.getBookOcrResults(bookId, pageIndex)
    const dimensions = await services.bookService.getBookPageDimensions(bookId, pageIndex)
    return {
      index: pageIndex,
      dimensions: dimensions,
      ocr: ocr,
    }
  }))

  return {
    props: {
      title: book.title,
      totalPages: totalPages,
      lowPage: lowPage,
      highPage: highPage,
      pages: pages,
      jpdbEnabled: await services.jpdbService.isEnabled(),
      jpdbRules: appSettings.jpdbRules,
      jpdbMiningDeckId: appSettings.jpdbMiningDeckId,
      jpdbHorizontalTextPopupPosition: appSettings.jpdbHorizontalTextPopupPosition,
      jpdbVerticalTextPopupPosition: appSettings.jpdbVerticalTextPopupPosition,
      readingTimerEnabled: appSettings.readingTimerEnabled,
      floatingPage: appSettings.floatingPage,
      initialReaderSettings: readerSettings,
    },
  }
}
