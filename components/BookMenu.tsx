import {IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Portal} from "@chakra-ui/react"
import {DownloadIcon, EditIcon, ExternalLinkIcon, HamburgerIcon} from "@chakra-ui/icons"
import React, {useMemo} from "react"
import {MdArchive, MdUnarchive} from "react-icons/md"
import {isValidWebUrl} from "../util/Url"

interface Props {
  bookId: string,
  archived: boolean,
  source: string,
  onEdit: (bookId: string) => void,
  onDownloadText: (bookId: string, removeLineBreaks: boolean) => void,
  onToggleArchived: () => Promise<void>,
}

export default function BookMenu({bookId, archived, source, onEdit, onDownloadText, onToggleArchived}: Props) {
  const validWebSource = useMemo(() => isValidWebUrl(source), [source])

  return <Menu>
    <MenuButton
      as={IconButton}
      aria-label='Options'
      icon={<HamburgerIcon/>}
      variant='outline'
    />
    <Portal>
      <MenuList>
        <MenuItem icon={<EditIcon/>} onClick={() => onEdit(bookId)}>
          Edit
        </MenuItem>
        <MenuItem
          icon={archived ? <MdUnarchive/> : <MdArchive/>}
          onClick={onToggleArchived}
        >
          {archived ? "Unarchive" : "Archive"}
        </MenuItem>
        <MenuItem icon={<DownloadIcon/>} onClick={() => onDownloadText(bookId, false)}>
          Download text
        </MenuItem>
        <MenuItem icon={<DownloadIcon/>} onClick={() => onDownloadText(bookId, true)}>
          Download text (remove line breaks)
        </MenuItem>
        {validWebSource ? <MenuItem icon={<ExternalLinkIcon/>} as={Link} href={source} isExternal>
          Open source
        </MenuItem> : null}
      </MenuList>
    </Portal>
  </Menu>
}
