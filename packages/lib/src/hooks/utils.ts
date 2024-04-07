import { ctx, nodeToCtxMap, node, renderMode } from "../globals.js"

export {
  cleanupHook,
  depsRequireChange,
  useHook,
  shouldExecHook,
  type HookCallback,
  type HookCallbackState,
}

const shouldExecHook = () => {
  return renderMode.current === "dom"
}

type Hook<T> = Kaioken.Hook<T>

type HookCallbackState<T> = {
  hook: Hook<T>
  oldHook?: Hook<T>
  update: () => void
  queueEffect: typeof ctx.current.queueEffect
  vNode: Kaioken.VNode
}
type HookCallback<T, U> = (state: HookCallbackState<T>) => U

let stack: number[] = []

function getHook<T>(vNode: Kaioken.VNode, globalHookIdx: number) {
  let s = [...stack]
  let h = vNode.prev?.hooks?.at(globalHookIdx) as Hook<T> | undefined
  while (s.length && h) {
    const n = s.pop()!
    h = h.hooks?.at(n) as Hook<T> | undefined
  }
  return h
}

function useHook<T, U>(
  hookName: string,
  hookData: Hook<T>,
  callback: HookCallback<T, U>
): U {
  const vNode = node.current
  if (!vNode) {
    throw new Error(
      `[kaioken]: hook "${hookName}" must be used at the top level of a component or inside another hook.`
    )
  }
  const ctx = nodeToCtxMap.get(vNode)
  if (!ctx) {
    throw new Error(
      `[kaioken]: an unknown error occured during execution of hook "${hookName}" (could not ascertain ctx). Seek help from the developers.`
    )
  }

  const oldHook = getHook<T>(vNode, ctx.hookIndex)
  const hook = oldHook ?? hookData

  stack.push(0)
  console.log("hook callback", hookName)
  const res = callback({
    hook,
    oldHook,
    update: () => ctx.requestUpdate(vNode),
    queueEffect: ctx.queueEffect.bind(ctx),
    vNode,
  })
  console.log("hook callback done", hookName)

  stack.pop()

  if (!vNode.hooks) vNode.hooks = []
  if (stack.length === 0) {
    debugger
    vNode.hooks[ctx.hookIndex++] = hook
  } else {
    debugger
    const s = [...stack]
    let prev: Hook<unknown>[] | undefined
    let arr = vNode.hooks as Hook<unknown>[] | undefined
    while (s.length && arr) {
      const n = s.pop()!
      prev = arr
      arr = arr[n].hooks
    }
    if (!arr) {
      prev![stack[stack.length - 1]].hooks = [] as Hook<unknown>[]
    }
    debugger

    // if (!arr && prev) {
    //   debugger
    //   const parentHook = prev[stack[stack.length - 1]]
    //   if (!parentHook.hooks) parentHook.hooks = []
    //   parentHook.hooks[stack[stack.length - 1]] = hook
    // }
  }
  if (stack.length) {
    stack[stack.length - 1]++
  }
  console.log((vNode.type as Function).name, vNode.hooks)
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
    (a.length > 0 && b.some((dep, i) => !Object.is(dep, a[i])))
  )
}
