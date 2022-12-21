import {StorageService} from "./StorageService"
import {BookService} from "./BookService"
import {AppEnv} from "./AppEnv"
import {GlobalRef} from "../util/GlobalRef"

class Services {
  readonly env = new AppEnv()
  readonly storageService = new StorageService(this.env.dataDirectory)
  readonly bookService = new BookService(this.storageService)
}

const servicesRef = new GlobalRef("reader.services")
if (!servicesRef.value) {
  servicesRef.value = new Services()
}

export const services = servicesRef.value as Services
