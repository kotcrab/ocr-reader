import {IconButton, Menu, MenuButton, MenuItem, MenuList, Portal} from "@chakra-ui/react"
import {HamburgerIcon} from "@chakra-ui/icons"
import React from "react"

interface Props {
  viewArchived: boolean
  onToggleViewArchived: () => Promise<void>,
  onRescanBooks: () => Promise<void>,
}

export default function HomeMenu({viewArchived, onToggleViewArchived, onRescanBooks}: Props) {
  return <Menu>
    <MenuButton
      as={IconButton}
      aria-label='Options'
      fontSize="lg"
      icon={<HamburgerIcon/>}
      variant='ghost'
    />
    <Portal>
      <MenuList>
        <MenuItem onClick={onToggleViewArchived}>
          {viewArchived ? "View unarchived books" : "View archived books"}
        </MenuItem>
        <MenuItem onClick={onRescanBooks}>
          Rescan books
        </MenuItem>
      </MenuList>
    </Portal>
  </Menu>
}
