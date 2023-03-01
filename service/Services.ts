import {StorageService} from "./StorageService"
import {BookService} from "./BookService"
import {AppEnv} from "./AppEnv"
import {GlobalRef} from "../util/GlobalRef"
import {JpdbService} from "./JpdbService"
import {SettingsService} from "./SettingsService"

class Services {
  readonly env = new AppEnv()
  readonly storageService = new StorageService(this.env.dataDirectory)
  readonly settingsService = new SettingsService(this.storageService)
  readonly bookService = new BookService(this.storageService)
  readonly jpdbService = new JpdbService(this.storageService, this.bookService, this.settingsService)
}

const servicesRef = new GlobalRef("reader.services")
if (!servicesRef.value) {
  servicesRef.value = new Services()
}

export const services = servicesRef.value as Services
