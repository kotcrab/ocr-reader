import {IconButton, Tooltip} from "@chakra-ui/react"
import React from "react"
import {AiFillStar, AiOutlineStar} from "react-icons/ai"
import {Icon} from "@chakra-ui/icons"
import {TOOLTIP_OPEN_DELAY} from "../util/Util"

interface Props {
  pinned: boolean,
  onTogglePinned: () => Promise<void>,
}

export default function PinBookButton({pinned, onTogglePinned}: Props) {
  const icon = pinned ? <Icon as={AiFillStar} color="yellow.400"/> : <Icon as={AiOutlineStar}/>
  return <Tooltip label={pinned ? "Unpin book" : "Pin book"} openDelay={TOOLTIP_OPEN_DELAY}>
    <IconButton
      variant="ghost"
      colorScheme="gray"
      aria-label="Pin"
      fontSize="xl"
      size="xs"
      color="gray.500"
      icon={icon}
      onClick={onTogglePinned}
    />
  </Tooltip>
}
