import PageHead from "../components/PageHead"
import {Button, Container, Flex, Text, VStack} from "@chakra-ui/react"
import BookCard from "../components/BookCard"
import React, {useState} from "react"
import {services} from "../service/Services"
import {BookResponse} from "../model/BookResponse"
import SearchBar from "../components/SearchBar"
import {useRouter} from "next/router"
import {booksUrl, bookTextDumpUrl, bookUrl} from "../util/Url"
import {ColorModeSwitcher} from "../components/ColorModeSwitcher"
import {readBookRoute} from "../util/Route"

interface Props {
  books: BookResponse[],
}

export default function Home({books}: Props) {
  const router = useRouter()

  const rescanBooks = async () => {
    await fetch(booksUrl(), {method: "POST"})
    await router.replace(router.asPath)
  }

  return (
    <>
      <PageHead/>
      <main>
        <Flex p={4}>
          <Container maxW='6xl'>
            <VStack align="stretch" spacing={4}>
              {books.length === 0 ? <NoBooks/> : <BookList books={books}/>}
              <Button colorScheme='blue' variant='ghost' alignSelf="center" onClick={rescanBooks}>
                Rescan books
              </Button>
            </VStack>
          </Container>
          <ColorModeSwitcher justifySelf="flex-end"/>
        </Flex>
      </main>
    </>
  )
}

function NoBooks() {
  return <Text align="center" color="gray.500">
    You don&apos;t have any books yet, try adding some inside your data directory then rescan books.
  </Text>
}

function BookList({books}: Props) {
  const [filter, setFilter] = useState("")
  const filteredBooks = books
    .filter(book => {
      return !filter ||
        book.title.toLowerCase().includes(filter) ||
        book.author.toLowerCase().includes(filter) ||
        book.description.toLowerCase().includes(filter)
    })

  return (
    <>
      <SearchBar onChange={it => setFilter(it.toLowerCase())}/>
      {filteredBooks.map(it => <BookItem key={it.id} book={it}/>)}
    </>
  )
}

interface BookItemProps {
  book: BookResponse,
}

function BookItem({book}: BookItemProps) {
  const router = useRouter()

  const onRunOcr = async (id: string) => {
    await fetch(bookUrl(id), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ocr: true}),
    })
    alert("OCR started, please follow progress in the terminal for now, refresh this page when completed.")
  }
  const onEdit = async (id: string) => {
  }
  const onDownloadText = async (id: string, removeLineBreaks: boolean) => {
    const res = await fetch(bookTextDumpUrl(id, removeLineBreaks))
    const blob = await res.blob()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${book.title}.txt`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  return <BookCard
    key={book.id}
    book={book}
    onRead={id => router.push(readBookRoute(id, book.currentPage))}
    onRunOcr={onRunOcr}
    onEdit={onEdit}
    onDownloadText={onDownloadText}
  />
}

export async function getServerSideProps() {
  return {
    props: {
      books: await services.bookService.getBooks(),
    },
  }
}
