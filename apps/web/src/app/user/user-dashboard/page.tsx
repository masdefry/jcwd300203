'use client';
import { useState, useEffect, ChangeEvent } from "react";
import instance from "@/utils/axiosInstance";
import Wrapper from "@/components/layout/Wrapper";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";

type Status = {
  Status: string;
};

type Property = {
  id: number;
  name: string;
  address: string;
  img: string | null;
  price: number | null;
};

type Order = {
  id: number;
  property: Property;
  status: Status[];
  checkInDate: string;
  checkOutDate: string;
  customerId: number;
  price: number;
  paymentMethod: string;
  proofOfPayment: string | null;
};

const MyBookingsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await instance.get<{ data: Order[] }>("orders/");
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (orderId: number, customerId: number) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("usersId", customerId.toString());

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

  const handleCancel = async (orderId: number, customerId: number) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const response = await instance.post(`/orders/${orderId}/cancel`, {
        usersId: customerId,
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel the order.");
    }
  };

  const pendingOrders = orders.filter((order) =>
    order.status.some((s) => s.Status === "WAITING_FOR_PAYMENT" || s.Status === "WAITING_FOR_CONFIRMATION")
  );

  const confirmedOrders = orders.filter((order) =>
    order.status.some((s) => s.Status === "CONFIRMED")
  );

  const renderCard = (order: Order) => {
    const isOnlinePayment = order.paymentMethod === "GATEWAY";
    const isConfirmed = order.status.some((s) => s.Status === "CONFIRMED");
    const hasProofOfPayment = !!order.proofOfPayment;

    return (
      <div
        key={order.id}
        className="flex flex-col md:flex-row items-start md:items-center bg-white shadow rounded-lg p-4 mb-4 border hover:shadow-md transition-shadow"
      >
        {/* Property Image */}
        <img
          src={order.property?.img || "/placeholder.jpg"}
          alt={order.property?.name || "Property"}
          className="w-full md:w-24 h-24 object-cover rounded-lg mb-4 md:mb-0 mr-0 md:mr-4"
        />

        {/* Booking Details */}
        <div className="flex-1">
          <h4 className="text-lg font-semibold mb-1">{order.property?.name || "Property Name"}</h4>
          <p className="text-gray-500 text-sm mb-1">{order.property?.address || "No address available"}</p>
          <p className="text-gray-500 text-sm mb-1">
            {new Date(order.checkInDate).toLocaleDateString()} - {new Date(order.checkOutDate).toLocaleDateString()}
          </p>
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded ${
              isConfirmed
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {order.status
            .map((s) => s.Status.replace(/_/g, ' ').toLowerCase())
            .map((status) =>
              status.charAt(0).toUpperCase() + status.slice(1)
            )
            .join(", ")} 
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-4 md:mt-0">
          {!hasProofOfPayment && !isOnlinePayment && !isConfirmed && (
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                className="bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600 w-fit"
                onClick={() => handleUpload(order.id, order.customerId)}
              >
                Upload Proof
              </button>
            </div>
          )}

          <button
            className={`${
              hasProofOfPayment || isOnlinePayment || isConfirmed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            } text-white text-sm py-1 px-3 rounded w-fit`}
            disabled={hasProofOfPayment || isOnlinePayment || isConfirmed}
            onClick={() => handleCancel(order.id, order.customerId)}
          >
            Cancel
          </button>
        </div>

        {/* Booking Price */}
        <div className="mt-4 md:mt-0 md:ml-4 text-right">
          <p className="text-lg font-semibold text-gray-700">
            {order.price
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(order.price)
              : "N/A"}
          </p>
        </div>
      </div>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Wrapper>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto py-12 px-8">
          <h1 className="text-3xl font-bold text-center mb-6">Bookings & Trips</h1>
          <p className="text-center text-gray-500 mb-12">
            View your pending and confirmed bookings below.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeTab === "confirmed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("confirmed")}
            >
              Confirmed
            </button>
          </div>

          {/* Content */}
          {activeTab === "pending" && (
            <div>
              {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => renderCard(order))
              ) : (
                <p className="text-center text-gray-500">No pending bookings available.</p>
              )}
            </div>
          )}
          {activeTab === "confirmed" && (
            <div>
              {confirmedOrders.length > 0 ? (
                confirmedOrders.map((order) => renderCard(order))
              ) : (
                <p className="text-center text-gray-500">No confirmed bookings available.</p>
              )}
            </div>
          )}
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

export default MyBookingsPage;

//  {/* Footer */}
//  <section className="footer_one">
//  <div className="container">
//    <div className="row">
//      <Footer />
//    </div>
//  </div>
// </section>

// {/* Footer Bottom Area */}
// <section className="footer_middle_area pt40 pb40">
//  <div className="container">
//    <CopyrightFooter />
//  </div>
// </section>