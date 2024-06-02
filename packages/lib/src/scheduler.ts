import type { AppContext } from "./appContext"
import { Component } from "./component.js"
import {
  EffectTag,
  elementFreezeSymbol,
  elementTypes as et,
} from "./constants.js"
import { commitWork, createDom, updateDom } from "./dom.js"
import {
  childIndexStack,
  ctx,
  hydrationStack,
  node,
  renderMode,
} from "./globals.js"
import { assertValidElementProps } from "./props.js"
import { reconcileChildren } from "./reconciler.js"
import { vNodeContains } from "./utils.js"

type VNode = Kaioken.VNode

export class Scheduler {
  private nextUnitOfWork: VNode | undefined = undefined
  private treesInProgress: VNode[] = []
  private currentTreeIndex = 0
  private isRunning = false
  private queuedNodeEffectSets: Function[][] = []
  private nextIdleEffects: Function[] = []
  private deletions: VNode[] = []
  private frameDeadline = 0
  private pendingCallback: IdleRequestCallback | undefined
  nodeEffects: Function[] = []

  constructor(
    private appCtx: AppContext<any>,
    private maxFrameMs = 50,
    private channel = new MessageChannel()
  ) {
    const timeRemaining = () => this.frameDeadline - window.performance.now()
    const deadline = {
      didTimeout: false,
      timeRemaining,
    }
    this.channel.port2.onmessage = () => {
      if (typeof this.pendingCallback === "function") {
        this.pendingCallback(deadline)
      }
    }
  }

  wake() {
    this.isRunning = true
    this.workLoop()
  }

  sleep() {
    this.isRunning = false
  }

  queueUpdate(node: VNode) {
    node.prev = { ...node, prev: undefined }

    if (this.nextUnitOfWork === undefined) {
      this.treesInProgress.push(node)
      this.nextUnitOfWork = node
      return
    } else if (this.nextUnitOfWork === node) {
      return
    }

    const treeIdx = this.treesInProgress.indexOf(node)
    // handle node as queued tree
    if (treeIdx !== -1) {
      if (treeIdx === this.currentTreeIndex) {
        this.treesInProgress[this.currentTreeIndex] = node
        this.nextUnitOfWork = node
      } else if (treeIdx < this.currentTreeIndex) {
        this.currentTreeIndex--
        this.treesInProgress.splice(treeIdx, 1)
        this.treesInProgress.push(node)
      }
      return
    }

    // handle node as child or parent of queued trees
    for (let i = 0; i < this.treesInProgress.length; i++) {
      if (vNodeContains(this.treesInProgress[i], node)) {
        if (i === this.currentTreeIndex) {
          // if req node is child of work node we can skip
          if (vNodeContains(this.nextUnitOfWork, node)) return
          // otherwise work node is a child of req node so we need to cancel & replace it
          this.nextUnitOfWork = node // jump back up the tree
        } else if (i < this.currentTreeIndex) {
          // already processed tree, create new tree with the node
          this.treesInProgress.push(node)
        }
        return
      } else if (vNodeContains(node, this.treesInProgress[i])) {
        if (i === this.currentTreeIndex) {
          // node contains current tree, replace it
          this.treesInProgress.splice(i, 1, node)
          this.nextUnitOfWork = node
        } else if (i < this.currentTreeIndex) {
          // node contains a tree that has already been processed
          this.currentTreeIndex--
          this.treesInProgress.splice(i, 1)
          this.treesInProgress.push(node)
        }
        return
      }
    }
    // node is not a child or parent of any queued trees, queue new tree
    this.treesInProgress.push(node)
  }

  queueDelete(node: VNode) {
    node.effectTag = EffectTag.DELETION
    if (node.props.ref) {
      node.props.ref.current = null
    }
    this.deletions.push(node)
  }

  queueCurrentNodeEffects() {
    this.queuedNodeEffectSets.push(this.nodeEffects)
    this.nodeEffects = []
  }

  nextIdle(fn: () => void) {
    this.nextIdleEffects.push(fn)
  }

  private workLoop(deadline?: IdleDeadline) {
    let shouldYield = false
    ctx.current = this.appCtx
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork =
        this.performUnitOfWork(this.nextUnitOfWork) ??
        this.treesInProgress[++this.currentTreeIndex]

      shouldYield =
        (deadline && deadline.timeRemaining() < 1) ??
        (!deadline && !this.nextUnitOfWork)
    }

    if (
      !this.nextUnitOfWork &&
      (this.deletions.length || this.treesInProgress.length)
    ) {
      while (this.deletions.length) {
        commitWork(this.appCtx, this.deletions.pop()!)
      }
      if (this.treesInProgress.length) {
        this.currentTreeIndex = 0
        while (this.treesInProgress.length) {
          commitWork(this.appCtx, this.treesInProgress.pop()!)
        }

        while (this.queuedNodeEffectSets.length) {
          const effects = this.queuedNodeEffectSets.pop()! // consume from child before parent
          while (effects.length) {
            effects.shift()!() // fire in sequence
          }
        }
      }
      window.__kaioken!.emit("update", this.appCtx)
    }

