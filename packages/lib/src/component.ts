import { componentSymbol } from "./constants.js"
import type { AppContext } from "./appContext.js"
import { node, nodeToCtxMap } from "./globals.js"

export { Component }

abstract class Component<T = Record<string, unknown>> {
  doNotModifyDom = false
  static [componentSymbol] = true
  state = {} as Record<string, unknown>
  props: T
  vNode: Kaioken.VNode
  ctx: AppContext
  constructor(props: T) {
    this.props = props
    this.vNode = node.current!
    this.ctx = nodeToCtxMap.get(this.vNode)!
  }
  abstract render(): JSX.Element

  setState(setter: (state: this["state"]) => this["state"]) {
    const newState = setter({ ...this.state })
    if (this.shouldComponentUpdate(this.props, newState, this.state)) {
      queueMicrotask(() => this.ctx.requestUpdate(this.vNode))
    }
    this.state = newState
  }

  static isCtor(type: unknown): type is typeof Component {
    return !!type && typeof type === "function" && componentSymbol in type
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

  handleThrow?(value: unknown): boolean
  componentDidMount?(): void
  componentDidUpdate?(): void
  componentWillUnmount?(): void
  shouldComponentUpdate(
    nextProps: T,
    nextState: this["state"],
    prevState: this["state"]
  ): boolean
  shouldComponentUpdate(
    _: T,
    nextState: this["state"],
    prevState: this["state"]
  ): boolean {
    return prevState !== nextState
  }
}
