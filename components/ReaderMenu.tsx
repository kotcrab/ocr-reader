import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Portal,
} from "@chakra-ui/react"
import {HamburgerIcon} from "@chakra-ui/icons"
import React from "react"
import {TextOrientationSetting} from "../model/TextOrientationSetting"
import FontSizeSelector from "./FontSizeSelector"
import {useHotkeys} from "react-hotkeys-hook"
import {ReadingDirection} from "../model/ReadingDirection"
import MinimumConfidenceSelector from "./MinimumConfidenceSelector"
import {useKeyPress} from "../util/KeyPress"
import {PageView} from "../model/PageView"
import {ReaderSettings} from "../model/ReaderSettings"
import {PageDisplay} from "../model/PageDisplay"

const optionText = "text"
const optionParagraphs = "paragraphs"
const optionAnalysis = "analysis"
const optionAutoFontSize = "auto"

interface Props {
  readerSettings: ReaderSettings,
  analysisEnabled: boolean,
  hasAnalysis: boolean,
  onChangeShowText: (showText: boolean) => void,
  onChangeShowParagraphs: (showParagraphs: boolean) => void,
  onChangeShowAnalysis: (showAnalysis: boolean) => void,
  onChangeTextOrientation: (textOrientation: TextOrientationSetting) => void,
  onChangeReadingDirection: (readingDirection: ReadingDirection) => void,
  onChangePageView: (pageView: PageView) => void,
  onChangePageDisplay: (pageDisplay: PageDisplay) => void,
  onAnalyze: () => void,
  onAutoFontSizeChange: (autoFontSize: boolean) => void,
  onFontSizeChange: (newSize: number) => void,
  onFontSizeHover: (inside: boolean) => void,
  onMinimumConfidenceChange: (newSize: number) => void,
  onMinimumConfidenceHover: (inside: boolean) => void,
}

