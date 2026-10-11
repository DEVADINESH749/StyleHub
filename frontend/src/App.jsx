import { useEffect, useState } from "react";
import React from "react";
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

  // --------------------------------------------------
  // Check existing login when application starts
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      checkUserRole(token);
    }
  }, []);

  // --------------------------------------------------
  // Check whether logged-in user is admin
  // --------------------------------------------------

  const checkUserRole = async (token) => {
    try {
      const response = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoggedIn(true);
    } catch (error) {
      // Normal customers will receive 403 here.
      // They are still valid logged-in users.

      if (error.response?.status === 403) {
        setIsAdmin(false);
        setLoggedIn(true);
        return;
      }

      // Token is invalid/expired.
      localStorage.removeItem("access_token");

      setLoggedIn(false);
      setIsAdmin(false);
    }
  };

  // --------------------------------------------------
  // Filter products
  // --------------------------------------------------

  const filteredProducts = products
    .filter((product) =>
      product.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" ||
        product.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
    );

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.access_token;

      // Save JWT token
      localStorage.setItem("access_token", token);

      // Check whether this user is admin
      try {
        const adminResponse = await API.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (adminResponse.data.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (adminError) {
        // 403 means normal customer
        if (adminError.response?.status === 403) {
          setIsAdmin(false);
        } else {
          console.error("Admin check error:", adminError);
          setIsAdmin(false);
        }
      }

      setLoggedIn(true);
      setMessage("");

      // Clear login form
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Invalid email or password"
      );

      localStorage.removeItem("access_token");

      setLoggedIn(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load products
  // --------------------------------------------------

  const loadProducts = async () => {
    try {
      const response = await API.get("/products/");
      setProducts(response.data);
    } catch (error) {
      console.error("Products error:", error);
      setMessage("Unable to load products");
    }
  };

  // --------------------------------------------------
  // Load cart
  // --------------------------------------------------

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
      });

      setCart(response.data);
    } catch (error) {
      console.error("Cart error:", error);
      setMessage("Unable to load your cart");
    }
  };

  // --------------------------------------------------
  // Load products and cart for normal customers
  // --------------------------------------------------

  useEffect(() => {
    if (loggedIn && !isAdmin) {
      loadProducts();
      loadCart();
    }
  }, [loggedIn, isAdmin]);

  // --------------------------------------------------
  // Add product to cart
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Update cart quantity
  // --------------------------------------------------

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
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // --------------------------------------------------
  // Remove product from cart
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Login screen
  // --------------------------------------------------

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

          {/* Login form panel */}

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
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
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

              <div className="mt-8 rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Demo account
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  deva@example.com
                </p>

                <p className="text-sm text-gray-700">
                  Test@123
                </p>

              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ADMIN DASHBOARD
  // --------------------------------------------------

  if (isAdmin) {
    return (
      <AdminDashboard />
    );
  }

  // --------------------------------------------------
  // CUSTOMER SHOP
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-white text-gray-900">

      <Navbar cartCount={cart.length} />

      <Hero />

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Products heading */}

        <div
          id="products"
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >

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

        {/* Search and category filters */}

        <div
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

        </div>

        {/* Product grid */}

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

        {/* Notification */}

        {message && (
          <div
            role="status"
            className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-gray-950 px-5 py-3 text-center text-sm font-medium text-white shadow-xl"
          >
            {message}
          </div>
        )}

        {/* Cart */}

        <Cart
          cart={cart}
          products={products}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeCartItem}
        />

        {/* Checkout */}

        <Checkout cart={cart} />

        {/* My Orders */}

        <MyOrders />

        {/* Logout */}

        <div className="mt-12 flex justify-center">

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600"
          >
            Sign Out
          </button>

        </div>

      </main>

      <Footer />

    </div>
  );
}

export default App;