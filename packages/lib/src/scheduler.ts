import type { AppContext } from "./appContext"
import type { FunctionVNode } from "./types.utils"
import { bitmapOps } from "./bitmap.js"
import { CONSECUTIVE_DIRTY_LIMIT, FLAG } from "./constants.js"
import { commitWork, createDom, hydrateDom } from "./dom.js"
import { __DEV__ } from "./env.js"
import { KaiokenError } from "./error.js"
import { ctx, node, nodeToCtxMap, renderMode } from "./globals.js"
import { hydrationStack } from "./hydration.js"
import { assertValidElementProps } from "./props.js"
import { reconcileChildren } from "./reconciler.js"
import {
  isExoticVNode,
  postOrderApply,
  traverseApply,
  vNodeContains,
} from "./utils.js"

type VNode = Kaioken.VNode

let isRenderDirtied = false

export class Scheduler {
  private nextUnitOfWork: VNode | undefined = undefined
  private workRoots: VNode[] = []
  private currentWorkRootIndex = 0
  private isRunning = false
  private nextIdleEffects: ((scheduler: this) => void)[] = []
  private deletions: VNode[] = []
  private frameDeadline = 0
  private pendingCallback: IdleRequestCallback | undefined
  private channel: MessageChannel
  private frameHandle: number | null = null
  private isImmediateEffectsMode = false
  private immediateEffectDirtiedRender = false
  private consecutiveDirtyCount = 0

  constructor(
    private appCtx: AppContext<any>,
    private maxFrameMs = 50
  ) {
    const timeRemaining = () => this.frameDeadline - window.performance.now()
    const deadline = {
      didTimeout: false,
      timeRemaining,
    }
    this.channel = new MessageChannel()
    this.channel.port2.onmessage = () => {
      if (typeof this.pendingCallback === "function") {
        this.pendingCallback(deadline)
      }
    }
  }

  clear() {
    this.nextUnitOfWork = undefined
    this.workRoots = []
    this.currentWorkRootIndex = 0
    this.nextIdleEffects = []
    this.deletions = []
    this.frameDeadline = 0
    this.pendingCallback = undefined
    this.sleep(true)
  }

  wake() {
    if (this.isRunning) return
    this.isRunning = true
    this.requestIdleCallback(this.workLoop.bind(this))
  }

  sleep(force = false) {
    if (!this.isRunning && !force) return
    this.isRunning = false
    if (this.frameHandle !== null) {
      globalThis.cancelAnimationFrame(this.frameHandle)
      this.frameHandle = null
    }
  }

  nextIdle(fn: (scheduler: this) => void) {
    this.nextIdleEffects.push(fn)
    this.wake()
  }

