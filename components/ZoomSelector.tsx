import {HStack, IconButton, Text} from "@chakra-ui/react"
import * as React from "react"
import {HiZoomIn, HiZoomOut} from "react-icons/hi"

interface Props {
  zoom: number,
  onChange: (zoom: number) => void,
}

export default function ZoomSelector({zoom, onChange}: Props) {
  return (
    <HStack>
      <IconButton
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        onClick={() => onChange(zoom - 5)}
        icon={<HiZoomOut/>}
        aria-label={"Zoom Out"}
        disabled={zoom <= 5}
      />
      <Text width="50px" align="center">{zoom}%</Text>
      <IconButton
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        onClick={() => onChange(zoom + 5)}
        icon={<HiZoomIn/>}
        aria-label={"Zoom In"}
        disabled={zoom >= 100}
      />
    </HStack>
  )
}
