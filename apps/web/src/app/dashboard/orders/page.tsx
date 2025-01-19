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
  room_qty: number;
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 3; // Fixed to 3 items per page

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await instance.get(
          `/orders/tenant?page=${currentPage}&limit=${itemsPerPage}&status=${activeTab}`
        );
        const { orders, totalPages, currentPage: fetchedCurrentPage } = response.data.data;
        setOrders(orders);
        setTotalPages(totalPages);
        setCurrentPage(fetchedCurrentPage);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, activeTab]);

  // Reset to first page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }; 

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

  const handleCancel = async (orderId: number, roomQty: number, hasProofOfPayment: boolean) => {
    const confirmCancel = window.confirm(
      hasProofOfPayment
        ? "Are you sure you want to cancel this order? You can still upload proof of payment even if canceled."
        : "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      const response = await instance.post(`/orders/tenant/${orderId}/cancel`, {
        room_qty: roomQty,
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel the order.");
    }
  };

  const handleConfirmPayment = async (bookingId: number, action: "approve" | "reject") => {
    const confirmAction = window.confirm(`Are you sure you want to ${action} this payment?`);
    if (!confirmAction) return;

    try {
      const response = await instance.post(`/transaction/${bookingId}/confirm`, {
        action,
      });
      alert(response.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(
        error.response?.data?.message || `Failed to ${action} the payment. Please try again.`
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
        <img
          src={order.property?.img || "/placeholder.jpg"}
          alt={order.property?.name || "Property"}
          className="w-full md:w-24 h-24 object-cover rounded-lg mb-4 md:mb-0 mr-0 md:mr-4"
        />

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

        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
          {hasProofOfPayment && (
            <button
              className="text-blue-500 underline"
              onClick={() => handleViewProof(order.proofOfPayment as string)}
            >
              View Proof
            </button>
          )}

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

          {!hasProofOfPayment && isPending && (
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => handleCancel(order.id, order.room_qty, hasProofOfPayment)}
            >
              Cancel
            </button>
          )}
        </div>

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
      {/* Main container with flex layout */}
      <div className="flex min-h-screen relative">
        {/* Sidebar - Fixed on desktop, sliding on mobile
        <div
          className={`w-72 bg-[#13213c] min-h-screen fixed md:static z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <SidebarMenu />
        </div> */}

        {/* Mobile overlay */}
        {/* {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )} */}

        {/* Main content */}
        <div className="flex-1 min-h-screen bg-gray-100">
          {/* Content area */}
          <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
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
                    <p className="text-center text-gray-500">No pending orders available.</p>
                  )}
                </div>
              )}
              {activeTab === "confirmed" && (
                <div>
                  {confirmedOrders.length > 0 ? (
                    confirmedOrders.map((order) => renderCard(order))
                  ) : (
                    <p className="text-center text-gray-500">No confirmed orders available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {/* <div className="flex items-center justify-end mb-4"> */}
            {/* <label htmlFor="itemsPerPage" className="mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handlePageLimitChange}
              className="px-4 py-2 border rounded-md"
            >
              <option value={1}>1</option> */}
              {/* <option value={10}>10</option> */}
              {/* <option value={20}>20</option> */}
            {/* </select> */}
          {/* </div> */}

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-200 rounded">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>

          {/* Footer sections */}
          {/* <section className="footer_one">
            <div className="container">
              <div className="row">
                <Footer />
              </div>
            </div>
          </section>

          <section className="footer_middle_area pt40 pb40">
            <div className="container">
              <CopyrightFooter />
            </div>
          </section> */}
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
    </Wrapper>
  );
};

export default MyOrdersPage;