  queueUpdate(vNode: VNode) {
    if ("frozen" in vNode) {
      vNode.frozen = false
    }
    if (this.isImmediateEffectsMode) {
      this.immediateEffectDirtiedRender = true
    }

    if (node.current === vNode) {
      isRenderDirtied = true
      return
    }

    if (this.nextUnitOfWork === vNode) {
      return
    }

    if (this.nextUnitOfWork === undefined) {
      this.workRoots.push(vNode)
      this.nextUnitOfWork = vNode
      return this.wake()
    }

    const treeIdx = this.workRoots.indexOf(vNode)
    // handle node as queued tree
    if (treeIdx !== -1) {
      if (treeIdx === this.currentWorkRootIndex) {
        this.workRoots[this.currentWorkRootIndex] = vNode
        this.nextUnitOfWork = vNode
      } else if (treeIdx < this.currentWorkRootIndex) {
        this.currentWorkRootIndex--
        this.workRoots.splice(treeIdx, 1)
        this.workRoots.push(vNode)
      }
      return
    }

    const nodeDepth = vNode.depth!
    // handle node as child of queued trees
    for (let i = 0; i < this.workRoots.length; i++) {
      const rootDepth = this.workRoots[i].depth!
      if (rootDepth > nodeDepth) continue
      if (vNodeContains(this.workRoots[i], vNode)) {
        if (i === this.currentWorkRootIndex) {
          // if req node is child of work node we can skip
          if (vNodeContains(this.nextUnitOfWork, vNode)) return
          // otherwise work node is a child of req node so we need to cancel & replace it
          this.nextUnitOfWork = vNode // jump back up the tree
        } else if (i < this.currentWorkRootIndex) {
          // already processed tree, create new tree with the node
          this.workRoots.push(vNode)
        }
        return
      }
    }

    let didNodeUsurp = false
    for (let i = 0; i < this.workRoots.length; i++) {
      // does node contain tree?
      const treeDepth = this.workRoots[i].depth!
      if (treeDepth < nodeDepth) continue

      if (vNodeContains(vNode, this.workRoots[i])) {
        // TODO: continue consuming trees in progress of the req node contains them!
        if (i === this.currentWorkRootIndex) {
          // node contains current tree, replace it
          if (!didNodeUsurp) {
            this.workRoots.splice(i, 1, vNode)
            this.nextUnitOfWork = vNode
            didNodeUsurp = true
          } else {
            this.workRoots.splice(i, 1)
          }
        } else if (i < this.currentWorkRootIndex) {
          // node contains a tree that has already been processed
          this.currentWorkRootIndex--
          this.workRoots.splice(i, 1)
          if (!didNodeUsurp) {
            this.workRoots.push(vNode)
          }
        } else {
          // node contains a tree that has not yet been processed, 'usurp' the tree
          if (!didNodeUsurp) {
            this.workRoots.splice(i, 1, vNode)
            didNodeUsurp = true
          } else {
            this.workRoots.splice(i, 1)
          }
        }
      }
    }
    if (didNodeUsurp) return
    // node is not a child or parent of any queued trees, queue new tree
    this.workRoots.push(vNode)
  }

  queueDelete(vNode: VNode) {
    traverseApply(vNode, (n) => bitmapOps.setFlag(n, FLAG.DELETION))
    this.deletions.push(vNode)
  }

  private isFlushReady() {
    return (
      !this.nextUnitOfWork && (this.deletions.length || this.workRoots.length)
    )
  }

  private workLoop(deadline?: IdleDeadline): void {
    ctx.current = this.appCtx
    let shouldYield = false
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork =
        performUnitOfWork(
          this.appCtx,
          this.workRoots[this.currentWorkRootIndex],
          this.nextUnitOfWork
        ) ?? this.workRoots[++this.currentWorkRootIndex]

      shouldYield =
        (deadline && deadline.timeRemaining() < 1) ??
        (!deadline && !this.nextUnitOfWork)
    }

    if (this.isFlushReady()) {
      while (this.deletions.length) {
        commitWork(this.deletions.shift()!)
      }
      const workRoots = [...this.workRoots]
      this.workRoots = []
      this.currentWorkRootIndex = 0

      for (let i = 0; i < workRoots.length; i++) {
        commitWork(workRoots[i])
      }

      this.isImmediateEffectsMode = true
      for (let i = 0; i < workRoots.length; i++) {
        fireEffects(workRoots[i], true)
      }
      this.isImmediateEffectsMode = false

      if (this.immediateEffectDirtiedRender) {
        checkForTooManyConsecutiveDirtyRenders(this.consecutiveDirtyCount)
        while (workRoots.length) {
          fireEffects(workRoots.shift()!)
        }
        this.immediateEffectDirtiedRender = false
        this.consecutiveDirtyCount++
        return this.workLoop()
      }
      this.consecutiveDirtyCount = 0

      while (workRoots.length) {
        fireEffects(workRoots.shift()!)
      }
      window.__kaioken!.emit("update", this.appCtx)
    }

    if (!this.nextUnitOfWork) {
      this.sleep()
      while (this.nextIdleEffects.length) {
        this.nextIdleEffects.shift()!(this)
      }
      return
    }

    this.requestIdleCallback(this.workLoop.bind(this))
  }

  private requestIdleCallback(callback: IdleRequestCallback) {
    this.frameHandle = globalThis.requestAnimationFrame((time) => {
      this.frameDeadline = time + this.maxFrameMs
      this.pendingCallback = callback
      this.channel.port1.postMessage(null)
    })
  }
}

