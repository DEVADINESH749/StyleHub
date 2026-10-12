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

const handleLogout = () => {
  localStorage.removeItem("access_token");
  window.location.href = "/";
};

<button
  type="button"
  onClick={handleLogout}
  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600"
>
  Sign Out
</button>


















  const token = localStorage.getItem("access_token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      alert("Please fill Name, Price and Category.");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url,
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

  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      image_url: product.image_url || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

      await fetchAdminData();
    } catch (error) {
      console.error("Product delete error:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            StyleHub Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Manage products and monitor customer orders.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Total Products
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {products.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Total Orders
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Paid Orders
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {paidOrders}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Pending: {pendingOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </div>

        </div>

        {/* Add / Edit Product */}
        <div className="bg-white rounded-xl shadow mb-8">

          <div className="p-5 border-b">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2"
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

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>

                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                  className="w-full border rounded-lg px-4 py-2"
                />

              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">

              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
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
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow mb-8">

          <div className="p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Orders
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="text-left p-4">
                    Order ID
                  </th>

                  <th className="text-left p-4">
                    User ID
                  </th>

                  <th className="text-left p-4">
                    Amount
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody>

                {orders.map((order) => (

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
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow">

          <div className="p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Products ({products.length})
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left p-4">
                    ID
                  </th>

                  <th className="text-left p-4">
                    Product
                  </th>

                  <th className="text-left p-4">
                    Category
                  </th>

                  <th className="text-left p-4">
                    Price
                  </th>

                  <th className="text-left p-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

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
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleEdit(product)
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;