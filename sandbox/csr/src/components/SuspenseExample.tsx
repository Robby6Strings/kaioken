import { Suspense, useSuspense, signal, ErrorBoundary } from "kaioken"
import { Spinner } from "./atoms/Spinner"

type Product = {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

const productId = signal(1)
let cache = new Map()

function useCachedFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const key = JSON.stringify({ input, init })
  console.log("key", key)
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(input, init).then(async (r) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        if (r.status >= 400) {
          throw new Error("Bad response")
        }
        return r.json()
      })
    )
  }
  return cache.get(key)
}

export function SuspenseExample() {
  return (
    <div>
      <button onclick={() => productId.value++}>Next Product</button>
      <Suspense
        fallback={
          <div data-test="true">
            <Spinner />
          </div>
        }
      >
        <ErrorBoundary
          logger={console.error}
          fallback={<p>⚠️ Something went wrong 😭</p>}
        >
          <SomeComponentThatThrows />
        </ErrorBoundary>
        <SomeAsyncComponent />
      </Suspense>
    </div>
  )
}

function SomeComponentThatThrows() {
  throw new Error("oops!")
  return <div>Something you'll never see because I throw</div>
}

function SomeAsyncComponent() {
  const productPromise = useCachedFetch<Product>(
    `https://dummyjson.com/products/${productId}`
  )
  const product = useSuspense(productPromise)
  // @ts-ignore
  window.test = true

  return (
    <div>
      <h1>
        {product.title} <sup>({product.id})</sup>
      </h1>
      <p>{product.description}</p>

      <img src={product.thumbnail} />
    </div>
  )
}
