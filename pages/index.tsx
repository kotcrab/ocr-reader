import PageHead from "../components/PageHead"
import {Button, Container, Flex, Text, VStack} from "@chakra-ui/react"
import BookCard from "../components/BookCard"
import React, {useState} from "react"
import {services} from "../service/Services"
import {BookResponse} from "../model/BookResponse"
import SearchBar from "../components/SearchBar"
import {useRouter} from "next/router"
import {homeArchiveRoute, homeRoute, readBookRoute} from "../util/Route"
import NavBar from "../components/NavBar"
import BookEditModal from "../components/BookEditModal"
import HomeMenu from "../components/HomeMenu"
import {ParsedUrlQuery} from "querystring"
import {GetServerSidePropsContext} from "next"
import {Api} from "../util/Api"
import {BookInfoUpdate} from "../model/Book"

interface Props {
  books: BookResponse[],
}

function getParams(params: ParsedUrlQuery) {
  return {
    viewArchived: "archived" in params,
  }
}

export default function Home({books}: Props) {
  const router = useRouter()
  const {viewArchived} = getParams(router.query)

  const rescanBooks = async () => {
    await Api.rescanBooks()
    await router.replace(router.asPath)
  }

  const toggleViewArchived = async () => {
    viewArchived ? await router.push(homeRoute()) : await router.push(homeArchiveRoute())
  }

  const noBooks = viewArchived ? <NoArchivedBooks/> : <NoBooks/>
  return (
    <>
      <PageHead/>
      <main>
        <Flex p={4} direction="column">
          <NavBar extraEndElement={
            <HomeMenu
              viewArchived={viewArchived}
              onToggleViewArchived={toggleViewArchived}
              onRescanBooks={rescanBooks}
            />
          }/>
          <Container maxW='6xl'>
            <VStack align="stretch" spacing={4}>
              {books.length === 0 ? noBooks :
                <BookList books={books} viewArchived={viewArchived}/>}
              {!viewArchived ?
                <Button colorScheme='blue' variant='ghost' alignSelf="center" onClick={rescanBooks}>
                  Rescan books
                </Button> : null}
              {viewArchived ?
                <Button colorScheme='blue' variant='ghost' alignSelf="center" onClick={toggleViewArchived}>
                  Go back
                </Button> : null}
            </VStack>
          </Container>
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

function NoArchivedBooks() {
  return <Text align="center" color="gray.500">
    You don&apos;t have any archived books yet. To archive a book use the book menu on the home screen.
  </Text>
}

interface BookListProps {
  books: BookResponse[],
  viewArchived: boolean,
}

function BookList({books, viewArchived}: BookListProps) {
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
      {viewArchived ? <Text alignSelf="center" color="gray.500">Viewing archived books</Text> : null}
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
    await Api.ocrBook(id)
    alert("OCR started, please follow progress in the terminal window for now, refresh this page when completed.")
  }
  const onDownloadText = async (id: string, removeLineBreaks: boolean) => {
    const blob = await Api.dumpBookText(id, removeLineBreaks)
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
    onRead={id => router.push(readBookRoute(id, book.currentPage + 1))}
    onRunOcr={onRunOcr}
    onDownloadText={onDownloadText}
  />
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const {viewArchived} = getParams(context.query)

  return {
    props: {
      books: await services.bookService.getBooks(viewArchived),
    },
  }
}
