import {Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Tooltip} from "@chakra-ui/react"
import * as React from "react"
import {useState} from "react"

const minValue = 0
const maxValue = 95

interface Props {
  minimumConfidence: number,
  onChange: (minimumConfidence: number) => void,
  onHover: (inside: boolean) => void,
}

export default function MinimumConfidenceSelector({minimumConfidence, onChange, onHover}: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  return (
    <Slider
      id='slider'
      min={minValue}
      max={maxValue}
      colorScheme='blue'
      value={minimumConfidence}
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
        label={minimumConfidence + "%"}
      >
        <SliderThumb/>
      </Tooltip>
    </Slider>
  )
}
