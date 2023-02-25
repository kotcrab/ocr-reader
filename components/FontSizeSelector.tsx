import {Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip} from "@chakra-ui/react"
import * as React from "react"
import {useState} from "react"

const minValue = 5
const maxValue = 50

interface Props {
  fontSize: number,
  onChange: (fontSize: number) => void,
  onHover: (inside: boolean) => void,
}

export default function FontSizeSelector({fontSize, onChange, onHover}: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  return (
    <Slider
      id='slider'
      defaultValue={17}
      min={minValue}
      max={maxValue}
      colorScheme='blue'
      value={fontSize}
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
  )
}
