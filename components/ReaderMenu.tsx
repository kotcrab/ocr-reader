import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Portal,
} from "@chakra-ui/react"
import {HamburgerIcon} from "@chakra-ui/icons"
import React from "react"
import {TextOrientation} from "../model/TextOrientation"

const optionText = "text"
const optionParagraphs = "paragraphs"
const optionAnalysis = "analysis"

interface Props {
  showText: boolean,
  showParagraphs: boolean,
  showAnalysis: boolean,
  textOrientation: TextOrientation,
  analysisEnabled: boolean,
  hasAnalysis: boolean,
  onChangeShowText: (textVisible: boolean) => void,
  onChangeShowParagraphs: (textVisible: boolean) => void,
  onChangeShowAnalysis: (textVisible: boolean) => void,
  onChangeTextOrientation: (textOrientation: TextOrientation) => void,
  onAnalyze: () => void,
}

export default function ReaderMenu(
  {
    showText,
    showParagraphs,
    showAnalysis,
    textOrientation,
    analysisEnabled,
    hasAnalysis,
    onChangeShowText,
    onChangeShowParagraphs,
    onChangeShowAnalysis,
    onChangeTextOrientation,
    onAnalyze,
  }: Props
) {
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
  return <Menu>
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

        <MenuOptionGroup title='Text orientation' type='radio' value={textOrientation}>
          <MenuItemOption
            value={TextOrientation.Horizontal}
            onClick={() => onChangeTextOrientation(TextOrientation.Horizontal)}
          >
            Horizontal
          </MenuItemOption>
          <MenuItemOption
            value={TextOrientation.Vertical}
            onClick={() => onChangeTextOrientation(TextOrientation.Vertical)}
          >
            Vertical
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
