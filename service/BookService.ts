import {StorageService} from "./StorageService"
import vision from "@google-cloud/vision"
import path from "path"
import {emptyOcrJob} from "../model/OcrJob"
import {Book} from "../model/Book"
import {RequestError} from "../util/RequestError"
import {bookToBookResponse} from "../model/BookResponse"
import {PromisePool} from "@supercharge/promise-pool"
import {OcrLine, OcrWord, PageOcrResults} from "../model/PageOcrResults"
import {google} from "@google-cloud/vision/build/protos/protos"
import {calculateBoundingRectangle} from "../util/OverlayUtil"
import {TextOrientation} from "../model/TextOrientation"
import IWord = google.cloud.vision.v1.IWord

const {promisify} = require("util")
const sizeOf = promisify(require("image-size"))

export class BookService {
  private readonly storageService: StorageService
  private readonly visionClient = new vision.ImageAnnotatorClient()

  private books: Book[] = []
  private ocrJob = emptyOcrJob()

  constructor(storageService: StorageService) {
    this.storageService = storageService
  }

  async getBooks() {
    await this.initialScanBooksIfNeeded()
    return this.books.map(it => bookToBookResponse(it))
  }

  async initialScanBooksIfNeeded() {
    try {
      if (this.books.length === 0) {
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
    this.books = await this.storageService.readBooks()
  }

  async ocrBook(bookId: string) {
    if (this.ocrJob.running) {
      throw new RequestError("OCR is already running")
    }
    await this.initialScanBooksIfNeeded()
    this.ocrJob.running = true
    try {
      const book = await this.getBookById(bookId)
      console.log(`Running OCR on book ${book.title} (${book.info.id})`)
      this.ocrJob.currentImage = 0
      this.ocrJob.totalImages = book.images.length

      const {errors} = await PromisePool
        .withConcurrency(8)
        .for(book.images)
        .onTaskFinished((item, pool) => {
          console.log(`OCR progress: ${pool.processedPercentage().toFixed(2)}%`)
        })
        .process(async (image) => {
          const ocrName = this.storageService.getOcrName(image)
          this.ocrJob.currentImage += 1
          if (book.ocrFiles.includes(ocrName)) {
            console.log(`OCR results already present for ${image}`)
            return
          }
          console.log(`OCR started for ${image}`)
          const [ocrResult] = await this.visionClient.documentTextDetection(path.join(book.baseDir, image))
          await this.storageService.writeOcrFile(book, ocrName, ocrResult)
          console.log(`OCR results saved for ${image}`)
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

  async getBookOcrResults(bookId: string, page: number): Promise<PageOcrResults> {
    const {book, annotations} = await this.getBookOcrAnnotations(bookId, page)
    const blocks = annotations.pages?.[0].blocks || []
    const paragraphsPoints = blocks
      .flatMap(block => block?.paragraphs)
      .flatMap(paragraph => paragraph?.boundingBox)
      .map(boundingBox => boundingBox?.vertices)
      .map(vertices => vertices?.flatMap(vertex => [vertex.x || 0, vertex.y || 0]) || [])
    const lines = blocks
      .flatMap(block => block?.paragraphs)
      .flatMap(paragraphs => this.mapParagraphWords(paragraphs?.words || []))
    const dimensions = await sizeOf(path.join(book.baseDir, book.images[page]))
    return {
      lines: lines,
      paragraphsPoints: paragraphsPoints,
      width: dimensions.width,
      height: dimensions.height,
      pages: book.images.length,
    }
  }

  private mapParagraphWords(words: IWord[]) {
    const lines: OcrLine[] = []
    let lineWords: OcrWord[] = []

    function commitLine() {
      if (!lineWords.length) {
        return
      }

      let minX = Number.MAX_VALUE
      let maxX = -Number.MAX_VALUE
      let minY = Number.MAX_VALUE
      let maxY = -Number.MAX_VALUE
      for (const word of lineWords) {
        minX = Math.min(minX, word.bounds.x)
        maxX = Math.max(maxX, word.bounds.x)
        minY = Math.min(minY, word.bounds.y)
        maxY = Math.max(maxY, word.bounds.y)
      }
      const deltaX = Math.abs(maxX - minX)
      const deltaY = Math.abs(maxY - minY)

      lines.push({
        orientation: deltaX > deltaY ? TextOrientation.Horizontal : TextOrientation.Vertical,
        words: lineWords,
      })
      lineWords = []
    }

    for (const word of words) {
      const vertices = word?.boundingBox?.vertices || []
      const symbols = word.symbols || []
      const text = symbols.map(it => it.text || "").join("")
      const lastSymbol = symbols.length > 0 && symbols[symbols.length - 1] || null
      const detectedBreak = lastSymbol?.property?.detectedBreak
      lineWords.push({
        text: text,
        bounds: calculateBoundingRectangle(vertices),
      })
      if (detectedBreak && detectedBreak.type != "SPACE") {
        commitLine()
      }
    }
    commitLine()
    return lines
  }

  async getBookOcrAnnotations(bookId: string, page: number) {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, page)
    const ocrName = this.storageService.getOcrName(book.images[page])
    if (!book.ocrFiles.includes(ocrName)) {
      throw new RequestError("No OCR results for this page exist")
    }
    return {
      book: book,
      annotations: (await this.storageService.readOcrFile(book, ocrName)).fullTextAnnotation || {},
    }
  }

  async updateBookProgress(bookId: string, currentPage: number): Promise<Book> {
    const book = await this.getBookById(bookId)
    this.checkBookPageInRange(book, currentPage)
    book.info.currentPage = currentPage
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
    const book = this.books.find(it => it.info.id === bookId)
    if (!book) {
      throw new RequestError(`No such book with ID ${bookId}`)
    }
    return book
  }
}
