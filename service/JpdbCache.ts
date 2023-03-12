import {GlobalRef} from "../util/GlobalRef"
import {MemoryCache} from "memory-cache-node"
import {JpdbParseResult} from "../model/JpdbParseResult"

const jpdbCacheRef = new GlobalRef("reader.cache.jpdb")
if (!jpdbCacheRef.value) {
  jpdbCacheRef.value = new MemoryCache<string, JpdbParseResult>(60, 1000)
}

export const jpdbCache = jpdbCacheRef.value as JpdbCache

export type JpdbCache = MemoryCache<string, JpdbParseResult>
