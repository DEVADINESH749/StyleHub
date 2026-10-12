import React, { useEffect, useState } from "react";
import API from "../api";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
  });

  // ==================================================
  // AUTH CONFIG
  // ==================================================

  const token = localStorage.getItem("access_token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==================================================
  // ADMIN LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  // ==================================================
  // LOAD ADMIN DATA
  // ==================================================

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        API.get("/admin/orders", config),
        API.get("/admin/products", config),
      ]);

      setOrders(ordersResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Admin data error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FORM INPUT
  // ==================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // ==================================================
  // RESET FORM
  // ==================================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image_url: "",
    });

    setEditingProduct(null);
  };

  // ==================================================
  // ADD / UPDATE PRODUCT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      alert("Please fill Name, Price and Category.");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url.trim(),
      };

      if (editingProduct) {
        await API.put(
          `/admin/products/${editingProduct.id}`,
          productData,
          config
        );

        alert("Product updated successfully.");
      } else {
        await API.post(
          "/admin/products",
          productData,
          config
        );

        alert("Product added successfully.");
      }

      resetForm();
      await fetchAdminData();
    } catch (error) {
      console.error("Product save error:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // EDIT PRODUCT
  // ==================================================

  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      image_url: product.image_url || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE PRODUCT
  // ==================================================

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/admin/products/${productId}`,
        config
      );

      alert("Product deleted successfully.");

      if (editingProduct?.id === productId) {
        resetForm();
      }

      await fetchAdminData();
    } catch (error) {
      console.error("Product delete error:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

  // ==================================================
  // STATISTICS
  // ==================================================

  const paidOrders = orders.filter(
    (order) => order.status === "Paid"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status === "Paid")
    .reduce(
      (total, order) =>
        total + Number(order.total_amount),
      0
    );

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              StyleHub Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage products and monitor customer orders.
            </p>
          </div>

          {/* LOGOUT BUTTON */}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
          >
            Sign Out
          </button>
        </div>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL PRODUCTS */}

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">
              Total Products
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {products.length}
            </h2>
          </div>

          {/* TOTAL ORDERS */}

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">
              Total Orders
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {orders.length}
            </h2>
          </div>

          {/* PAID ORDERS */}

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">
              Paid Orders
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {paidOrders}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pending: {pendingOrders}
            </p>
          </div>

          {/* REVENUE */}

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">
              Revenue
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>
          </div>

        </div>

        {/* ==================================================
            ADD / EDIT PRODUCT
        ================================================== */}

        <div className="mb-8 rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-bold text-gray-800">
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5"
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Men">
                    Men
                  </option>

                  <option value="Women">
                    Women
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>

                  <option value="Footwear">
                    Footwear
                  </option>
                </select>
              </div>

              {/* PRICE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {/* IMAGE URL */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Image URL
                </label>

                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        </div>

        {/* ==================================================
            ORDERS
        ================================================== */}

        <div className="mb-8 rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Orders
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="p-4 text-left">
                    Order ID
                  </th>

                  <th className="p-4 text-left">
                    User ID
                  </th>

                  <th className="p-4 text-left">
                    Amount
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-6 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        #{order.id}
                      </td>

                      <td className="p-4">
                        {order.user_id}
                      </td>

                      <td className="p-4">
                        ₹
                        {Number(
                          order.total_amount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">

                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            order.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* ==================================================
            PRODUCTS
        ================================================== */}

        <div className="rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-bold text-gray-800">
              Products ({products.length})
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="p-4 text-left">
                    ID
                  </th>

                  <th className="p-4 text-left">
                    Product
                  </th>

                  <th className="p-4 text-left">
                    Category
                  </th>

                  <th className="p-4 text-left">
                    Price
                  </th>

                  <th className="p-4 text-left">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        {product.id}
                      </td>

                      <td className="p-4 font-medium">
                        {product.name}
                      </td>

                      <td className="p-4">
                        {product.category}
                      </td>

                      <td className="p-4">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">

                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(product)
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;