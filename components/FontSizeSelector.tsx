import {Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip} from "@chakra-ui/react"
import * as React from "react"

interface Props {
  fontSize: number,
  onChange: (fontSize: number) => void,
}

export default function FontSizeSelector({fontSize, onChange}: Props) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <Box width="200px">
      <Slider
        id='slider'
        defaultValue={17}
        min={10}
        max={40}
        colorScheme='blue'
        onChange={(v) => onChange(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
  )
}
