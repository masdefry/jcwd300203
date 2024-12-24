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
        const response = await instance.get("orders/");
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  console.log("orders returned: ", orders)

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Split orders by status
  const confirmedOrders = orders.filter((order: any) =>
    order.status.some((s: any) => s.Status === "CONFIRMED")
  );
  
  const pendingOrders = orders.filter((order: any) =>
    order.status.some((s: any) => s.Status === "WAITING_FOR_PAYMENT" || s.Status === "WAITING_FOR_CONFIRMATION")
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

const OrdersTable = ({ orders }: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (orderId: any, customerId: any) => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file); // Use "file" as the field name
    formData.append("usersId", customerId) 
    
    try {
      const response = await instance.post(`transaction/upload-proof/${orderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload proof of payment.");
    }
  };
   

  const handleCancel = async (orderId: any, customerId: number, proofOfPayment: string | null) => {
    // Check if proof of payment has been uploaded
    if (proofOfPayment) {
        alert("Cancellation is not allowed since proof of payment has been uploaded.");
        return;
    }

    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    // set customerId to usersId
    const usersId = customerId

    try {
      const response = await instance.post(`/orders/${orderId}/cancel`, {
        usersId, 
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel the order.");
    }
  };

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
          <th className="border border-gray-300 px-4 py-2">Proof of Payment</th>
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order: any) => (
          <tr key={order.id}>
            <td className="border border-gray-300 px-4 py-2">{order.id}</td>
            <td className="border border-gray-300 px-4 py-2">{order.property.name || "N/A"}</td>
            <td className="border border-gray-300 px-4 py-2">{order.status?.map((s: any) => s.Status).join(", ") || "N/A"}</td>
            <td className="border border-gray-300 px-4 py-2">{new Date(order.date).toLocaleDateString()}</td>
            <td className="border border-gray-300 px-4 py-2">
              {order.proofOfPayment ? (
                <span>Uploaded</span>
              ) : (
                <div>
                  <input type="file" onChange={handleFileChange} />
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                    onClick={() => handleUpload(order.id, order.customerId)}
                  >
                    Upload
                  </button>
                </div>
              )}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {order.proofOfPayment ? (
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded cursor-not-allowed"
                  disabled
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleCancel(order.id, order.customerId, order.proofOfPayment)}
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

export default MyOrdersPage;