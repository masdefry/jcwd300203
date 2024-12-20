"use client";
import React, { useState, useEffect } from "react";
import instance from "@/utils/axiosInstance";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch order list
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await instance.get("orders/tenant");
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Split orders by status
  const confirmedOrders = orders.filter((order: any) =>
    order.status.some((status: any) => status.Status === "CONFIRMED")
  );
  const pendingOrders = orders.filter((order: any) =>
    order.status.some(
      (status: any) =>
        status.Status === "WAITING_FOR_PAYMENT" ||
        status.Status === "WAITING_FOR_CONFIRMATION"
    )
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {/* Pending Orders Table */}
      <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
      <OrdersTable orders={pendingOrders} />

      {/* Confirmed Orders Table */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Confirmed Orders</h2>
      <OrdersTable orders={confirmedOrders} />
    </div>
  );
};

// Table component for reuse
const OrdersTable = ({ orders }: { orders: any[] }) => {
  if (orders.length === 0) {
    return <p>No orders available for this category.</p>;
  }

  return (
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Order ID</th>
          <th className="border border-gray-300 px-4 py-2">Property</th>
          <th className="border border-gray-300 px-4 py-2">Status</th>
          <th className="border border-gray-300 px-4 py-2">Date</th>
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order: any) => (
          <tr key={order.id}>
            <td className="border border-gray-300 px-4 py-2">{order.id}</td>
            <td className="border border-gray-300 px-4 py-2">
              {order.property?.name || "N/A"}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {order.status && Array.isArray(order.status)
                ? order.status[0]?.Status || "N/A"
                : "N/A"}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {order.status &&
                order.status.some(
                  (status: any) =>
                    status.Status === "WAITING_FOR_PAYMENT" ||
                    status.Status === "WAITING_FOR_CONFIRMATION"
                ) && (
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel
                  </button>
                )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Cancel order handler
const cancelOrder = async (orderId: number) => {
  try {
    const response = await instance.post(`/tenant/${orderId}/cancel`);
    alert(response.data.message);
    window.location.reload();
  } catch (error) {
    alert("Failed to cancel the order.");
  }
};

export default MyOrdersPage;
