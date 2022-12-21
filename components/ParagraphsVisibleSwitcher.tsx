import * as React from "react"
import {Box, IconButton} from "@chakra-ui/react"
import {FaParagraph} from "react-icons/fa"

interface Props {
  showParagraphs: boolean,
  onClick: () => void,
}

export default function ParagraphsVisibleSwitcher({showParagraphs, onClick}: Props) {
  const icon = showParagraphs ? <FaParagraph/> : <Box color="gray.500"><FaParagraph/></Box>
  return <IconButton
    size="md"
    fontSize="lg"
    variant="ghost"
    color="current"
    marginLeft="2"
    onClick={() => onClick()}
    icon={icon}
    aria-label={"Change paragraphs visibility"}
  />
}
