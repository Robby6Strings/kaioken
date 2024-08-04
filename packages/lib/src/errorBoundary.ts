import { Component } from "./component.js"
import { renderMode } from "./globals.js"

type ErrorBoundaryProps = {
  debug?: boolean
  fallback: JSX.Element
  children: JSX.Children
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: { error?: Error } = {}
  constructor(props: ErrorBoundaryProps) {
    super(props)
  }

  handleThrow(value: unknown): boolean {
    if (!(value instanceof Error)) return false
    if (this.props.debug) {
      console.error("[kaioken]: ErrorBoundary debug\n", value)
    }
    if (renderMode.current === "stream" || renderMode.current === "string") {
      throw new Component.ThrowableFallbackElement(this.props.fallback)
    }
    this.setState(() => ({ error: value }))
    return true
  }

  render(): JSX.Element {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
