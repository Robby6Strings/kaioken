import { noop } from "../utils.js"
import { sideEffectsEnabled, useHook } from "./utils.js"

export function useSyncExternalStore<T>(
  subscribe: (callback: () => void) => () => void,
  getState: () => T
): T {
  if (!sideEffectsEnabled()) {
    return getState()
  }

  return useHook(
    "useSyncExternalStore",
    {
      state: undefined as T,
      unsubscribe: noop as () => void,
    },
    ({ hook, isInit, update }) => {
      if (isInit) {
        hook.state = getState()
        hook.unsubscribe = subscribe(() => {
          hook.state = getState()
          update()
        })
        hook.cleanup = () => {
          hook.unsubscribe()
          hook.unsubscribe = noop
        }
      }
      return hook.state
    }
  )
}
