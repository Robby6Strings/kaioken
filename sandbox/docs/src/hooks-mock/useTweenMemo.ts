import { depsRequireChange, sideEffectsEnabled, useHook } from "kaioken"
import { Task, TweenedOptions } from "./motion/types"
import { linear } from "@kaioken-core/hooks/easing"
import { getInterpolator } from "./motion/utils"
import { loop, raf } from "./motion/loop"

/*
  Adapted from https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/motion
  Distributed under MIT License https://github.com/sveltejs/svelte/blob/main/LICENSE.md
*/

export function useTweenMemo<T>(
  factory: () => T,
  deps: unknown[],
  options: TweenedOptions<T> = {}
): T {
  if (!sideEffectsEnabled()) return factory()
  return useHook(
    "useTweenMemo",
    () => ({
      deps,
      value: undefined as T,
      task: undefined as Task | undefined,
      targetValue: undefined as T,
    }),
    ({ hook, isInit, update }) => {
      if (isInit) {
        hook.value = factory()
        hook.deps = deps
        hook.cleanup = () => {
          if (hook.task) {
            hook.task.abort()
          }
        }
      } else if (depsRequireChange(deps, hook.deps)) {
        hook.deps = deps
        const newState = factory()
        hook.targetValue = newState

        if (newState == null) {
          hook.value = newState
          update()
          return hook.value
        }

        let started = false
        let previousTask = hook.task
        let {
          delay = 0,
          duration = 400,
          easing = linear,
          interpolate = getInterpolator,
        } = options

        if (duration === 0) {
          if (previousTask) {
            previousTask.abort()
            previousTask = undefined
          }

          hook.value = hook.targetValue
          update()
          return hook.value
        }

        const start = raf.now() + delay
        let fn: (t: number) => T
        hook.task = loop((now) => {
          if (now < start) return true
          if (!started) {
            fn = interpolate(hook.value, newState)
            if (typeof duration === "function") {
              duration = duration(hook.value, newState)
            }
            started = true
          }
          if (previousTask) {
            previousTask.abort()
            previousTask = undefined
          }
          const elapsed = now - start
          if (elapsed > (duration as number)) {
            hook.value = newState
            update()
            return false
          }

          hook.value = fn(easing(elapsed / (duration as number)))
          update()
          return true
        })
      }

      return hook.value
    }
  )
}
