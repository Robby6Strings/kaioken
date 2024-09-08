export function isDate(obj: any): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]"
}

// returns the interpolator function for tweening
export function getInterpolator<T>(a: T, b: T): (t: number) => T {
  if (a === b || a !== a) return () => a

  const type = typeof a
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    throw new Error("Cannot interpolate values of different type")
  }

  if (Array.isArray(a)) {
    const arr: any[] = (b as any[]).map((bi, i) => {
      return getInterpolator(a[i] as any, bi)
    })

    return ((t: number) => arr.map((fn) => fn(t)) as any) as (t: number) => T
  }

  if (type === "object") {
    if (!a || !b) {
      throw new Error("Object cannot be null")
    }

    if (isDate(a) && isDate(b)) {
      const an = a.getTime()
      const bn = b.getTime()
      const delta = bn - an

      // @ts-ignore
      return (t) => new Date(an + t * delta)
    }

    const keys = Object.keys(b)

    const interpolators: Record<string, (t: number) => T> = {}
    keys.forEach((key) => {
      // @ts-ignore
      interpolators[key] = getInterpolator(a[key], b[key])
    })

    // @ts-ignore
    return (t) => {
      const result: Record<string, any> = {}
      keys.forEach((key) => {
        result[key] = interpolators[key](t)
      })
      return result
    }
  }

  if (type === "number") {
    const delta = (b as number) - (a as number)
    // @ts-ignore
    return (t) => a + t * delta
  }

  throw new Error(`Cannot interpolate ${type} values`)
}
