import React, {useState} from "react"
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  HStack,
  Image,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react"
import {BookResponse} from "../model/BookResponse"
import {bookThumbnailUrl} from "../util/Url"
import BookMenu from "./BookMenu"
import PinBookButton from "./PinBookButton"
import {Api} from "../util/Api"
import BookEditModal from "./BookEditModal"

interface Props {
  book: BookResponse,
  onRead: (bookId: string) => void,
  onRunOcr: (bookId: string) => void,
  onDownloadText: (bookId: string, removeLineBreaks: boolean) => void,
}

export default function BookCard({book, onRead, onRunOcr, onDownloadText}: Props) {
  const [description, setDescription] = useState(book.description)
  const [notes, setNotes] = useState(book.notes)
  const [source, setSource] = useState(book.source)
  const [pinned, setPinned] = useState(book.pinned)
  const [archived, setArchived] = useState(book.archived)

  const [editPending, setEditPending] = useState(false)

  async function onSaveEdits(newDescription: string, newNotes: string, newSource: string) {
    await Api.updateBookInfo(book.id, {description: newDescription, notes: newNotes, source: newSource})
    setDescription(newDescription)
    setNotes(newNotes)
    setSource(newSource)
    setEditPending(false)
  }

  async function togglePinned() {
    await Api.updateBookInfo(book.id, {pinned: !pinned})
    setPinned(!pinned)
  }

  async function toggleArchived() {
    await Api.updateBookInfo(book.id, {archived: !archived})
    setArchived(!archived)
  }

  return <Card
    direction={{base: "column", sm: "row"}}
    overflow='hidden'
    variant='outline'
  >
    <BookEditModal
      title={book.title}
      description={description}
      source={source}
      notes={notes}
      open={editPending}
      onSave={onSaveEdits}
      onCancel={() => setEditPending(false)}
    />
    <Image
      objectFit='cover'
      maxW={{base: "100%", sm: "200px"}}
      src={bookThumbnailUrl(book.id)}
      alt='Thumbnail'
    />

    <Stack flex="1">
      <CardBody>
        <Flex alignItems="center">
          <Heading size='md'>{bookTitle(book)} </Heading>
          {archived ? <Badge ml={3} mt={1}>Archived</Badge> : null}
          <Spacer/>
          <PinBookButton pinned={pinned} onTogglePinned={togglePinned}/>
        </Flex>
        {description ? <Text py='4' style={{whiteSpace: "pre-wrap"}}>{description}</Text> : null}
      </CardBody>

      <CardFooter>
        <HStack spacing={4}>
          <Button variant='solid' colorScheme='blue'
                  onClick={() => onRead(book.id)}
                  disabled={book.pages === 0 || !book.ocrDone}>
            Read
          </Button>
          <BookMenu
            bookId={book.id}
            archived={archived}
            source={source}
            onEdit={() => setEditPending(true)}
            onDownloadText={onDownloadText}
            onToggleArchived={toggleArchived}
          />
          {book.ocrDone ? null :
            <Button variant='link' colorScheme='orange'
                    onClick={() => onRunOcr(book.id)}>
              OCR pending, click to start
            </Button>
          }
        </HStack>
        <Spacer/>
        <Text color="gray.500" alignSelf="center">{bookProgress(book)}</Text>
      </CardFooter>
    </Stack>
  </Card>
}

function bookTitle(book: BookResponse): string {
  if (book.author) {
    return `${book.author} - ${book.title}`
  } else {
    return book.title
  }
}

function bookProgress(book: BookResponse) {
  if (book.pages === 0) {
    return "Book has no images"
  }
  const progress = Math.round(book.currentPage * 100 / (book.pages - 1))
  const pageText = book.pages === 1 ? "page" : "pages"
  return `${book.pages} ${pageText} • ${progress}%`
}
