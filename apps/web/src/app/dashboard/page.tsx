"use client"
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import instance from "@/utils/axiosInstance";
import StatisticsChart from "@/components/dashboard/my-dashboard/StatisticsChart";
import PropertyCalendar from "@/components/dashboard/my-dashboard/PropertyCalendar";
import authStore from "@/zustand/authStore";

// Define TypeScript types
type Booking = {
  propertyName: string;
  customer: string;
  checkIn: string; // ISO Date String
  checkOut: string; // ISO Date String
  totalRooms: number;
  status: string;
  revenue: number;
};

type DateRange = {
  start: string | null; // ISO Date String or null
  end: string | null; // ISO Date String or null
};

const MyDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "revenue">("date");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await instance.get<{ success: boolean; data: { bookings: Booking[] } }>("/report/sales-report");
        const result = response.data;
  
        console.log("response: ", response);
  
        // Access `bookings` from `data` instead of directly from `result`
        if (result.success && Array.isArray(result.data.bookings)) {
          setBookings(result.data.bookings);
          setFilteredBookings(result.data.bookings); // Default view
        } else {
          console.error("Invalid data structure:", result);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
  }, []);

  // Sorting function
  const handleSort = (key: "date" | "revenue") => {
    if (!Array.isArray(filteredBookings)) {
      console.error("filteredBookings is not an array");
      return;
    }
    const sorted = [...filteredBookings].sort((a, b) => {
      if (key === "date") {
        return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
      } else if (key === "revenue") {
        return b.revenue - a.revenue;
      }
      return 0;
    });
    setFilteredBookings(sorted);
    setSortBy(key);
  }; 

  // Filter by Date Range
  const handleFilterByDate = () => {
    if (!dateRange.start || !dateRange.end) {
      console.warn("Date range is not set properly.");
      return;
    }
  
    const filtered = bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkIn);
      return dateRange.start && dateRange.end && checkInDate >= new Date(dateRange.start) && checkInDate <= new Date(dateRange.end);
    });
  
    setFilteredBookings(filtered.length ? filtered : []);
  };

  // get name of tenant
  const tenantName = authStore((state) => state.name)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-[#f15b5b] text-white py-6 px-8">
        <h1 className="text-2xl text-white font-bold">Good Morning, {tenantName}</h1>
        <p className="text-sm text-white">Welcome back to your dashboard!</p>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-gray-700">Manage your properties, sales, and reports.</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">View Orders</button>
        </div>

        {/* Sales Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Sales Report</h2>
            <StatisticsChart />
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 rounded-lg ${sortBy === "date" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => handleSort("date")}
              >
                Sort by Date
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${sortBy === "revenue" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => handleSort("revenue")}
              >
                Sort by Revenue
              </button>
            </div>
          </div>

          {/* Property Calendar */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Property Availability</h2>
            <PropertyCalendar />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Bookings</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleFilterByDate}>
              Filter by Range
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-4 border">Property Name</th>
                <th className="p-4 border">Customer</th>
                <th className="p-4 border">Check-In</th>
                <th className="p-4 border">Check-Out</th>
                <th className="p-4 border">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings && filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.checkIn} className="hover:bg-gray-100">
                        <td className="p-4 border">{booking.propertyName}</td>
                        <td className="p-4 border">{booking.customer}</td>
                        <td className="p-4 border">{new Date(booking.checkIn).toLocaleDateString()}</td>
                        <td className="p-4 border">{new Date(booking.checkOut).toLocaleDateString()}</td>
                        <td className="p-4 border">
                          {booking.revenue.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 border text-center" colSpan={5}>
                        No bookings available.
                      </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;