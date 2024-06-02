import { ErrorBoundary, StatefulPromise, Suspense, signal } from "kaioken"
import { Spinner } from "./atoms/Spinner"
import { ProductCard } from "./ProductCard"
const productId = signal(1)

type CacheOptions = {
  cacheDuration?: number
}

const cache = new Map()
function fetchWithCache<T>(url: string, options?: CacheOptions): Promise<T> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then(async (r) => {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        if (r.status >= 400) {
          throw new Error("Bad response")
        }
        return r.json()
      })
    )
    if (options?.cacheDuration) {
      setTimeout(() => cache.delete(url), options.cacheDuration)
    }
  }
  return cache.get(url)
}

function use<T>(promise: Promise<T>) {
  const _p = promise as StatefulPromise<T>
  if (_p.status === "fulfilled") {
    return _p.value
  } else if (_p.status === "rejected") {
    throw _p.reason
  } else if (_p.status === "pending") {
    throw _p
  } else {
    _p.status = "pending"
    _p.then(
      (result) => {
        _p.status = "fulfilled"
        _p.value = result
      },
      (reason) => {
        _p.status = "rejected"
        _p.reason = reason
      }
    )
    throw promise
  }
}

export function SuspenseExample() {
  return (
    <div>
      <button onclick={() => productId.value++}>Next Product</button>

      <ErrorBoundary fallback={<p>⚠️ Something went wrong 😭</p>}>
        <Suspense fallback={<Spinner />}>
          <SomeAsyncComponent />
        </Suspense>
      </ErrorBoundary>

      {/* <ErrorBoundary fallback={<p>⚠️ Something went wrong 😭</p>}>
        <SomeComponentThatThrows />
      </ErrorBoundary> */}
    </div>
  )
}

// function SomeComponentThatThrows() {
//   throw new Error("oops!")
//   return <div>Something you'll never see because I throw</div>
// }

function SomeAsyncComponent() {
  const data = use<Product>(
    fetchWithCache(`https://dummyjson.com/products/${productId}`, {
      cacheDuration: 10_000,
    })
  )

  return (
    <div>
      <ProductCard product={data} />
    </div>
  )
}
