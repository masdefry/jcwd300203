"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance"; // Use instance instead of axios
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
  },
  propertyId: number
}

const Bookings: React.FC = () => {
  const router = useRouter();
  const currentDate = new Date();

  // Access token and user ID
  const token = authStore((state) => state.token);
  const decodedToken: any = jwtDecode(token);
  const usersId = decodedToken?.id; // Extract user ID from the token

  // Fetch bookings (confirmed orders)
  const { data: bookings, error: bookingsError } = useQuery({
    queryKey: ["confirmedOrders"],
    queryFn: async () => {
      const res = await instance.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter orders with CONFIRMED status
      return res.data.data.filter((order: Booking) =>
        order.status.some((s) => s.Status === "CONFIRMED")
      );
    },
  });

  // Fetch existing reviews
  const { data: reviews, error: reviewsError } = useQuery({
    queryKey: ["reviews", bookings?.map((b: any) => b.id)],
    queryFn: async () => {
      const allReviews = await Promise.all(
        bookings.map((booking: any) =>
          instance.get(`/reviews/${booking.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.data.data)
        )
      );
      return allReviews.flat(); // Flatten the reviews into a single array
    },
    enabled: !!bookings, // Only run when bookings are fetched
  });
   

  console.log("Bookings fetched:", bookings);
  console.log("Reviews fetched:", reviews);

  // Filter current and past stays
  const currentStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) >= currentDate
  );

  const pastStays = (bookings || []).filter(
    (booking: Booking) => new Date(booking.checkOutDate) < currentDate
  );

  // Check if a booking has been reviewed
  const isReviewed = (propertyId: number) => {
  return Array.isArray(reviews) && reviews.some((review) => review.propertyId === propertyId);
};

  // Render table rows
  const renderTableRows = (bookingList: Booking[], isPast: boolean) => {
    return bookingList.map((booking) => {
      
      console.log(booking.propertyId)

      const reviewed = isReviewed(booking.propertyId);

      return (
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
            {isPast && (
              <button
                onClick={() => handleReview(booking.id)}
                className={`px-4 py-2 rounded transition ${
                  "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {reviewed ? "Update Review" : "Review"}
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  // Handle review button click
  const handleReview = (bookingId: number) => {
    router.push(`/review/${bookingId}`);
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