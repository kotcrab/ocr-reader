import {IconButton, Tooltip} from "@chakra-ui/react"
import {MdSettingsBackupRestore} from "react-icons/md"
import React from "react"

interface Props {
  onClick: () => void,
}

const restoreDefault = "Restore default"

export default function RestoreDefaultValueButton({onClick}: Props) {
  return <Tooltip label={restoreDefault} openDelay={500}>
    <IconButton
      fontSize="xl"
      variant="ghost"
      color="current"
      onClick={() => onClick()}
      icon={<MdSettingsBackupRestore/>}
      aria-label={restoreDefault}
    />
  </Tooltip>
}
