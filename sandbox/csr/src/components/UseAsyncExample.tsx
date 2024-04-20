import { useAsync, useState } from "kaioken"
import { Spinner } from "./atoms/Spinner"
import { ProductCard } from "./ProductCard"

export function UseAsyncExample() {
  const [productId, setProductId] = useState(1)

  const [data, loading, error] = useAsync<Product>(async () => {
    return await fetch(`https://dummyjson.com/products/${productId}`).then(
      (r) => r.json()
    )
  }, [productId])

  return (
    <div>
      <button onclick={() => setProductId((prev) => prev + 1)}>Next</button>
      {data ? (
        <ProductCard product={data} />
      ) : loading ? (
        <Spinner />
      ) : (
        <p>{error.message}</p>
      )}
    </div>
  )
}
