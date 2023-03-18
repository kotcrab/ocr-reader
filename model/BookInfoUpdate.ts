import {boolean, InferType, object, string} from "yup"

export const bookInfoUpdateSchema = object({
  description: string(),
  notes: string(),
  source: string(),
  archived: boolean(),
  pinned: boolean(),
})

export interface BookInfoUpdate extends InferType<typeof bookInfoUpdateSchema> {
}
