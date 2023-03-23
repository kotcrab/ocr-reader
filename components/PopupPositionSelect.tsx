import {Select} from "@chakra-ui/react"
import * as React from "react"
import {PopupPosition} from "../model/PopupPosition"

interface Props {
  value: PopupPosition,
  onChange: (popupPosition: PopupPosition) => void,
}

export default function PopupPositionSelect({value, onChange}: Props) {
  return <Select value={value} onChange={event => onChange(event.target.value as PopupPosition)}>
    <option value={PopupPosition.BelowText}>Below text</option>
    <option value={PopupPosition.AboveText}>Above text</option>
    <option value={PopupPosition.LeftOfText}>Left of text</option>
    <option value={PopupPosition.RightOfText}>Right of text</option>
  </Select>
}
