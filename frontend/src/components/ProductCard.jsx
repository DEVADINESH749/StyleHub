function ProductCard({ product, onAddToCart }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl">👕</div>
              <p className="mt-2 text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
          {product.category}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5">

        <h3 className="line-clamp-1 text-base font-semibold text-gray-900 sm:text-lg">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
          {product.description || "Premium fashion product"}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">

          <p className="text-lg font-bold text-gray-900 sm:text-xl">
            ₹{product.price}
          </p>

          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600 active:scale-95 sm:px-4 sm:text-sm"
          >
            Add to Cart
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProductCard;