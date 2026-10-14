import { useEffect, useState } from "react";

import API from "./api";

import AdminDashboard from "./pages/AdminDashboard";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==================================================
  // CHECK EXISTING LOGIN WHEN APPLICATION STARTS
  // ==================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    checkUserRole(token);
  }, []);

  // ==================================================
  // CHECK WHETHER LOGGED-IN USER IS ADMIN
  // ==================================================

  const checkUserRole = async (token) => {
    try {
      const response = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      if (response.data?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoggedIn(true);
    } catch (error) {
      console.log(
        "Role check:",
        error.response?.status || error.message
      );

      // Normal customers receive 403 from admin endpoint.
      if (error.response?.status === 403) {
        setIsAdmin(false);
        setLoggedIn(true);
        return;
      }

      // Any other error means the token may be invalid.
      localStorage.removeItem("access_token");
      setLoggedIn(false);
      setIsAdmin(false);
    }
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await API.post(
        "/auth/login",
        {
          email: email.trim(),
          password,
        },
        {
          timeout: 10000,
        }
      );

      const token = response.data?.access_token;

      if (!token) {
        throw new Error("Access token was not returned by the server.");
      }

      // Save JWT
      localStorage.setItem("access_token", token);

      // Login itself is successful.
      // Immediately leave the login screen.
      setLoggedIn(true);
      setIsAdmin(false);

      setEmail("");
      setPassword("");
      setMessage("");

      // Stop the "Signing in..." button immediately.
      setLoading(false);

      // --------------------------------------------------
      // Check admin in background.
      // This must NEVER block customer login.
      // --------------------------------------------------

      try {
        const adminResponse = await API.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });

        if (adminResponse.data?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (adminError) {
        console.log(
          "Admin check:",
          adminError.response?.status || adminError.message
        );

        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Invalid email or password";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "Server connection timed out. Please check the backend.";
      } else if (!error.response) {
        errorMessage =
          "Unable to connect to backend. Please start the FastAPI server.";
      }

      localStorage.removeItem("access_token");

      setLoggedIn(false);
      setIsAdmin(false);
      setMessage(errorMessage);

      setLoading(false);
    }
  };

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  const loadProducts = async () => {
    try {
      const response = await API.get("/products/", {
        timeout: 10000,
      });

      setProducts(response.data);
    } catch (error) {
      console.error("Products error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to load products"
      );
    }
  };

  // ==================================================
  // LOAD CART
  // ==================================================

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      const response = await API.get("/cart/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      setCart(response.data);
    } catch (error) {
      console.error("Cart error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        setLoggedIn(false);
        setIsAdmin(false);
        return;
      }

      setMessage(
        error.response?.data?.detail ||
          "Unable to load your cart"
      );
    }
  };

  // ==================================================
  // LOAD PRODUCTS AND CART FOR CUSTOMERS
  // ==================================================

  useEffect(() => {
    if (loggedIn && !isAdmin) {
      loadProducts();
      loadCart();
    }
  }, [loggedIn, isAdmin]);

  // ==================================================
  // FILTER PRODUCTS
  // ==================================================

  const filteredProducts = products
    .filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" ||
        product.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
    );

  // ==================================================
  // ADD PRODUCT TO CART
  // ==================================================

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage("Please login first");
        return;
      }

      await API.post(
        "/cart/",
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      await loadCart();

      setMessage("Product added to cart successfully!");
    } catch (error) {
      console.error("Add cart error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to add product to cart"
      );
    }
  };

  // ==================================================
  // UPDATE CART QUANTITY
  // ==================================================

  const updateCartQuantity = async (cartId, quantity) => {
    try {
      const item = cart.find(
        (cartItem) => cartItem.id === cartId
      );

      if (!item) {
        setMessage("Cart item not found");
        return;
      }

      if (quantity < 1) {
        return;
      }

      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage("Please login first");
        return;
      }

      await API.put(
        `/cart/${cartId}`,
        {
          product_id: item.product_id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      await loadCart();

      setMessage("Cart quantity updated!");
    } catch (error) {
      console.error("Update cart error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to update cart quantity"
      );
    }
  };

  // ==================================================
  // REMOVE PRODUCT FROM CART
  // ==================================================

  const removeCartItem = async (cartId) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage("Please login first");
        return;
      }

      await API.delete(`/cart/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      await loadCart();

      setMessage("Product removed from cart!");
    } catch (error) {
      console.error("Remove cart error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to remove product"
      );
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setLoggedIn(false);
    setIsAdmin(false);

    setProducts([]);
    setCart([]);

    setSearchTerm("");
    setSelectedCategory("All");

    setEmail("");
    setPassword("");
    setMessage("");
  };

  // ==================================================
  // LOGIN SCREEN
  // ==================================================

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="grid min-h-screen lg:grid-cols-2">

          {/* Welcome panel */}

          <div className="hidden items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 p-10 lg:flex">
            <div className="max-w-lg text-white">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
                Welcome to
              </p>

              <h1 className="mt-4 text-5xl font-bold tracking-tight xl:text-6xl">
                STYLE<span className="text-indigo-400">HUB</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-300">
                Discover your style. Shop the latest fashion
                and create a look that feels uniquely yours.
              </p>

              <div className="mt-10 flex flex-wrap gap-8">

                <div>
                  <p className="text-3xl font-bold">
                    100+
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Fashion Items
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">
                    24/7
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Shopping
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">
                    Secure
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Payments
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Login form */}

          <div className="flex items-center justify-center bg-white px-5 py-12 sm:px-8">
            <div className="w-full max-w-md">

              <div className="mb-10 text-center lg:hidden">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  STYLE<span className="text-indigo-600">HUB</span>
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Fashion made simple
                </p>
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your details to continue shopping with StyleHub.
              </p>

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >

                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {message && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {message}
                </div>
              )}

              <p className="mt-8 text-center text-xs text-gray-500">
                Sign in with your StyleHub account to continue.
              </p>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  if (isAdmin) {
    return <AdminDashboard />;
  }

  // ==================================================
  // CUSTOMER SHOP
  // ==================================================

  return (
    <div
      id="home"
      className="min-h-screen bg-white text-gray-900"
    >

      {/* NAVBAR */}

      <Navbar cartCount={cart.length} />

      {/* HERO */}

      <Hero />

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* PRODUCTS */}

        <section id="products">

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Our Collection
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trending Products
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Explore our latest fashion collection and find
                something that fits your style.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="self-start rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-indigo-500 hover:text-indigo-600 sm:self-auto"
            >
              View All
            </button>

          </div>

          {/* SEARCH / CATEGORIES */}

          <section
            id="categories"
            className="mb-8 space-y-5"
          >

            <label
              htmlFor="product-search"
              className="sr-only"
            >
              Search products
            </label>

            <input
              id="product-search"
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
            />

            <div className="flex flex-wrap gap-3">

              {[
                "All",
                "Men",
                "Women",
                "Accessories",
                "Footwear",
              ].map((category) => (

                <button
                  key={category}
                  type="button"
                  aria-pressed={
                    selectedCategory === category
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500 hover:text-indigo-600"
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>

            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} of{" "}
              {products.length} products
            </p>

          </section>

          {/* PRODUCT GRID */}

          {products.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">

              <div className="text-5xl">
                🛍️
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No products available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Products will appear here once they are added.
              </p>

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No products found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search term or select a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />

              ))}

            </div>

          )}

          {/* NOTIFICATION */}

          {message && (
            <div
              role="status"
              className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-gray-950 px-5 py-3 text-center text-sm font-medium text-white shadow-xl"
            >
              {message}
            </div>
          )}

          {/* CART */}

          <section
            id="cart"
            className="scroll-mt-24"
          >
            <Cart
              cart={cart}
              products={products}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeCartItem}
            />
          </section>

          {/* CHECKOUT */}

          <Checkout cart={cart} />

          {/* ORDERS */}

          <section
            id="orders"
            className="scroll-mt-24"
          >
            <MyOrders />
          </section>

          {/* LOGOUT */}

          <div className="mt-12 flex justify-center">

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600"
            >
              Sign Out
            </button>

          </div>

        </section>
      </main>

      {/* FOOTER */}

      <Footer />

    </div>
  );
}

export default App;