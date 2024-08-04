import { componentSymbol } from "./constants.js"
import { node } from "./globals.js"
import { isVNode } from "./utils.js"

export { Component }

export type ComponentConstructor = new <T = Record<string, unknown>>(
  props: T
) => Component<T>

abstract class Component<T = Record<string, unknown>> {
  static [componentSymbol] = true
  doNotModifyDom = false
  state = {} as Record<string, unknown>
  props: T
  vNode: Kaioken.VNode
  constructor(props: T) {
    this.props = props
    this.vNode = node.current!
  }
  abstract render(): JSX.Element

  static isCtor(type: unknown): type is ComponentConstructor {
    return typeof type === "function" && componentSymbol in type
  }
  static isCtorNode(
    type: unknown
  ): type is Kaioken.VNode & { type: ComponentConstructor } {
    return isVNode(type) && Component.isCtor(type?.type)
  }

  static emitThrow(node: Kaioken.VNode, value: unknown) {
    try {
      let n: Kaioken.VNode | undefined = node
      while (n) {
        if (n.instance?.handleThrow?.(value)) return
        n = n.parent
      }
    } catch (error) {
      return error
    }
    return value
  }

  setState(setter: (state: this["state"]) => this["state"]) {
    this.state = setter({ ...this.state })
    if (this.shouldComponentUpdate(this.props, this.state)) {
      queueMicrotask(() => this.vNode.ctx.requestUpdate(this.vNode))
    }
  }

  /**
   * Allows observation of errors or values thrown by children.
   *
   * Return `true` to indicate that the throw was handled, preventing it from bubbling further.
   */
  handleThrow?(value: unknown): boolean
  /**
   * Called immediately after the component mounts.
   */
  componentDidMount?(): void
  /**
   * Called immediately after the component updates.
   */
  componentDidUpdate?(): void
  /**
   * Called immediately before the component unmounts.
   */
  componentWillUnmount?(): void
  /**
   * Called when the component may possibly re-render. Return `false` to prevent re-render.
   */
  shouldComponentUpdate(props: T, state: this["state"]): boolean
  shouldComponentUpdate(): boolean {
    return true
  }
}
