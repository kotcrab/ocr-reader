import {Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip} from "@chakra-ui/react"
import * as React from "react"
import {useState} from "react"
import {useHotkeys} from "react-hotkeys-hook"

const minValue = 10
const maxValue = 40

interface Props {
  fontSize: number,
  onChange: (fontSize: number) => void,
  onHover: (inside: boolean) => void,
}

export default function FontSizeSelector({fontSize, onChange, onHover}: Props) {
  useHotkeys("comma", () => onChange(Math.max(fontSize - 2, minValue)), {enabled: fontSize > minValue}, [fontSize])
  useHotkeys(".", () => onChange(Math.min(fontSize + 2, maxValue)), {enabled: fontSize < maxValue}, [fontSize])

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
