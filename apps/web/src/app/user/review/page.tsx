"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import authStore from "@/zustand/authStore";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

import Header from "@/components/home/Header";
import MobileMenu from "@/components/common/header/MobileMenu";
import PopupSignInUp from "@/components/common/PopupSignInUp";
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

const Bookings: React.FC = () => {
  const router = useRouter();
  const currentDate = new Date();

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
          {isPast && (
            <button
              onClick={() => router.push(`/review/${booking.id}`)}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Review
            </button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <div className="p-8">
        {/* Current Stays */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Current Stays</h2>
          <div className="overflow-x-auto w-full">
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
          </div>

        {/* Past Stays */}
        <div>
          <h2 className="text-xl font-bold mb-4">Past Stays</h2>
          <div className="overflow-x-auto w-full">
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
    </div>
  );
};

export default Bookings;