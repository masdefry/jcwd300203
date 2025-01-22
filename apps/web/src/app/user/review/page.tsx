"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import authStore from "@/zustand/authStore";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: { Status: string }[];
  property: {
    name: string;
    address: string;
  };
  propertyId: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="flex justify-center mt-4 gap-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
    >
      Previous
    </button>
    <span className="px-3 py-1 bg-gray-100 rounded">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
    >
      Next
    </button>
  </div>
);

const Bookings: React.FC = () => {
  const router = useRouter();
  const currentDate = new Date();
  const [currentStaysPage, setCurrentStaysPage] = useState(1);
  const [pastStaysPage, setPastStaysPage] = useState(1);
  const itemsPerPage = 3;

  const token = authStore((state) => state.token);
  const decodedToken: any = jwtDecode(token);
  const usersId = decodedToken?.id;

  const { data: bookings } = useQuery({
    queryKey: ["confirmedOrders"],
    queryFn: async () => {
      const res = await instance.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.filter((order: Booking) =>
        order.status.some((s) => s.Status === "CONFIRMED")
      );
    },
  });

  const currentStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) >= currentDate
  );

  const pastStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) < currentDate
  );

  const getCurrentPageItems = (items: Booking[], page: number) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  const currentStaysTotalPages = Math.max(1, Math.ceil(currentStays.length / itemsPerPage));
  const pastStaysTotalPages = Math.max(1, Math.ceil(pastStays.length / itemsPerPage));

  const paginatedCurrentStays = getCurrentPageItems(currentStays, currentStaysPage);
  const paginatedPastStays = getCurrentPageItems(pastStays, pastStaysPage);

  const renderCards = (bookingList: Booking[], isPast: boolean) => {
    return bookingList.map((booking) => (
      <div
        key={booking.id}
        className="border border-gray-300 shadow-md p-4 rounded-lg mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h3 className="text-lg font-bold">{booking.property.name}</h3>
          <p className="text-sm text-gray-600">{booking.property.address}</p>
          <p className="text-sm">
            <span className="font-semibold">Check-in:</span>{" "}
            {new Date(booking.checkInDate).toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Check-out:</span>{" "}
            {new Date(booking.checkOutDate).toLocaleString()}
          </p>
        </div>
        {isPast && (
          <button
            onClick={() => router.push(`/user/review/${booking.id}`)}
            className="mt-4 sm:mt-0 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Review
          </button>
        )}
      </div>
    ));
  };

  return (
    <div>
      <div className="p-8">
        {/* Current Stays */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Current Stays</h2>
          {paginatedCurrentStays.length > 0 ? (
            renderCards(paginatedCurrentStays, false)
          ) : (
            <p>No current stays available.</p>
          )}
          {currentStays.length > 0 && (
            <PaginationControls
              currentPage={currentStaysPage}
              totalPages={currentStaysTotalPages}
              onPageChange={setCurrentStaysPage}
            />
          )}
        </div>

        {/* Past Stays */}
        <div>
          <h2 className="text-xl font-bold mb-4">Past Stays</h2>
          {paginatedPastStays.length > 0 ? (
            renderCards(paginatedPastStays, true)
          ) : (
            <p>No past stays available.</p>
          )}
          {pastStays.length > 0 && (
            <PaginationControls
              currentPage={pastStaysPage}
              totalPages={pastStaysTotalPages}
              onPageChange={setPastStaysPage}
            />
          )}
        </div>
      </div>

      {/* Footer sections */}
      <section className="footer_one">
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
      </section>
    </div>
  );
};

export default Bookings;
