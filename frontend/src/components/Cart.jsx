
function Cart({ cart, products, onUpdateQuantity, onRemoveItem }) {
  const cartItems = cart.map((item) => {
    const product = products.find(
      (p) => p.id === item.product_id
    );

    return { ...item, product };
  });

  const total = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;

    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <section
      id="cart"
      className="mt-20"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Your Shopping Bag
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          My Cart
        </h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-14 text-center">
          <div className="text-5xl">🛒</div>

          <h3 className="mt-4 text-lg font-semibold">
            Your cart is empty
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Add products to start shopping.
          </p>

          <a
            href="#products"
            className="mt-6 inline-block rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👕</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product?.name || `Product #${item.product_id}`}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {item.product?.category || "Fashion"}
                </p>

                <p className="mt-2 font-bold text-gray-900">
                  ₹{item.product?.price?.toFixed(2) ?? "—"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    onUpdateQuantity(item.id, item.quantity - 1)
                  }
                  className="h-9 w-9 rounded-lg border border-gray-300 font-bold disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-6 text-center font-semibold">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    onUpdateQuantity(item.id, item.quantity + 1)
                  }
                  className="h-9 w-9 rounded-lg border border-gray-300 font-bold"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              <p className="font-bold text-gray-900 sm:min-w-24 sm:text-right">
                ₹{item.product
                  ? (item.product.price * item.quantity).toFixed(2)
                  : "—"}
              </p>
            </div>
          ))}

          <div className="rounded-2xl bg-gray-50 p-5 text-right">
            <p className="text-sm text-gray-500">Cart Total</p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              ₹{total.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;