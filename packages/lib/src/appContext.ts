import { EffectTag } from "./constants.js"
import { contexts } from "./globals.js"
import { createElement } from "./index.js"
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
  scheduler: Scheduler
  rootNode: VNode | undefined = undefined
  hookIndex = 0
  root?: HTMLElement
  mounted = false

  constructor(
    private appFunc: (props: T) => JSX.Element,
    private appProps = {},
    options?: AppContextOptions
  ) {
    this.id = Date.now()
    this.name = options?.name ?? "App-" + this.id
    this.root = options?.root
    this.scheduler = new Scheduler(this, options?.maxFrameMs ?? 50)
    contexts.push(this)
  }

  mount() {
    this.rootNode = createElement(
      this.root!.nodeName.toLowerCase(),
      {},
      createElement(this.appFunc, this.appProps)
    )
    this.rootNode.dom = this.root
    this.scheduler.queueUpdate(this.rootNode)
    this.scheduler.wake()
    return new Promise<AppContext<T>>((resolve) => {
      this.scheduler.nextIdle(() => {
        this.mounted = true
        window.__kaioken?.emit("mount", this as AppContext<any>)
        resolve(this)
      })
    })
  }

  unmount() {
    return new Promise<AppContext<T>>((resolve) => {
      if (!this.rootNode?.child) return resolve(this)
      this.requestDelete(this.rootNode.child)

      this.scheduler.nextIdle(() => {
        this.scheduler.sleep()
        this.rootNode && (this.rootNode.child = undefined)
        this.mounted = false
        window.__kaioken?.emit("unmount", this as AppContext<any>)
        resolve(this)
      })
    })
  }

  setProps(fn: (oldProps: T) => T) {
    if (!this.mounted || !this.rootNode?.child)
      return console.error(
        "[kaioken]: failed to apply new props - ensure the app is mounted"
      )

    const { children, ref, key, ...rest } = this.rootNode.child.props
    const args = rest as T
    Object.assign(this.rootNode.child.props, fn(args))
    this.requestUpdate(this.rootNode.child)
  }

  requestUpdate(node: VNode) {
    if (node.effectTag === EffectTag.DELETION) return
    return this.scheduler.queueUpdate(node)
  }

  requestDelete(node: VNode) {
    if (node.effectTag === EffectTag.DELETION) return
    this.scheduler.queueDelete(node)
  }

  queueEffect(callback: Function) {
    this.scheduler.nodeEffects.push(callback)
  }
}
