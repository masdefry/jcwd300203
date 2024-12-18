"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import authStore from "@/zustand/authStore";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: { Status: string }[]; 
  property: {
    name: string;
    address: string;
  };
}

const Bookings: React.FC = () => {
  const router = useRouter();
  const currentDate = new Date();

  // Access token and user ID
  const token = authStore((state) => state.token);
  const decodedToken = jwtDecode(token);

  // Fetch bookings (confirmed orders)
  const { data: bookings, error } = useQuery({
    queryKey: ["confirmedOrders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:4700/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter orders with CONFIRMED status
      return res.data.data.filter(
        (order: Booking) =>
          order.status.some((s) => s.Status === "CONFIRMED") // Check status relation
      );
    },
  });

  console.log("Bookings fetched:", bookings);

  // Filter current and past stays
  const currentStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) >= currentDate
  );
  const pastStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) < currentDate
  );

  // Render table rows
  const renderTableRows = (bookingList: Booking[], isPast: boolean) => {
    return bookingList.map((booking) => (
      <tr key={booking.id} className="border-b hover:bg-gray-100">
        <td className="px-4 py-2 text-center">{booking.property.name}</td>
        <td className="px-4 py-2 text-center">{booking.property.address}</td>
        <td className="px-4 py-2 text-center">
          {new Date(booking.checkInDate).toLocaleString()}
        </td>
        <td className="px-4 py-2 text-center">
          {new Date(booking.checkOutDate).toLocaleString()}
        </td>
        <td className="px-4 py-2 text-center">
          <button
            onClick={() => handleReview(booking.id)}
            disabled={!isPast}
            className={`px-4 py-2 rounded transition ${
              isPast
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Review
          </button>
        </td>
      </tr>
    ));
  };

  // Handle review button click
  const handleReview = (bookingId: number) => {
    router.push(`/bookings/${bookingId}/review`);
  };

  return (
    <div className="p-8">
      {/* Current Stays */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Stays</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border text-center">Property Name</th>
              <th className="px-4 py-2 border text-center">Location</th>
              <th className="px-4 py-2 border text-center">Check-in Date</th>
              <th className="px-4 py-2 border text-center">Check-out Date</th>
              <th className="px-4 py-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(currentStays, false)}</tbody>
        </table>
      </div>

      {/* Past Stays */}
      <div>
        <h2 className="text-xl font-bold mb-4">Past Stays</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border text-center">Property Name</th>
              <th className="px-4 py-2 border text-center">Location</th>
              <th className="px-4 py-2 border text-center">Check-in Date</th>
              <th className="px-4 py-2 border text-center">Check-out Date</th>
              <th className="px-4 py-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(pastStays, true)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
