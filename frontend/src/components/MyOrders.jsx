
import { useEffect, useState } from "react";
import API from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await API.get("/orders/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Your Account
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            My Orders
          </h2>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-indigo-500 disabled:opacity-50"
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading orders...</p>
      ) : message ? (
        <p role="alert" className="mt-6 text-red-600">
          {message}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-gray-500">
          You have not placed any orders yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  Order #{order.id}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Total: ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </p>
              </div>

              <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyOrders;