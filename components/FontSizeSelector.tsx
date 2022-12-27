import {Box, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip} from "@chakra-ui/react"
import * as React from "react"
import {FaFont} from "react-icons/fa"

interface Props {
  fontSize: number,
  onChange: (fontSize: number) => void,
  onHover: (inside: boolean) => void,
}

export default function FontSizeSelector({fontSize, onChange, onHover}: Props) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <HStack spacing={3}>
      <FaFont/>
      <Box width="200px">
        <Slider
          id='slider'
          defaultValue={17}
          min={10}
          max={40}
          colorScheme='blue'
          onChange={(v) => onChange(v)}
          onMouseEnter={() => {
            setShowTooltip(true)
            onHover(true)
          }}
          onMouseLeave={() => {
            setShowTooltip(false)
            onHover(false)
          }}
        >
          <SliderTrack>
            <SliderFilledTrack/>
          </SliderTrack>
          <Tooltip
            hasArrow
            bg='blue.500'
            color='white'
            placement='top'
            isOpen={showTooltip}
            label={fontSize}
          >
            <SliderThumb/>
          </Tooltip>
        </Slider>
      </Box>
    </HStack>
  )
}
