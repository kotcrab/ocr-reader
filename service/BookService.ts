import {StorageService} from "./StorageService"
import vision from "@google-cloud/vision"
import path from "path"
import {emptyOcrJob} from "../model/OcrJob"
import {Book} from "../model/Book"
import {RequestError} from "../util/RequestError"
import {bookToBookResponse} from "../model/BookResponse"
import {PromisePool} from "@supercharge/promise-pool"
import {OcrLine, OcrParagraph, OcrSymbol, OcrPage, toPackedOcrSymbol} from "../model/OcrPage"
import {google} from "@google-cloud/vision/build/protos/protos"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import {TextOrientation} from "../model/TextOrientation"
import {Dimensions} from "../model/Dimensions"
import IWord = google.cloud.vision.v1.IWord
import IVertex = google.cloud.vision.v1.IVertex
import {BookInfoUpdate} from "../model/BookInfoUpdate"

const {promisify} = require("util")
const sizeOf = promisify(require("image-size"))

export class BookService {
  private readonly storageService: StorageService
  private readonly visionClient = new vision.ImageAnnotatorClient()

  private books: Map<string, Book> = new Map()
  private ocrJob = emptyOcrJob()

  constructor(storageService: StorageService) {
    this.storageService = storageService
  }

  async getBooks(archived: Boolean) {
    const books = await this.getAllBooks()
    return books.filter(it => it.archived === archived)
  }

  async getAllBooks() {
    await this.initialScanBooksIfNeeded()
    return Array.from(this.books.values())
      .map(it => bookToBookResponse(it))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
  }

  async initialScanBooksIfNeeded() {
    try {
      if (this.books.size === 0) {
        await this.scanBooks()
      }
    } catch (e) {
      console.log(e)
    }
  }

  async scanBooks() {
    if (this.ocrJob.running) {
      console.log("Ignoring book scan request while OCR is running")
      return
    }
    this.books = new Map((await this.storageService.readBooks())
      .map(it => [it.info.id, it]))
  }

  async ocrBook(bookId: string) {
    if (this.ocrJob.running) {
      throw new RequestError("OCR is already running")
    }
    this.ocrJob.running = true
    try {
      const book = await this.getBookById(bookId)
      console.log(`Running OCR on book ${book.title} (${book.info.id})`)
      this.ocrJob.currentImage = 0
      this.ocrJob.totalImages = book.images.length

      const {errors} = await PromisePool
        .withConcurrency(1)
        .for([...book.images])
        .onTaskFinished((item, pool) => {
          console.log(`OCR progress: ${pool.processedPercentage().toFixed(2)}%`)
          console.log(`Active tasks: ${pool.activeTasksCount()}, finished tasks: ${pool.processedCount()}`)
        })
        .process(async (image) => {
          try {
            const ocrName = this.storageService.getOcrName(image)
            this.ocrJob.currentImage += 1
            if (book.ocrFiles.includes(ocrName)) {
              console.log(`OCR results already present for ${image}`)
              return
            }
            console.log(`OCR started for ${image}`)
            const [ocrResult] = await this.visionClient.documentTextDetection(path.join(book.baseDir, image))
            console.log(`OCR results received for ${image}`)
            await this.storageService.writeOcrFile(book, ocrName, ocrResult)
            console.log(`OCR results saved for ${image}`)
          } catch (e) {
            console.log(e)
            throw e
          }
        })
      if (errors.length === 0) {
        console.log("OCR completed")
      } else {
        console.log("Errors:")
        console.log(errors)
        console.log("Errors occurred during OCR")
      }
    } catch (e) {
      console.log("OCR failed")
      console.log(e)
    } finally {
      this.ocrJob = emptyOcrJob()
    }
    await this.scanBooks()
  }

  async getBookTextDump(bookId: string, removeLineBreaks: boolean): Promise<string> {
    const book = await this.getBookById(bookId)
    const texts = []
    for (const ocrName of book.ocrFiles) {
      const annotations = (await this.storageService.readOcrFile(book, ocrName)).fullTextAnnotation
      if (!annotations) {
        continue
      }
      texts.push(annotations.text || "")
    }
    const textDump = texts.join("\n")
    if (removeLineBreaks) {
      return textDump.replaceAll("\n", "")
    } else {
      return textDump
    }
  }

