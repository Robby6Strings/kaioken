import { EFFECT_TAG } from "./constants.js"
import { createElement } from "./element.js"
import { __DEV__ } from "./env.js"
import { renderMode } from "./globals.js"
import { hydrationStack } from "./hydration.js"
import { Scheduler } from "./scheduler.js"

type VNode = Kaioken.VNode

export interface AppContextOptions {
  root: HTMLElement
  /**
   * Sets the maximum render refresh time.
   * @default 50
   */
  maxFrameMs?: number
  name?: string
}

export class AppContext<T extends Record<string, unknown> = {}> {
  id: number
  name: string
  scheduler: Scheduler | undefined
  rootNode: VNode | undefined = undefined
  hookIndex = 0
  root?: HTMLElement
  mounted = false
  promiseId = 0
  selfPromiseResolver: undefined | [(ctx: AppContext<T>) => void, number]

  constructor(
    private appFunc: (props: T) => JSX.Element,
    private appProps = {},
    private options?: AppContextOptions
  ) {
    this.id = Date.now()
    this.name = options?.name ?? "App-" + this.id
    this.root = options?.root
  }

  mount() {
    return new Promise<AppContext<T>>((resolve) => {
      if (this.mounted) return resolve(this)
      this.selfPromiseResolver = [resolve, this.promiseId++]
      this.scheduler = new Scheduler(this, this.options?.maxFrameMs ?? 50)
      if (renderMode.current === "hydrate") {
        hydrationStack.captureEvents(this.root!, this.scheduler)
      }
      const appNode = createElement(this.appFunc, this.appProps as T)
      this.rootNode = createElement(
        this.root!.nodeName.toLowerCase(),
        {},
        appNode
      )
      this.rootNode.depth = 0
      appNode.depth = 1
      if (__DEV__) {
        if (this.root) {
          this.root.__kaiokenNode = this.rootNode
        }
      }

      this.rootNode.dom = this.root
      this.scheduler.queueUpdate(this.rootNode)
      this.scheduler.nextIdle(() => {
        this.mounted = true
        window.__kaioken?.emit("mount", this as AppContext<any>)
        this.selfPromiseResolver = undefined
        resolve(this)
      })
    })
  }

  unmount() {
    return new Promise<AppContext<T>>((resolve) => {
      if (!this.mounted) return resolve(this)
      if (!this.rootNode?.child) return resolve(this)
      this.selfPromiseResolver = [resolve, this.promiseId++]
      this.requestDelete(this.rootNode.child)

      this.scheduler?.nextIdle(() => {
        this.selfPromiseResolver = undefined
        this.scheduler = undefined
        this.rootNode && (this.rootNode.child = undefined)
        this.mounted = false
        window.__kaioken?.emit("unmount", this as AppContext<any>)
        resolve(this)
      })
    })
  }

  setProps(fn: (oldProps: T) => T) {
    const rootChild = this.rootNode?.child
    const scheduler = this.scheduler
    if (!this.mounted || !rootChild || !scheduler)
      throw new Error(
        "[kaioken]: failed to apply new props - ensure the app is mounted"
      )
    if (this.selfPromiseResolver) {
      const [_promise, _pid] = this.selfPromiseResolver
      console.debug("[kaioken]: early resolving promise", _pid)
      _promise(this)
      this.selfPromiseResolver = undefined
    }
    const pId = this.promiseId++
    let didResolve = false
    return new Promise<AppContext<T>>((resolve) => {
      this.selfPromiseResolver = [resolve, pId]
      console.debug("[kaioken]: applying new props", pId)
      scheduler.clear()
      const { children, ref, key, ...rest } = rootChild.props
      rootChild.props = {
        ...Object.assign(rest, fn(rest as T)),
        children,
        ref,
        key,
      }
      scheduler.queueUpdate(rootChild)
      scheduler.nextIdle(() => {
        this.selfPromiseResolver = undefined
        didResolve = true
        console.debug("[kaioken]: props applied", pId)
        resolve(this)
      })
      setTimeout(() => {
        if (!didResolve) {
          console.error(
            "[kaioken]: failed to apply new props in lt 500ms",
            pId,
            this
          )
          debugger
        }
      }, 2000)
    })
  }

  requestUpdate(node: VNode) {
    if (node.effectTag === EFFECT_TAG.DELETION) return
    if (renderMode.current === "hydrate") {
      return this.scheduler?.nextIdle((s) => {
        node.effectTag !== EFFECT_TAG.DELETION && s.queueUpdate(node)
      })
    }
    this.scheduler?.queueUpdate(node)
  }

  requestDelete(node: VNode) {
    if (node.effectTag === EFFECT_TAG.DELETION) return
    if (renderMode.current === "hydrate") {
      return this.scheduler?.nextIdle((s) => {
        node.effectTag !== EFFECT_TAG.DELETION && s.queueDelete(node)
      })
    }
    this.scheduler?.queueDelete(node)
  }

  queueEffect(vNode: VNode, effect: Function) {
    this.scheduler?.queueEffect(vNode, effect)
  }

  queueImmediateEffect(vNode: VNode, effect: Function) {
    this.scheduler?.queueImmediateEffect(vNode, effect)
  }
}
