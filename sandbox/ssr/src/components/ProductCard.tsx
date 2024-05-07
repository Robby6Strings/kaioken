export function ProductCard({ product }: { product: Product }) {
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
