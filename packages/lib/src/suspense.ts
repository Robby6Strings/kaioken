import { Component } from "./component.js"

type SuspenseProps = {
  fallback: JSX.Element
  children: JSX.Children
}

export class Suspense extends Component<SuspenseProps> {
  state = {
    promises: new Set<Promise<unknown>>(),
    resolved: false,
  }
  constructor(props: SuspenseProps) {
    super(props)
  }

  handleThrow(value: unknown): boolean {
    if (!(value instanceof Promise)) return false

    if (!this.state.promises.has(value)) {
      this.state.promises.add(value)
      this.setState(() => ({ promises: this.state.promises, resolved: false }))
      value
        .then(() =>
          this.setState(() => ({
            promises: this.state.promises,
            resolved: true,
          }))
        )
        .catch((err) => Component.emitThrow(this.vNode.parent!, err))
    }
    return true
  }

  render(): JSX.Element {
    if (this.state.promises.size === 0) {
      /**
       * initially return children in order
       * to trigger thrown promises
       */
      return this.props.children
    } else if (this.state.resolved) {
      return this.props.children
    } else {
      return this.props.fallback
    }
  }
}
