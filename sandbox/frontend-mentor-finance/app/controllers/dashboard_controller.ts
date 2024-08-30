import { toSerializeUser } from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async read(ctx: HttpContext) {
    return ctx.inertia.render('dashboard/index', {
      user: toSerializeUser(ctx.auth.user!),
    })
  }

  async readTransaction(ctx: HttpContext) {
    return ctx.inertia.render('dashboard/transactions', {
      user: toSerializeUser(ctx.auth.user!),
    })
  }

  async readBudgets(ctx: HttpContext) {
    return ctx.inertia.render('dashboard/budgets', {
      user: toSerializeUser(ctx.auth.user!),
    })
  }

  async readPots(ctx: HttpContext) {
    return ctx.inertia.render('dashboard/pots', {
      user: toSerializeUser(ctx.auth.user!),
    })
  }

  async readBills(ctx: HttpContext) {
    return ctx.inertia.render('dashboard/recurring', {
      user: toSerializeUser(ctx.auth.user!),
    })
  }
}
