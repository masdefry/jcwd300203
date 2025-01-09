"use client";
import { useState, useEffect } from "react";
import instance from "@/utils/axiosInstance";
import Wrapper from "@/components/layout/Wrapper";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";
import SidebarMenu from "@/components/common/header/dashboard/SidebarMenu";
import MobileMenu from "@/components/common/header/MobileMenu";

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
  proofOfPayment: string | null;
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await instance.get<{ data: Order[] }>("orders/tenant");
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const pendingOrders = orders.filter((order) =>
    order.status.some(
      (s) => s.Status === "WAITING_FOR_PAYMENT" || s.Status === "WAITING_FOR_CONFIRMATION"
    )
  );

  const confirmedOrders = orders.filter((order) =>
    order.status.some((s) => s.Status === "CONFIRMED")
  );

  const handleViewProof = (proofFileName: string) => {
    const proofURL = `http://localhost:4700/images/${proofFileName}`;
    setSelectedProof(proofURL);
    setIsModalOpen(true);
  };

  const handleCancel = async (orderId: number, hasProofOfPayment: boolean) => {
    const confirmCancel = window.confirm(
      hasProofOfPayment
        ? "Are you sure you want to cancel this order? You can still upload proof of payment even if canceled."
        : "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      const response = await instance.post(`/orders/tenant/${orderId}/cancel`);
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel the order.");
    }
  };

  const handleConfirmPayment = async (
    bookingId: number,
    action: "approve" | "reject"
  ) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this payment?`
    );
    if (!confirmAction) return;

    try {
      const response = await instance.post(`/transaction/${bookingId}/confirm`, {
        action,
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          `Failed to ${action} the payment. Please try again.`
      );
    }
  };

  const renderCard = (order: Order) => {
    const hasProofOfPayment = !!order.proofOfPayment;
    const isConfirmed = order.status.some((s) => s.Status === "CONFIRMED");
    const isPending = order.status.some(
      (s) => s.Status === "WAITING_FOR_PAYMENT" || s.Status === "WAITING_FOR_CONFIRMATION"
    );

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

        {/* Property Details */}
        <div className="flex-1">
          <h4 className="text-lg font-semibold mb-1">
            {order.property?.name || "Property Name"}
          </h4>
          <p className="text-gray-500 text-sm mb-1">
            {order.property?.address || "No address available"}
          </p>
          <p className="text-gray-500 text-sm mb-1">
            {new Date(order.checkInDate).toLocaleDateString()} -{" "}
            {new Date(order.checkOutDate).toLocaleDateString()}
          </p>
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded ${
              isConfirmed
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {order.status
              .map((s) => s.Status.replace(/_/g, " ").toLowerCase())
              .map((status) => status.charAt(0).toUpperCase() + status.slice(1))
              .join(", ")}
          </span>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
          {/* View Proof Button */}
          {hasProofOfPayment && (
            <button
              className="text-blue-500 underline"
              onClick={() => handleViewProof(order.proofOfPayment as string)}
            >
              View Proof
            </button>
          )}

          {/* Approve or Reject Button */}
          {hasProofOfPayment && !isConfirmed && (
            <>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => handleConfirmPayment(order.id, "approve")}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleConfirmPayment(order.id, "reject")}
              >
                Reject
              </button>
            </>
          )}

          {/* Cancel Button */}
          {!hasProofOfPayment && isPending && (
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => handleCancel(order.id, hasProofOfPayment)}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Price */}
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
      <div className="dashboard_sidebar_menu lg:hidden">
        <div
          className="offcanvas offcanvas-dashboard offcanvas-start"
          tabIndex={-1}
          id="DashboardOffcanvasMenu"
          data-bs-scroll="true"
        >
          <SidebarMenu />
        </div>
      </div>

      {/* Start Dashboard Navigation */}
      <div className="col-lg-12">
        <div className="dashboard_navigationbar dn db-1024">
          <div className="dropdown">
            <button
              className="dropbtn"
              data-bs-toggle="offcanvas"
              data-bs-target="#DashboardOffcanvasMenu"
              aria-controls="DashboardOffcanvasMenu"
            >
              <i className="fa fa-bars pr10"></i> Dashboard Navigation
            </button>
          </div>
        </div>
      </div>
      {/* End Dashboard Navigation */}

      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto py-12 px-8">
          <h1 className="text-3xl font-bold text-center mb-6">Orders</h1>
          <p className="text-center text-gray-500 mb-12">
            View your pending and confirmed orders below.
          </p>

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

          {activeTab === "pending" && (
            <div>
              {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => renderCard(order))
              ) : (
                <p className="text-center text-gray-500">
                  No pending orders available.
                </p>
              )}
            </div>
          )}
          {activeTab === "confirmed" && (
            <div>
              {confirmedOrders.length > 0 ? (
                confirmedOrders.map((order) => renderCard(order))
              ) : (
                <p className="text-center text-gray-500">
                  No confirmed orders available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-1/2">
            <button
              className="text-gray-500 float-right"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
            <img
              src={selectedProof}
              alt="Proof of Payment"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

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

export default MyOrdersPage;