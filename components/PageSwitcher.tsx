import {HStack, IconButton, Text} from "@chakra-ui/react"
import * as React from "react"
import {useHotkeys} from "react-hotkeys-hook"
import {FaChevronLeft, FaChevronRight} from "react-icons/fa"

interface Props {
  page: number,
  pages: number,
  onChange: (page: number) => void,
}

export default function PageSwitcher({page, pages, onChange}: Props) {
  useHotkeys("left", () => onChange(page - 1), {enabled: page > 1}, [page])
  useHotkeys("right", () => onChange(page + 1), {enabled: page < pages}, [page])

  return (
    <HStack spacing={8}>
      <IconButton
        icon={<FaChevronLeft/>} variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 1}
        aria-label="Previous page"
      />
      <Text>{page}&nbsp;/&nbsp;{pages}</Text>
      <IconButton
        icon={<FaChevronRight/>} variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= pages}
        aria-label="Next page"
      />
    </HStack>
  )
}
