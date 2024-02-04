import type { Hook } from "../types.js"
import { g } from "../globalState.js"

//@ts-expect-error
export const isSSR = !!import.meta.env?.SSR

export {
  cleanupHook,
  depsRequireChange,
  useHook,
  type HookCallback,
  type HookCallbackState,
}

type HookCallbackState<T> = {
  hook: Hook<T>
  oldHook?: Hook<T>
  update: () => void
  queueEffect: typeof g.queueEffect
}
type HookCallback<T, U> = (state: HookCallbackState<T>) => U

function useHook<T, U>(
  hookName: string,
  hookData: Hook<T>,
  callback: HookCallback<T, U>
): U {
  const node = g.curNode
  if (!node)
    throw new Error(
      `hook "${hookName}" must be used at the top level of a component or inside another hook.`
    )
  const oldHook = node.prev && (node.prev.hooks?.at(g.hookIndex) as Hook<T>)
  const hook = oldHook ?? hookData
  const res = callback({
    hook,
    oldHook,
    update: () => g.requestUpdate(node),
    queueEffect: g.queueEffect.bind(g),
  })
  if (!node.hooks) node.hooks = []
  node.hooks[g.hookIndex++] = hook
  return res
}

function cleanupHook(hook: { cleanup?: () => void }) {
  if (hook.cleanup) {
    hook.cleanup()
    hook.cleanup = undefined
  }
}

function depsRequireChange(a?: unknown[], b?: unknown[]) {
  return (
    a === undefined ||
    b === undefined ||
    a.length !== b.length ||
    (a.length > 0 && b.some((dep, i) => dep !== a[i]))
  )
}
