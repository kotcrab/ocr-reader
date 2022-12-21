import React from "react"
import {Input, InputGroup, InputLeftElement} from "@chakra-ui/input"
import {SearchIcon} from "@chakra-ui/icons"

interface Props {
  onChange: (newValue: string) => void,
}

export default function SearchBar({onChange}: Props) {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents='none'>
        <SearchIcon color='gray.300'/>
      </InputLeftElement>
      <Input placeholder='Search' onChange={(event) => onChange(event.target.value)}/>
    </InputGroup>
  )
}
