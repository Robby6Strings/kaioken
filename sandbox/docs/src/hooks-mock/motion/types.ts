/*
  Adapted from https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/motion
  Distributed under MIT License https://github.com/sveltejs/svelte/blob/main/LICENSE.md
*/

export interface Task {
  abort(): void
  promise: Promise<void>
}

export interface SpringUpdateOpts {
  hard?: any
  soft?: string | number | boolean
}

export interface SpringOpts extends SpringUpdateOpts {
  stiffness: number
  damping: number
  precision: number
}

export interface TickContext {
  inv_mass: number
  dt: number
  opts: SpringOpts
  settled: boolean
}

export interface TweenedOptions<T> {
  delay?: number
  duration?: number | ((from: T, to: T) => number)
  easing?: (t: number) => number
  interpolate?: (a: T, b: T) => (t: number) => T
}
