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
import {TextOrientation} from "../model/TextOrientation"
import FontSizeSelector from "./FontSizeSelector"
import {useHotkeys} from "react-hotkeys-hook"
import {ReadingDirection} from "../model/ReadingDirection"

const optionText = "text"
const optionParagraphs = "paragraphs"
const optionAnalysis = "analysis"

interface Props {
  showText: boolean,
  showParagraphs: boolean,
  showAnalysis: boolean,
  textOrientation: TextOrientation,
  readingDirection: ReadingDirection,
  analysisEnabled: boolean,
  hasAnalysis: boolean,
  fontSize: number,
  onChangeShowText: (showText: boolean) => void,
  onChangeShowParagraphs: (showParagraphs: boolean) => void,
  onChangeShowAnalysis: (showAnalysis: boolean) => void,
  onChangeTextOrientation: (textOrientation: TextOrientation) => void,
  onChangeReadingDirection: (readingDirection: ReadingDirection) => void,
  onAnalyze: () => void,
  onFontSizeChange: (newSize: number) => void,
  onFontSizeHover: (inside: boolean) => void,
}

export default function ReaderMenu(
  {
    showText,
    showParagraphs,
    showAnalysis,
    textOrientation,
    readingDirection,
    analysisEnabled,
    hasAnalysis,
    fontSize,
    onChangeShowText,
    onChangeShowParagraphs,
    onChangeShowAnalysis,
    onChangeTextOrientation,
    onChangeReadingDirection,
    onAnalyze,
    onFontSizeChange,
    onFontSizeHover,
  }: Props
) {
  useHotkeys("q", () => onChangeTextOrientation(TextOrientation.Horizontal))
  useHotkeys("w", () => onChangeTextOrientation(TextOrientation.Vertical))
  useHotkeys("a", () => {
    if (analysisEnabled) {
      onAnalyze()
    } else if (hasAnalysis) {
      onChangeShowAnalysis(!showAnalysis)
    }
  }, [analysisEnabled, hasAnalysis, showAnalysis])
  useHotkeys("s", () => onChangeShowText(!showText), [showText])
  useHotkeys("d", () => onChangeShowParagraphs(!showParagraphs), [showParagraphs])

  const overlayValues = []
  if (showText) {
    overlayValues.push(optionText)
  }
  if (showParagraphs) {
    overlayValues.push(optionParagraphs)
  }
  if (showAnalysis) {
    overlayValues.push(optionAnalysis)
  }
  return <Menu closeOnSelect={false}>
    <MenuButton
      as={IconButton}
      aria-label='Options'
      icon={<HamburgerIcon/>}
      variant='ghost'
    />
    <Portal>
      <MenuList>
        <MenuItem isDisabled={!analysisEnabled} onClick={() => onAnalyze()}>
          Analyze using JPDB{hasAnalysis ? " (analyzed)" : ""}
        </MenuItem>
        <MenuDivider/>

        <MenuGroup title='Font size'>
          <MenuItem>
            <FontSizeSelector fontSize={fontSize} onChange={onFontSizeChange} onHover={onFontSizeHover}/>
          </MenuItem>
        </MenuGroup>
        <MenuDivider/>

        <MenuOptionGroup title='Text orientation' type='radio' value={textOrientation}>
          <MenuItemOption
            value={TextOrientation.Horizontal}
            onClick={() => onChangeTextOrientation(TextOrientation.Horizontal)}>
            Horizontal
          </MenuItemOption>
          <MenuItemOption
            value={TextOrientation.Vertical}
            onClick={() => onChangeTextOrientation(TextOrientation.Vertical)}>
            Vertical
          </MenuItemOption>
        </MenuOptionGroup>
        <MenuDivider/>

        <MenuOptionGroup title='Reading direction' type='radio' value={readingDirection}>
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
        <MenuDivider/>

        <MenuOptionGroup
          title='Overlay'
          type='checkbox'
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
      </MenuList>
    </Portal>
  </Menu>
}