  async getBookImage(bookId: string, page: number): Promise<string> {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, page)
    return path.join(book.baseDir, book.images[page])
  }

  async getBookPageDimensions(bookId: string, page: number): Promise<Dimensions> {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, page)
    const dimensions = await sizeOf(path.join(book.baseDir, book.images[page]))
    return {
      w: dimensions.width,
      h: dimensions.height,
    }
  }

  async getBookOcrResults(bookId: string, page: number): Promise<OcrPage> {
    const {annotations} = await this.getBookOcrAnnotations(bookId, page)
    const blocks = annotations.pages?.[0].blocks || []
    const paragraphs = blocks
      .flatMap(block => block?.paragraphs)
      .map((paragraph, index) => {
        return this.mapParagraph(
          index, paragraph?.words || [], paragraph?.boundingBox?.vertices || [], paragraph?.confidence || 0
        )
      })
    const characterCount = paragraphs
      .flatMap(it => it.lines)
      .flatMap(it => it.symbols)
      .map(it => it[0].length)
      .reduce((a, b) => a + b, 0)
    return {
      paragraphs: paragraphs,
      characterCount: characterCount,
    }
  }

  private mapParagraph(index: number, words: IWord[], vertices: IVertex[], confidence: number): OcrParagraph {
    const lines: OcrLine[] = []
    let lineSymbols: OcrSymbol[] = []

    function commitLine() {
      if (!lineSymbols.length) {
        return
      }

      let minX = Number.MAX_VALUE
      let maxX = -Number.MAX_VALUE
      let minY = Number.MAX_VALUE
      let maxY = -Number.MAX_VALUE
      for (const symbol of lineSymbols) {
        minX = Math.min(minX, symbol.bounds.x)
        maxX = Math.max(maxX, symbol.bounds.x)
        minY = Math.min(minY, symbol.bounds.y)
        maxY = Math.max(maxY, symbol.bounds.y)
      }
      const deltaX = Math.abs(maxX - minX)
      const deltaY = Math.abs(maxY - minY)

      lines.push({
        orientation: deltaX > deltaY ? TextOrientation.Horizontal : TextOrientation.Vertical,
        symbols: lineSymbols.map(it => toPackedOcrSymbol(it)),
      })
      lineSymbols = []
    }

    for (const word of words) {
      for (const symbol of word.symbols || []) {
        const vertices = symbol?.boundingBox?.vertices || []
        const text = symbol?.text || ""
        const detectedBreak = symbol?.property?.detectedBreak
        lineSymbols.push({
          text: text,
          bounds: calculateBoundingRectangle(vertices),
        })
        if (detectedBreak && detectedBreak.type != "SPACE") {
          commitLine()
        }
      }
    }
    commitLine()

    const points = vertices?.flatMap(vertex => [vertex.x || 0, vertex.y || 0]) || []
    return {
      id: index,
      lines: lines,
      points: points,
      confidence: confidence,
    }
  }

  private async getBookOcrAnnotations(bookId: string, page: number) {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, page)
    const ocrName = this.storageService.getOcrName(book.images[page])
    if (!book.ocrFiles.includes(ocrName)) {
      throw new RequestError("No OCR results for this page exist")
    }
    const ocrResult = await this.storageService.readOcrFile(book, ocrName)
    return {
      book: book,
      annotations: ocrResult.fullTextAnnotation || {},
    }
  }

  async updateBookProgress(bookId: string, currentPage: number) {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, currentPage)
    book.info.currentPage = currentPage
    await this.storageService.writeBook(book)
  }

  async updateBookInfo(bookId: string, data: BookInfoUpdate): Promise<Book> {
    const book = await this.getBookById(bookId)
    if (data.description !== undefined) {
      book.info.description = data.description
    }
    if (data.notes !== undefined) {
      book.info.notes = data.notes
    }
    if (data.source !== undefined) {
      book.info.source = data.source
    }
    if (data.archived !== undefined) {
      book.info.archived = data.archived
    }
    if (data.pinned !== undefined) {
      book.info.pinned = data.pinned
    }
    await this.storageService.writeBook(book)
    return book
  }

  private checkBookPageInRange(book: Book, page: number) {
    if (isNaN(page) || page < 0 || page >= book.images.length) {
      throw new RequestError("Invalid page number")
    }
  }

  async getBookById(bookId: string): Promise<Book> {
    await this.initialScanBooksIfNeeded()
    const book = this.books.get(bookId)
    if (!book) {
      throw new RequestError(`No such book with ID ${bookId}`)
    }
    return book
  }
}
