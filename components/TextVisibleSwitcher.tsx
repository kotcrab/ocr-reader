import * as React from "react"
import {Box, IconButton} from "@chakra-ui/react"
import {FaFont} from "react-icons/fa"

interface Props {
  showText: boolean,
  onClick: () => void,
}

export default function TextVisibleSwitcher({showText, onClick}: Props) {
  const icon = showText ? <FaFont/> : <Box color="gray.500"><FaFont/></Box>
  return <IconButton
    size="md"
    fontSize="lg"
    variant="ghost"
    color="current"
    marginLeft="2"
    onClick={() => onClick()}
    icon={icon}
    aria-label={"Change text visibility"}
  />
}
