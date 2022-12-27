import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
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

interface Props {
  showText: boolean,
  showParagraphs: boolean,
  textOrientation: TextOrientation,
  onChangeShowText: (textVisible: boolean) => void,
  onChangeShowParagraphs: (textVisible: boolean) => void,
  onChangeTextOrientation: (textOrientation: TextOrientation) => void,
}

export default function ReaderMenu(
  {
    showText,
    showParagraphs,
    textOrientation,
    onChangeShowText,
    onChangeShowParagraphs,
    onChangeTextOrientation,
  }: Props
) {
  const overlayValues = []
  if (showText) {
    overlayValues.push(optionText)
  }
  if (showParagraphs) {
    overlayValues.push(optionParagraphs)
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
          }}
        >
          <MenuItemOption value={optionText}>Show text</MenuItemOption>
          <MenuItemOption value={optionParagraphs}>Show paragraphs</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Portal>
  </Menu>
}
