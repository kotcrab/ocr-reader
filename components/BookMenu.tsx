import {IconButton, Menu, MenuButton, MenuItem, MenuList, Portal} from "@chakra-ui/react"
import {DownloadIcon, EditIcon, HamburgerIcon} from "@chakra-ui/icons"
import React from "react"

interface Props {
  bookId: string,
  onEdit: (bookId: string) => void,
  onDownloadText: (bookId: string, removeLineBreaks: boolean) => void,
}

export default function BookMenu({bookId, onEdit, onDownloadText}: Props) {
  return <Menu>
    <MenuButton
      as={IconButton}
      aria-label='Options'
      icon={<HamburgerIcon/>}
      variant='outline'
    />
    <Portal>
      <MenuList>
        <MenuItem icon={<EditIcon/>} onClick={() => onEdit(bookId)} hidden={true}>
          Edit
        </MenuItem>
        <MenuItem icon={<DownloadIcon/>} onClick={() => onDownloadText(bookId, false)}>
          Download text
        </MenuItem>
        <MenuItem icon={<DownloadIcon/>} onClick={() => onDownloadText(bookId, true)}>
          Download text (remove line breaks)
        </MenuItem>
      </MenuList>
    </Portal>
  </Menu>
}
