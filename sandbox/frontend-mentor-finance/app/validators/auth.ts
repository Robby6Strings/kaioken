import vine from '@vinejs/vine'

const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(8),
})

export const loginValidator = vine.compile(loginSchema)

const registerSchema = vine.object({
  name: vine.string(),
  email: vine.string().email(),
  password: vine.string().minLength(8),
})

export const registerValidator = vine.compile(registerSchema)
