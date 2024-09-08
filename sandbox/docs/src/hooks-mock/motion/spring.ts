import { TickContext } from "./types"
import { isDate } from "./utils"

/*
  Copied from https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/motion
  Distributed under MIT License https://github.com/sveltejs/svelte/blob/main/LICENSE.md
*/

export const tickSpring = <T>(
  ctx: TickContext,
  lastValue: T,
  currentValue: T,
  targetValue: T
): T => {
  if (typeof currentValue === "number" || isDate(currentValue)) {
    const delta = (targetValue as number) - (currentValue as number)
    const velocity =
      ((currentValue as number) - (lastValue as number)) / (ctx.dt || 1 / 60) // guard div by 0
    const spring = ctx.opts.stiffness * delta
    const damper = ctx.opts.damping * velocity
    const acceleration = (spring - damper) * ctx.inv_mass
    const d = (velocity + acceleration) * ctx.dt
    if (
      Math.abs(d) < ctx.opts.precision &&
      Math.abs(delta) < ctx.opts.precision
    ) {
      return targetValue // settled
    } else {
      ctx.settled = false // signal loop to keep ticking
      return (
        isDate(currentValue)
          ? new Date(currentValue.getTime() + d)
          : currentValue + d
      ) as T
    }
  } else if (Array.isArray(currentValue)) {
    // @ts-ignore
    return currentValue.map((_, i) =>
      tickSpring(ctx, lastValue[i], currentValue[i], targetValue[i])
    )
  } else if (typeof currentValue === "object") {
    const nextValue = {}
    for (const k in currentValue) {
      // @ts-ignore
      nextValue[k] = tickSpring(
        ctx,
        lastValue[k],
        currentValue[k],
        targetValue[k]
      )
    }
    // @ts-ignore
    return nextValue
  } else {
    throw new Error(`Cannot spring ${typeof currentValue} values`)
  }
}
