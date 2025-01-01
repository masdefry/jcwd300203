"use client";
import React, { useState, useEffect } from "react";
import instance from "@/utils/axiosInstance";
import Header from "@/components/home/Header";
import MobileMenu from "@/components/common/header/MobileMenu";
import PopupSignInUp from "@/components/common/PopupSignInUp";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";
import Wrapper from "@/components/layout/Wrapper";

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

  console.log("orders returned: ", orders);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Split orders by status
  const confirmedOrders = orders.filter((order: any) =>
    order.status.some((s: any) => s.Status === "CONFIRMED")
  );

  const pendingOrders = orders.filter((order: any) =>
    order.status.some(
      (s: any) =>
        s.Status === "WAITING_FOR_PAYMENT" || s.Status === "WAITING_FOR_CONFIRMATION"
    )
  );

  return (
    <Wrapper>
      <Header />

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Modal */}
      <PopupSignInUp />

      <div className="bg-gray-900 min-h-screen py-16">
        <div className="container mx-auto bg-gray-100 shadow-lg rounded-lg py-12 px-8 mt-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">My Bookings</h1>

          {/* Pending Orders Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Bookings</h2>
            <OrdersTable orders={pendingOrders} />
          </div>

          {/* Confirmed Orders Table */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Confirmed Bookings</h2>
            <OrdersTable orders={confirmedOrders} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <section className="footer_one">
        <div className="container">
          <div className="row">
            <Footer />
          </div>
        </div>
      </section>

      {/* Footer Bottom Area */}
      <section className="footer_middle_area pt40 pb40">
        <div className="container">
          <CopyrightFooter />
        </div>
      </section>
    </Wrapper>
  );
};

const OrdersTable = ({ orders }: any) => {
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
    formData.append("file", file);
    formData.append("usersId", customerId);

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

  const handleCancel = async (orderId: any, customerId: number) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    const usersId = customerId;

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
    return <p className="text-center text-gray-500">No orders available for this category.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Order ID</th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Property</th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Proof of Payment</th>
            <th className="border border-gray-300 px-4 py-2 text-gray-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => {
            const isOnlinePayment = order.paymentMethod === "GATEWAY";
            const isConfirmed = order.status.some((s: any) => s.Status === "CONFIRMED");
            const hasProofOfPayment = !!order.proofOfPayment;

            return (
              <tr key={order.id}>
                <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                <td className="border border-gray-300 px-4 py-2">{order.property.name || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.status?.map((s: any) => s.Status).join(", ") || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {hasProofOfPayment ? (
                    <span>Uploaded</span>
                  ) : isOnlinePayment || isConfirmed ? (
                    <span>N/A</span>
                  ) : (
                    <div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block mb-2 text-sm"
                      />
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => handleUpload(order.id, order.customerId)}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {hasProofOfPayment || isOnlinePayment || isConfirmed ? (
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                      disabled
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => handleCancel(order.id, order.customerId)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrdersPage;