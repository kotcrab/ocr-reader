import {IconButton, Tooltip} from "@chakra-ui/react"
import {MdSettingsBackupRestore} from "react-icons/md"
import React from "react"
import {TOOLTIP_OPEN_DELAY} from "../util/Util"

interface Props {
  onClick: () => void,
}

const restoreDefault = "Restore default"

export default function RestoreDefaultValueButton({onClick}: Props) {
  return <Tooltip label={restoreDefault} openDelay={TOOLTIP_OPEN_DELAY}>
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
