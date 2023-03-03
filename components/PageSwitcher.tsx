import {HStack, IconButton, Text} from "@chakra-ui/react"
import * as React from "react"
import {useHotkeys} from "react-hotkeys-hook"
import {FaChevronLeft, FaChevronRight} from "react-icons/fa"
import {ReadingDirection} from "../model/ReadingDirection"

const elementSpacing = 8

interface Props {
  page: number,
  pages: number,
  readingDirection: ReadingDirection,
  onChange: (page: number) => void,
}

export default function PageSwitcher({page, pages, readingDirection, onChange}: Props) {
  switch (readingDirection) {
    case ReadingDirection.LeftToRight:
      return <LeftToRightPageSwitcher page={page} pages={pages} onChange={onChange}/>
    case ReadingDirection.RightToLeft:
      return <RightToLeftPageSwitcher page={page} pages={pages} onChange={onChange}/>
  }
}

interface PageSwitcherProps {
  page: number,
  pages: number,
  onChange: (page: number) => void,
}

function LeftToRightPageSwitcher({page, pages, onChange}: PageSwitcherProps) {
  useHotkeys("left", () => onChange(page - 1), {enabled: page > 1}, [page, onChange])
  useHotkeys("right", () => onChange(page + 1), {enabled: page < pages}, [page, onChange])

  return (
    <HStack spacing={elementSpacing}>
      <PreviousPageButton icon={<FaChevronLeft/>} page={page} pages={pages} onChange={onChange}/>
      <PagesText page={page} pages={pages}/>
      <NextPageButton icon={<FaChevronRight/>} page={page} pages={pages} onChange={onChange}/>
    </HStack>
  )
}

function RightToLeftPageSwitcher({page, pages, onChange}: PageSwitcherProps) {
  useHotkeys("left", () => onChange(page + 1), {enabled: page < pages}, [page, onChange])
  useHotkeys("right", () => onChange(page - 1), {enabled: page > 1}, [page, onChange])

  return (
    <HStack spacing={elementSpacing}>
      <NextPageButton icon={<FaChevronLeft/>} page={page} pages={pages} onChange={onChange}/>
      <PagesText page={page} pages={pages}/>
      <PreviousPageButton icon={<FaChevronRight/>} page={page} pages={pages} onChange={onChange}/>
    </HStack>
  )
}

interface PageButtonProps {
  icon: JSX.Element,
  page: number,
  pages: number,
  onChange: (page: number) => void,
}

function NextPageButton({icon, page, pages, onChange}: PageButtonProps) {
  return <IconButton
    icon={icon} variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= pages}
    aria-label="Next page"
  />
}

function PreviousPageButton({icon, page, onChange}: PageButtonProps) {
  return <IconButton
    icon={icon} variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 1}
    aria-label="Previous page"
  />
}

interface PagesTextProps {
  page: number,
  pages: number,
}

function PagesText({page, pages}: PagesTextProps) {
  return <Text>{page}&nbsp;/&nbsp;{pages}</Text>
}
