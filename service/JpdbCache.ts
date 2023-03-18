import {GlobalRef} from "../util/GlobalRef"
import {MemoryCache} from "memory-cache-node"
import {JpdbParseResult} from "../model/JpdbParseResult"

const itemExpatriationCheckInterval = 60
const maxItemsCounts = 1000

const jpdbCacheRef = new GlobalRef("reader.cache.jpdb")
if (!jpdbCacheRef.value) {
  jpdbCacheRef.value = new MemoryCache<string, JpdbParseResult>(itemExpatriationCheckInterval, maxItemsCounts)
}

export const jpdbCache = jpdbCacheRef.value as JpdbCache

export type JpdbCache = MemoryCache<string, JpdbParseResult>
