import { renderMode } from "../globals.js"
import { useRef, useRequestUpdate, useThrowHandler } from "../hooks/index.js"

export { Suspense, useSuspense }

type SuspenseProps = {
  fallback: JSX.Element
  children: JSX.Children
}

const PROMISE_STATUS = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: 2,
} as const

type WrappedPromise<T> = Promise<T> & {
  status: (typeof PROMISE_STATUS)[keyof typeof PROMISE_STATUS]
  value: T
  reason?: any
}

function useSuspense<T>(promise: Promise<T>) {
  const p = promise as WrappedPromise<T>
  switch (p.status) {
    case PROMISE_STATUS.FULFILLED:
      return p.value
    case PROMISE_STATUS.REJECTED:
      throw p.reason
    case PROMISE_STATUS.PENDING:
      throw p
    default:
      p.status = PROMISE_STATUS.PENDING
      p.then(
        (result) => {
          p.status = PROMISE_STATUS.FULFILLED
          p.value = result
        },
        (reason) => {
          p.status = PROMISE_STATUS.REJECTED
          p.reason = reason
        }
      )
      throw promise
  }
}

function Suspense({ children, fallback }: SuspenseProps) {
  const requestUpdate = useRequestUpdate()
  const promises = useRef<Set<WrappedPromise<unknown>> | null>(null)

  useThrowHandler((error) => {
    if (!(error instanceof Promise)) return false

    const wrappedPromise = error as WrappedPromise<unknown>
    ;(promises.current ??= new Set()).add(wrappedPromise)
    wrappedPromise.then(requestUpdate)
    return true
  })

  if (renderMode.current === "string" || renderMode.current === "stream") {
    return fallback
  }

  if (!promises.current || promises.current.size === 0) {
    return children
  } else if (
    promises.current
      .values()
      .every((p) => p.status === PROMISE_STATUS.FULFILLED)
  ) {
    return children
  }

  console.log("rendering fallback", fallback)

  return fallback
}
