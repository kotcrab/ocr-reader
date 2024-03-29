import {homeRoute} from "../util/Route"
import {ImExit} from "react-icons/im"
import {IconButton, Tooltip} from "@chakra-ui/react"
import React from "react"
import {useRouter} from "next/router"
import {TOOLTIP_OPEN_DELAY} from "../util/Util"

export default function ExitButton() {
  const router = useRouter()

  return <Tooltip label="Exit" openDelay={TOOLTIP_OPEN_DELAY}>
    <IconButton
      size="md"
      fontSize="lg"
      variant="ghost"
      color="current"
      marginLeft="2"
      onClick={() => router.push(homeRoute())}
      icon={<ImExit/>}
      aria-label="Exit"
    />
  </Tooltip>
}
