"use client";
import React, { useState, useEffect } from "react";
import instance from "@/utils/axiosInstance";

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-1/2">
        <button className="text-gray-500 float-right" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

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
    order.status[0]?.Status === "CONFIRMED"
  );
  
  const pendingOrders = orders.filter((order: any) =>
    order.status[0]?.Status === "WAITING_FOR_PAYMENT" ||
    order.status[0]?.Status === "WAITING_FOR_CONFIRMATION"
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

const OrdersTable = ({ orders }: { orders: any[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Function to handle viewing proof of payment
  const handleViewProof = (proofFileName: string) => {
    const proofURL = `http://localhost:4700/images/${proofFileName}`;
    setSelectedProof(proofURL);
    setIsModalOpen(true);
  };

  if (orders.length === 0) {
    return <p>No orders available for this category.</p>;
  }

  return (
    <div>
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
                {order.proofOfPayment ? (
                  <button
                    className="text-blue-500 underline"
                    onClick={() => handleViewProof(order.proofOfPayment)}
                  >
                    View Proof
                  </button>
                ) : (
                  "Not uploaded"
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.status[0]?.Status === "CONFIRMED" ? (
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded cursor-not-allowed"
                    disabled
                  >
                    Cancel
                  </button>
                ) : !order.proofOfPayment ? (
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      cancelOrder(order.id, order.customer?.id, order.proofOfPayment)
                    }
                  >
                    Cancel
                  </button>
                ) : (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() =>
                        handleConfirmPayment(order.id, "approve", order.customer?.id)
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() =>
                        handleConfirmPayment(order.id, "reject", order.customer?.id)
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Proof of Payment */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-2">Proof of Payment</h2>
        {selectedProof ? (
          <div>
            {/* Display proof as an image */}
            <img src={selectedProof} alt="Proof of Payment" className="w-full h-auto rounded-lg" />
          </div>
        ) : (
          <p>No proof available</p>
        )}
      </Modal>
    </div>
  );
};

const handleConfirmPayment = async (
  bookingId: number,
  action: "approve" | "reject",
  usersId: number
) => {
  const confirmAction = window.confirm(
    `Are you sure you want to ${action} this payment?`
  );
  if (!confirmAction) return;

  try {
    const response = await instance.post(
      `/transaction/${bookingId}/confirm`,
      {
        usersId,
        action,
      }
    );

    alert(response.data.message);
    window.location.reload(); // Refresh to show updated status
  } catch (error: any) {
    alert(
      error.response?.data?.message ||
        `Failed to ${action} the payment. Please try again.`
    );
  }
};

const cancelOrder = async (bookingId: number, usersId: number, proofOfPayment: string | null) => {
  if (proofOfPayment) {
    alert("Cancellation is not allowed since proof of payment has been uploaded.");
    return;
  }

  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this order?"
  );
  if (!confirmCancel) return;

  try {
    const response = await instance.post(`/orders/tenant/${bookingId}/cancel`, {
      usersId,
    });
    alert(response.data.message);
    window.location.reload();
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to cancel the order.");
  }
};

export default MyOrdersPage;