    if (!this.nextUnitOfWork) {
      while (this.nextIdleEffects.length) {
        this.nextIdleEffects.shift()!()
      }
    }

    if (!this.isRunning) return
    this.requestIdleCallback(this.workLoop)
  }

  private requestIdleCallback(callback: IdleRequestCallback) {
    globalThis.requestAnimationFrame((time) => {
      this.frameDeadline = time + this.maxFrameMs
      this.pendingCallback = callback
      this.channel.port1.postMessage(null)
    })
    return this.appCtx.id
  }

  private performUnitOfWork(vNode: VNode): VNode | void {
    const frozen =
      elementFreezeSymbol in vNode && vNode[elementFreezeSymbol] === true
    const skip = frozen && vNode.effectTag !== EffectTag.PLACEMENT
    if (!skip) {
      try {
        if (Component.isCtor(vNode.type)) {
          this.updateClassComponent(vNode)
        } else if (vNode.type instanceof Function) {
          this.updateFunctionComponent(vNode)
        } else if (vNode.type === et.fragment) {
          vNode.child = reconcileChildren(
            this.appCtx,
            vNode,
            vNode.props.children
          )
        } else {
          this.updateHostComponent(vNode)
        }
      } catch (value) {
        const e = Component.emitThrow(vNode, value)
        if (e) console.error("[kaioken]: unhandled error", e)
      }
      if (vNode.child) {
        if (renderMode.current === "hydrate" && vNode.dom) {
          hydrationStack.push(vNode.dom)
          childIndexStack.push(0)
        }
        return vNode.child
      }
      if (vNode.child) {
        if (renderMode.current === "hydrate" && vNode.dom) {
          hydrationStack.push(vNode.dom)
          childIndexStack.push(0)
        }
        return vNode.child
      }
    }

    let nextNode: VNode | undefined = vNode
    while (nextNode) {
      if (nextNode === this.treesInProgress[this.currentTreeIndex]) return
      if (nextNode.sibling) {
        return nextNode.sibling
      }

      nextNode = nextNode.parent
      if (nextNode?.dom) {
        hydrationStack.pop()
        childIndexStack.pop()
      }
    }
  }

  private updateClassComponent(vNode: VNode) {
    this.appCtx.hookIndex = 0
    node.current = vNode
    if (!vNode.instance) {
      const instance =
        vNode.prev?.instance ??
        new (vNode.type as { new (props: Record<string, unknown>): Component })(
          vNode.props
        )
      vNode.instance = instance
    } else {
      vNode.instance.props = vNode.props
    }

    vNode.child = reconcileChildren(
      this.appCtx,
      vNode,
      [vNode.instance.render()].flat() as VNode[]
    )
    this.queueCurrentNodeEffects()
    node.current = undefined
  }

  private updateFunctionComponent(vNode: VNode) {
    this.appCtx.hookIndex = 0
    node.current = vNode
    vNode.child = reconcileChildren(
      this.appCtx,
      vNode,
      [(vNode.type as Function)(vNode.props)].flat()
    )
    this.queueCurrentNodeEffects()
    node.current = undefined
  }

  private updateHostComponent(vNode: VNode) {
    assertValidElementProps(vNode)
    if (!vNode.dom) {
      if (renderMode.current === "hydrate") {
        const dom = currentDom()!
        if ((vNode.type as string) !== dom.nodeName.toLowerCase()) {
          throw new Error(
            `[kaioken]: Expected node of type ${vNode.type} but received ${dom.nodeName}`
          )
        }
        vNode.dom = dom
        if (vNode.type === et.text) {
          handleTextNodeSplitting(vNode)
        } else {
          updateDom(vNode, vNode.dom)
        }
      } else {
        vNode.dom = createDom(vNode)
      }
    }
    if (vNode.props.ref) {
      vNode.props.ref.current = vNode.dom
    }
    vNode.child = reconcileChildren(this.appCtx, vNode, vNode.props.children)
  }
}
function handleTextNodeSplitting(vNode: VNode) {
  if (vNode.sibling?.type === et.text) {
    let prev = vNode
    let sibling: VNode | undefined = vNode.sibling
    while (sibling) {
      if (sibling.type !== et.text) break
      sibling.dom = (prev.dom as Text)!.splitText(prev.props.nodeValue.length)
      prev = sibling
      sibling = sibling.sibling
    }
  }
}

const currentDom = () => {
  let n = hydrationStack[hydrationStack.length - 1].childNodes[
    childIndexStack[childIndexStack.length - 1]++
  ] as HTMLElement | SVGElement | Text | Comment

  while (n instanceof Comment)
    n = n.nextSibling as HTMLElement | SVGElement | Text | Comment

  return n
}
