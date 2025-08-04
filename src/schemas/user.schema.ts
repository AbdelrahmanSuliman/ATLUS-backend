import * as z from 'zod'

export const signUpSchema = z.object({
    username: z.string().min(6).max(30),
    password: z.string().min(6).max(12),
    email: z.string().email()
})

export const loginSchema = z.object({
    email: z.string().min(6).max(30),
    password: z.string().min(6).max(12)
})

export const updateDetailsSchema = z.object({
    username: z.string().min(6).max(30),
    password: z.string().min(6).max(12),
    email: z.string().email()
})


export type signUpType = z.infer<typeof signUpSchema>
export type logInType = z.infer<typeof loginSchema>
