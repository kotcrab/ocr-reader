import * as fs from "fs"
import path from "path"
import * as crypto from "crypto"
import {google} from "@google-cloud/vision/build/protos/protos"
import {Book, BookInfo} from "../model/Book"
import {CachedJpdbResult} from "../model/CachedJpdbResult"
import IAnnotateImageResponse = google.cloud.vision.v1.IAnnotateImageResponse

export class StorageService {
  private readonly dataDir: string
  private readonly jpdbCacheDir: string
  readonly appSettingsFile: string
  private readonly allowedExtensions = [".png", ".jpg", ".jpeg"]
  private readonly ocrExtension = ".json"

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir)
    this.makeDirIfNeededSync(dataDir)
    if (!fs.existsSync(dataDir)) {
      throw new Error(`Can't initialize data directory. Please create the directory manually at ${dataDir} or use a different path`)
    }
    this.jpdbCacheDir = path.join(dataDir, ".jpdb-cache")
    this.makeDirIfNeededSync(this.jpdbCacheDir)
    this.appSettingsFile = path.join(this.dataDir, "settings.json")
  }

  async readBooks(): Promise<Book[]> {
    const bookDirs = this.getDirectories(
      this.dataDir,
      await fs.promises.readdir(this.dataDir, {withFileTypes: true})
    )
    const books = await Promise.all(bookDirs.map(async (it) => this.readBookDirectory(it)))

    return books.flat()
      .filter(it => it.images.length > 0)
  }

  private async readBookDirectory(dir: string): Promise<Book[]> {
    const baseName = path.basename(dir)
    const baseFiles = await fs.promises.readdir(dir, {withFileTypes: true})
    const baseBook = await this.readBook(dir, baseFiles, baseName, "")

    const nestedDirs = this.getDirectories(dir, baseFiles)
    const nestedBooks = await Promise.all(nestedDirs.map(async (nestedDir) => {
      const nestedName = path.basename(nestedDir)
      const nestedFiles = await fs.promises.readdir(nestedDir, {withFileTypes: true})
      return await this.readBook(nestedDir, nestedFiles, nestedName, baseName)
    }))

    return [baseBook, ...nestedBooks]
  }

  private async readBook(dir: string, files: fs.Dirent[], title: string, author: string): Promise<Book> {
    const appDir = path.join(dir, ".app")
    const ocrDir = path.join(appDir, "ocr")
    const infoFile = path.join(appDir, "info.json")
    const readerFile = path.join(appDir, "reader.json")
    await this.makeDirIfNeeded(appDir)
    await this.makeDirIfNeeded(ocrDir)

    const images = this.getImages(files)
    const ocrFiles = await this.getOcrFiles(ocrDir)
    return {
      title: title,
      author: author,
      baseDir: dir,
      appDir: appDir,
      ocrDir: ocrDir,
      infoFile: infoFile,
      readerSettingsFile: readerFile,
      info: await this.readBookInfo(infoFile),
      images: images,
      ocrFiles: ocrFiles,
      ocrDone: this.isBookOcrDone(images, ocrFiles),
    }
  }

  private async readBookInfo(infoFile: string): Promise<BookInfo> {
    const defaultInfo: BookInfo = {
      id: crypto.randomBytes(6).toString("hex"),
      description: "",
      notes: "",
      source: "",
      archived: false,
      pinned: false,
      currentPage: 0,
    }
    const fileExists = await fs.promises.stat(infoFile).then(() => true, () => false)
    if (!fileExists) {
      await this.writeBookInfo(infoFile, defaultInfo)
      return defaultInfo
    }
    const data = JSON.parse(await fs.promises.readFile(infoFile, "utf8"))
    return {
      id: data.id ?? defaultInfo.id,
      description: data.description ?? defaultInfo.description,
      notes: data.note ?? defaultInfo.notes,
      source: data.source ?? defaultInfo.source,
      archived: data.archived ?? defaultInfo.archived,
      pinned: data.pinned ?? defaultInfo.pinned,
      currentPage: data.currentPage ?? defaultInfo.currentPage,
    }
  }

  async writeBook(book: Book) {
    await this.writeBookInfo(book.infoFile, book.info)
  }

  private async writeBookInfo(infoFile: string, info: BookInfo) {
    await fs.promises.writeFile(infoFile, JSON.stringify(info), "utf8")
  }

  private getDirectories(baseDir: string, files: fs.Dirent[]): string[] {
    return files
      .filter(it => it.isDirectory())
      .map(it => it.name)
      .filter(it => !it.startsWith("."))
      .sort()
      .map(it => path.join(baseDir, it))
  }

  private getImages(files: fs.Dirent[]): string[] {
    return files
      .filter(it => it.isFile())
      .map(it => it.name)
      .filter(it => this.allowedExtensions.includes(path.extname(it).toLowerCase()))
      .sort()
  }

  async readOcrFile(book: Book, ocrName: string): Promise<IAnnotateImageResponse> {
    return JSON.parse(await fs.promises.readFile(path.join(book.ocrDir, ocrName), "utf8"))
  }

  async writeOcrFile(book: Book, ocrName: string, ocrResult: IAnnotateImageResponse) {
    await fs.promises.writeFile(path.join(book.ocrDir, ocrName), JSON.stringify(ocrResult), "utf8")
  }

  getOcrName(image: string): string {
    return image + this.ocrExtension
  }

  private async getOcrFiles(ocrDir: string): Promise<string[]> {
    return (await fs.promises.readdir(ocrDir, {withFileTypes: true}))
      .filter(it => it.isFile())
      .map(it => it.name)
      .filter(it => path.extname(it).toLowerCase() === this.ocrExtension)
      .sort()
  }

  private isBookOcrDone(images: string[], ocrFiles: string[]): boolean {
    for (const image of images) {
      if (!ocrFiles.includes(this.getOcrName(image))) {
        return false
      }
    }
    return true
  }

  private async makeDirIfNeeded(dir: string) {
    const fileExists = await fs.promises.stat(dir).then(() => true, () => false)
    if (!fileExists) {
      await fs.promises.mkdir(dir)
    }
  }

  private makeDirIfNeededSync(path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
  }

  async readJpdbCache(file: string): Promise<CachedJpdbResult | null> {
    const cacheFile = path.join(this.jpdbCacheDir, file)
    const fileExists = await fs.promises.stat(cacheFile).then(() => true, () => false)
    if (!fileExists) {
      return null
    }
    return JSON.parse(await fs.promises.readFile(cacheFile, "utf8"))
  }

  async writeJpdbCache(file: string, result: CachedJpdbResult) {
    await fs.promises.writeFile(path.join(this.jpdbCacheDir, file), JSON.stringify(result), "utf8")
  }
}
