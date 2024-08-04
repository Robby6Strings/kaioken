import { Component } from "./component.js"
import { renderMode } from "./globals.js"

type SuspenseProps = {
  fallback: JSX.Element
  children: JSX.Children
}

export type StatefulPromise<T> = Promise<T> & {
  status?: "fulfilled" | "rejected" | "pending"
  value: T
  reason?: unknown
}

export class Suspense extends Component<SuspenseProps> {
  state = {
    promises: new Array<StatefulPromise<unknown>>(),
  }
  constructor(props: SuspenseProps) {
    super(props)
  }

  handleThrow(value: unknown): boolean {
    if (!(value instanceof Promise)) return false
    if (!this.state.promises.includes(value as StatefulPromise<unknown>)) {
      queueMicrotask(() => {
        this.state.promises.push(value as StatefulPromise<unknown>)
        this.setState(() => ({ ...this.state }))
        value
          .then(() => this.setState(() => ({ ...this.state })))
          .catch((err) => Component.emitThrow(this.vNode.parent!, err))
      })
      // if (renderMode.current === "dom") {
      //   this.setState(() => ({ ...this.state }))
      //   value
      //     .then(() => this.setState(() => ({ ...this.state })))
      //     .catch((err) => Component.emitThrow(this.vNode.parent!, err))
      // } else if (renderMode.current === "hydrate") {
      //   //debugger
      //   console.log("suspense.handleThrow - hydrate")
      //   //value.then(() => {})
      // }
    }
    return true
  }

  render(): JSX.Element {
    if (renderMode.current === "stream" || renderMode.current === "string") {
      return this.props.fallback
    }

    if (this.state.promises.length === 0) {
      // initially return children in order to trigger thrown promises
      return this.props.children
    } else if (this.state.promises.every((p) => p.status === "fulfilled")) {
      return this.props.children
    } else {
      return this.props.fallback
    }
  }
}
