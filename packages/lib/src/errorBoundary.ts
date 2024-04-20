import { Component } from "./component.js"

type ErrorBoundaryProps = {
  debug?: boolean
  fallback: JSX.Element
  children: JSX.Children
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = {
    error: undefined as Error | undefined,
  }
  constructor(props: ErrorBoundaryProps) {
    super(props)
  }

  handleThrow(value: unknown): boolean {
    if (!(value instanceof Error)) return false
    if (this.props.debug) console.error(value)

    this.setState(() => ({ error: value }))
    return true
  }

  render(): JSX.Element {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
