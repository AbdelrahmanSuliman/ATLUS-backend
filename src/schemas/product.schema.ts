import * as z from 'zod'
import {Collection} from '@prisma/client'


export const createProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    collection: z.nativeEnum(Collection),
    price: z.coerce.number().positive("Price must be a positive number"),
})

export type createProductType = z.infer< typeof createProductSchema>