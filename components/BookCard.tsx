import React from "react"
import {Button, Card, CardBody, CardFooter, Heading, HStack, Image, Spacer, Stack, Text} from "@chakra-ui/react"
import {BookResponse} from "../model/BookResponse"
import {bookThumbnailUrl} from "../util/Url"
import BookMenu from "./BookMenu"

interface Props {
  book: BookResponse,
  onRead: (bookId: string) => void,
  onRunOcr: (bookId: string) => void,
  onEdit: (bookId: string) => void,
  onDownloadText: (bookId: string, removeLineBreaks: boolean) => void,
}

export default function BookCard({book, onRead, onRunOcr, onEdit, onDownloadText}: Props) {
  return <Card
    direction={{base: "column", sm: "row"}}
    overflow='hidden'
    variant='outline'
  >
    <Image
      objectFit='cover'
      maxW={{base: "100%", sm: "200px"}}
      src={bookThumbnailUrl(book.id)}
      alt='Thumbnail'
    />

    <Stack flex="1">
      <CardBody>
        <Heading size='md'>{bookTitle(book)}</Heading>
        {book.description ? <Text py='2'>{book.description}</Text> : null}
      </CardBody>

      <CardFooter>
        <HStack spacing={4}>
          <Button variant='solid' colorScheme='blue'
                  onClick={() => onRead(book.id)}
                  disabled={book.pages === 0 || !book.ocrDone}>
            Read
          </Button>
          <BookMenu bookId={book.id} onEdit={onEdit} onDownloadText={onDownloadText}/>
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
