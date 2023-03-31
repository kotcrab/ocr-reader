import {HStack, IconButton, Text} from "@chakra-ui/react"
import * as React from "react"
import {createContext, useContext} from "react"
import {useHotkeys} from "react-hotkeys-hook"
import {FaChevronLeft, FaChevronRight} from "react-icons/fa"
import {ReadingDirection} from "../model/ReadingDirection"

const elementSpacing = 8

interface Props {
  lowPage: number,
  highPage: number,
  totalPages: number,
  step: number,
  readingDirection: ReadingDirection,
  onChange: (page: number) => void,
}

export default function PageSwitcher({lowPage, highPage, totalPages, step, readingDirection, onChange}: Props) {
  return <PageSwitcherContext.Provider value={{
    lowPage: lowPage,
    highPage: highPage,
    totalPages: totalPages,
    step: step,
    readingDirection: readingDirection,
    onChange: onChange,
  }}>
    <PageSwitcherInternal/>
  </PageSwitcherContext.Provider>
}

function PageSwitcherInternal() {
  const {readingDirection} = useContext(PageSwitcherContext)

  switch (readingDirection) {
    case ReadingDirection.LeftToRight:
      return <LeftToRightPageSwitcher/>
    case ReadingDirection.RightToLeft:
      return <RightToLeftPageSwitcher/>
  }
}


function LeftToRightPageSwitcher() {
  const {lowPage, highPage, totalPages, step, onChange} = useContext(PageSwitcherContext)

  useHotkeys("left", () => onChange(lowPage - step), {enabled: lowPage > 1}, [lowPage, highPage, step, onChange])
  useHotkeys("right", () => onChange(lowPage + step), {enabled: highPage < totalPages}, [lowPage, highPage, step, onChange])

  return (
    <HStack spacing={elementSpacing}>
      <PreviousPageButton icon={<FaChevronLeft/>}/>
      <PagesText/>
      <NextPageButton icon={<FaChevronRight/>}/>
    </HStack>
  )
}

function RightToLeftPageSwitcher() {
  const {lowPage, highPage, totalPages, step, onChange} = useContext(PageSwitcherContext)

  useHotkeys("left", () => onChange(lowPage + step), {enabled: highPage < totalPages}, [lowPage, highPage, step, onChange])
  useHotkeys("right", () => onChange(lowPage - step), {enabled: lowPage > 1}, [lowPage, highPage, step, onChange])

  return (
    <HStack spacing={elementSpacing}>
      <NextPageButton icon={<FaChevronLeft/>}/>
      <PagesText/>
      <PreviousPageButton icon={<FaChevronRight/>}/>
    </HStack>
  )
}

interface PageButtonProps {
  icon: JSX.Element,
}

function NextPageButton({icon}: PageButtonProps) {
  const {lowPage, highPage, totalPages, step, onChange} = useContext(PageSwitcherContext)

  return <IconButton
    icon={icon} variant="ghost" onClick={() => onChange(lowPage + step)} disabled={highPage >= totalPages}
    aria-label="Next page"
  />
}

function PreviousPageButton({icon}: PageButtonProps) {
  const {lowPage, step, onChange} = useContext(PageSwitcherContext)

  return <IconButton
    icon={icon} variant="ghost" onClick={() => onChange(lowPage - step)} disabled={lowPage <= 1}
    aria-label="Previous page"
  />
}

function PagesText() {
  const {lowPage, highPage, totalPages} = useContext(PageSwitcherContext)

  const pageText = lowPage === highPage ? `${lowPage}` : `${lowPage}-${highPage}`
  return <Text>{pageText}&nbsp;/&nbsp;{totalPages}</Text>
}

export const PageSwitcherContext = createContext({
  lowPage: 0,
  highPage: 0,
  totalPages: 0,
  step: 0,
  readingDirection: ReadingDirection.LeftToRight,
  onChange: (_: number) => {
  },
})
