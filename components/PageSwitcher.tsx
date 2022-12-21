import {Button, HStack, Text} from "@chakra-ui/react"
import * as React from "react"

interface Props {
  page: number,
  pages: number,
  onChange: (page: number) => void,
}

export default function PageSwitcher({page, pages, onChange}: Props) {
  return (
    <HStack spacing={8}>
      <Button variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 0}>&#60;</Button>
      <Text>{page + 1} / {pages}</Text>
      <Button variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= pages - 1}>&#62;</Button>
    </HStack>
  )
}