export default function ReaderMenu(
  {
    readerSettings,
    analysisEnabled,
    hasAnalysis,
    onChangeShowText,
    onChangeShowParagraphs,
    onChangeShowAnalysis,
    onChangeTextOrientation,
    onChangeReadingDirection,
    onChangePageView,
    onChangePageDisplay,
    onAnalyze,
    onAutoFontSizeChange,
    onFontSizeChange,
    onFontSizeHover,
    onMinimumConfidenceChange,
    onMinimumConfidenceHover,
  }: Props
) {
  useHotkeys("a", () => {
    if (analysisEnabled) {
      onAnalyze()
    } else if (hasAnalysis) {
      onChangeShowAnalysis(!readerSettings.showAnalysis)
    }
  }, [analysisEnabled, hasAnalysis, readerSettings.showAnalysis, onAnalyze, onChangeShowAnalysis])
  useHotkeys("s", () => onChangeShowText(!readerSettings.showText), [readerSettings.showText, onChangeShowText])
  useHotkeys("d", () => onChangeShowParagraphs(!readerSettings.showParagraphs), [readerSettings.showParagraphs, onChangeShowParagraphs])

  const altKeyPressed = useKeyPress("Alt")

  const overlayValues = []
  if (readerSettings.showText) {
    overlayValues.push(optionText)
  }
  if (readerSettings.showParagraphs) {
    overlayValues.push(optionParagraphs)
  }
  if (readerSettings.showAnalysis) {
    overlayValues.push(optionAnalysis)
  }
  return <Menu closeOnSelect={false}>
    <MenuButton
      as={IconButton}
      aria-label="Options"
      fontSize="lg"
      icon={<HamburgerIcon/>}
      variant="ghost"
    />
    <Portal>
      <MenuList>
        <MenuItem isDisabled={!analysisEnabled} onClick={() => onAnalyze()}>
          Analyze using JPDB{hasAnalysis ? " (analyzed)" : ""}
        </MenuItem>
        <MenuDivider/>

        <MenuOptionGroup
          title="Overlay"
          type="checkbox"
          value={overlayValues}
          onChange={e => {
            onChangeShowText(e.includes(optionText))
            onChangeShowParagraphs(e.includes(optionParagraphs))
            onChangeShowAnalysis(e.includes(optionAnalysis))
          }}
        >
          <MenuItemOption value={optionText}>Show text</MenuItemOption>
          <MenuItemOption value={optionParagraphs}>Show paragraphs</MenuItemOption>
          {hasAnalysis ? <MenuItemOption value={optionAnalysis}>Show analysis</MenuItemOption> : null}
        </MenuOptionGroup>
        <MenuDivider/>

        <MenuGroup title="Minimum OCR confidence">
          <MenuItem>
            <MinimumConfidenceSelector
              minimumConfidence={readerSettings.minimumConfidence}
              onChange={onMinimumConfidenceChange}
              onHover={onMinimumConfidenceHover}
            />
          </MenuItem>
        </MenuGroup>
        <MenuDivider/>

        <MenuOptionGroup title="Page view" type="radio" value={readerSettings.pageView}>
          <MenuItemOption
            value={PageView.Fixed}
            onClick={() => onChangePageView(PageView.Fixed)}>
            Fixed
          </MenuItemOption>
          <MenuItemOption
            value={PageView.Floating}
            onClick={() => onChangePageView(PageView.Floating)}>
            Floating
          </MenuItemOption>
        </MenuOptionGroup>
        <MenuDivider/>

        <MenuOptionGroup title="Display" type="radio" value={readerSettings.pageDisplay}>
          <MenuItemOption
            value={PageDisplay.OnePage}
            onClick={() => onChangePageDisplay(PageDisplay.OnePage)}>
            One page
          </MenuItemOption>
          <MenuItemOption
            value={PageDisplay.TwoPagesWithCover}
            onClick={() => onChangePageDisplay(PageDisplay.TwoPagesWithCover)}>
            Two pages (has cover)
          </MenuItemOption>
          <MenuItemOption
            value={PageDisplay.TwoPagesNoCover}
            onClick={() => onChangePageDisplay(PageDisplay.TwoPagesNoCover)}>
            Two pages (no cover)
          </MenuItemOption>
        </MenuOptionGroup>
        <MenuDivider/>

        {altKeyPressed && <>
          <MenuGroup title="Font size">
            <MenuOptionGroup
              type="checkbox"
              value={readerSettings.autoFontSize ? [optionAutoFontSize] : []}
              onChange={e => onAutoFontSizeChange(e.includes(optionAutoFontSize))}>
              <MenuItemOption value={optionAutoFontSize}>Auto</MenuItemOption>
            </MenuOptionGroup>
            <MenuItem disabled={readerSettings.autoFontSize}>
              <FontSizeSelector
                fontSize={readerSettings.fontSize}
                disabled={readerSettings.autoFontSize}
                onChange={onFontSizeChange}
                onHover={onFontSizeHover}
              />
            </MenuItem>
          </MenuGroup>
          <MenuDivider/>

          <MenuOptionGroup title="Text orientation" type="radio" value={readerSettings.textOrientation}>
            <MenuItemOption
              value={TextOrientationSetting.Auto}
              onClick={() => onChangeTextOrientation(TextOrientationSetting.Auto)}>
              Auto
            </MenuItemOption>
            <MenuItemOption
              value={TextOrientationSetting.Horizontal}
              onClick={() => onChangeTextOrientation(TextOrientationSetting.Horizontal)}>
              Horizontal
            </MenuItemOption>
            <MenuItemOption
              value={TextOrientationSetting.Vertical}
              onClick={() => onChangeTextOrientation(TextOrientationSetting.Vertical)}>
              Vertical
            </MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider/>
        </>}

        <MenuOptionGroup title="Reading direction" type="radio" value={readerSettings.readingDirection}>
          <MenuItemOption
            value={ReadingDirection.LeftToRight}
            onClick={() => onChangeReadingDirection(ReadingDirection.LeftToRight)}>
            Left to right
          </MenuItemOption>
          <MenuItemOption
            value={ReadingDirection.RightToLeft}
            onClick={() => onChangeReadingDirection(ReadingDirection.RightToLeft)}>
            Right to left
          </MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Portal>
  </Menu>
}
