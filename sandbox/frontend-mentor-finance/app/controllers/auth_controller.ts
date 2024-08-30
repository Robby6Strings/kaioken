import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async readLogin(ctx: HttpContext) {
    return ctx.inertia.render('login')
  }

  async postLogin(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(body.email, body.password)
      await ctx.auth.use('web').login(user)
      return ctx.response.redirect().toPath('/dashboard/')
    } catch {}

    ctx.session.flash('errors', {
      login: ['Wrong email or password, try again'],
    })
    return ctx.response.redirect().back()
  }

  async readRegister(ctx: HttpContext) {
    return ctx.inertia.render('register')
  }

  async postRegister(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(registerValidator)

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
    })
    await ctx.auth.use('web').login(user)

    return ctx.response.redirect().toPath('/dashboard/')
  }
}
