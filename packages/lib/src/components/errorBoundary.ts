import { renderMode } from "../globals.js"
import { useRef, useThrowHandler } from "../hooks/index.js"

//https://github.com/CrimsonChi/kaioken/blob/Suspense/packages/lib/src/suspense.ts
//https://github.com/CrimsonChi/kaioken/blob/Suspense/sandbox/csr/src/components/SuspenseExample.tsx

export { ErrorBoundary }

type ErrorBoundaryProps = {
  fallback: JSX.Element
  logger?: (error: Error) => void
  children: JSX.Children
}

function ErrorBoundary({ children, fallback, logger }: ErrorBoundaryProps) {
  const err = useRef<Error | null>(null)
  useThrowHandler((error) => {
    if (!(error instanceof Error)) return false

    logger?.(error)
    err.current = error
    return true
  })

  if (renderMode.current === "string" || renderMode.current === "stream") {
    return fallback
  }

  if (err.current) {
    return fallback
  }

  return children
}