function checkForTooManyConsecutiveDirtyRenders(current: number) {
  if (current > CONSECUTIVE_DIRTY_LIMIT) {
    throw new KaiokenError(
      "Maximum update depth exceeded. This can happen when a component repeatedly calls setState during render or in useLayoutEffect. Kaioken limits the number of nested updates to prevent infinite loops."
    )
  }
}

function fireEffects(tree: VNode, immediate?: boolean) {
  postOrderApply(tree, {
    onAscent(vNode) {
      const arr = immediate ? vNode.immediateEffects : vNode.effects
      while (arr?.length) arr.shift()!()
    },
  })
}

function performUnitOfWork(
  appCtx: AppContext,
  workRoot: VNode,
  vNode: VNode
): VNode | void {
  const frozen = "frozen" in vNode && vNode.frozen === true
  const skip = frozen && !bitmapOps.isFlagSet(vNode, FLAG.PLACEMENT)
  if (!skip) {
    try {
      if (typeof vNode.type === "function") {
        updateFunctionComponent(appCtx, vNode as FunctionVNode)
      } else if (isExoticVNode(vNode)) {
        updateExoticComponent(appCtx, vNode)
      } else {
        updateHostComponent(appCtx, vNode)
      }
    } catch (error) {
      window.__kaioken?.emit(
        "error",
        appCtx,
        error instanceof Error ? error : new Error(String(error))
      )
      if (KaiokenError.isKaiokenError(error)) {
        if (error.customNodeStack) {
          setTimeout(() => {
            throw new Error(error.customNodeStack)
          })
        }
        if (error.fatal) {
          throw error
        }
        console.error(error)
        return
      }
      setTimeout(() => {
        throw error
      })
    }
    if (vNode.child) {
      if (renderMode.current === "hydrate" && vNode.dom) {
        hydrationStack.push(vNode.dom)
      }
      return vNode.child
    }
  }

  let nextNode: VNode | undefined = vNode
  while (nextNode) {
    if (nextNode === workRoot) return
    if (nextNode.sibling) {
      return nextNode.sibling
    }

    nextNode = nextNode.parent
    if (renderMode.current === "hydrate" && nextNode?.dom) {
      hydrationStack.pop()
    }
  }
}

function updateFunctionComponent(appCtx: AppContext, vNode: FunctionVNode) {
  try {
    node.current = vNode
    nodeToCtxMap.set(vNode, appCtx)
    let newChildren
    let renderTryCount = 0
    do {
      isRenderDirtied = false
      appCtx.hookIndex = 0
      newChildren = vNode.type(vNode.props)
      if (++renderTryCount > CONSECUTIVE_DIRTY_LIMIT) {
        throw new KaiokenError({
          message:
            "Too many re-renders. Kaioken limits the number of renders to prevent an infinite loop.",
          fatal: true,
          vNode,
        })
      }
    } while (isRenderDirtied)
    vNode.child =
      reconcileChildren(appCtx, vNode, vNode.child || null, newChildren) ||
      undefined
  } finally {
    node.current = undefined
  }
}

function updateExoticComponent(appCtx: AppContext, vNode: ExoticVNode) {
  vNode.child =
    reconcileChildren(
      appCtx,
      vNode,
      vNode.child || null,
      vNode.props.children
    ) || undefined
}

function updateHostComponent(appCtx: AppContext, vNode: VNode) {
  try {
    node.current = vNode
    assertValidElementProps(vNode)
    if (!vNode.dom) {
      if (renderMode.current === "hydrate") {
        hydrateDom(vNode)
      } else {
        vNode.dom = createDom(vNode)
      }
    }

    if (vNode.dom) {
      // @ts-expect-error we apply vNode to the dom node
      vNode.dom!.__kaiokenNode = vNode
    }

    vNode.child =
      reconcileChildren(
        appCtx,
        vNode,
        vNode.child || null,
        vNode.props.children
      ) || undefined
  } finally {
    node.current = undefined
  }
}
