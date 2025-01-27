"use client"
import { useState, useEffect } from "react";
import instance from "@/utils/axiosInstance";
import StatisticsChart from "@/components/dashboard/my-dashboard/StatisticsChart";
import authStore from "@/zustand/authStore";
import { useRouter } from "next/navigation";

type Booking = {
  propertyName: string;
  customer: string;
  checkIn: string;
  checkOut: string;
  totalRooms: number;
  status: string;
  revenue: number;
};

type DateRange = {
  start: string | null;
  end: string | null;
};

const MyDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "revenue">("date");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [isMobileView, setIsMobileView] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 3; // Limit to 3 orders per page as requested

  useEffect(() => {
    // Add responsive listener
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await instance.get<{ 
          success: boolean; 
          data: { 
            bookings: Booking[],
            totalPages: number
          } 
        }>(`/report/sales-report?page=${currentPage}&limit=${itemsPerPage}`);
        
        const result = response.data;
        
        if (result.success && Array.isArray(result.data.bookings)) {
          setBookings(result.data.bookings);
          setFilteredBookings(result.data.bookings);
          setTotalPages(result.data.totalPages || 1);
        } else {
          console.error("Invalid data structure:", result);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
  }, [currentPage]);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const tenantName = authStore((state) => state.name);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 mb-12">
      {/* Header Section - Made responsive */}
      <div className="bg-[#f15b5b] text-white py-4 sm:py-6 px-4 sm:px-8">
        <h1 className="text-xl sm:text-2xl text-white font-bold">Good Morning, {tenantName}</h1>
        <p className="text-xs sm:text-sm text-white">Welcome back to your dashboard!</p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Quick Actions - Made responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-700">Manage your properties, sales, and reports.</h2>
          <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => {router.push("/dashboard/orders")}}>
            View Orders
          </button>
        </div>

        {/* Sales Report - Made responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-4">Sales Report</h2>
            <div className="w-full overflow-x-auto">
              <StatisticsChart />
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 mt-4">
              <button
                className={`px-4 py-2 rounded-lg w-full sm:w-auto ${sortBy === "date" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => handleSort("date")}
              >
                Sort by Date
              </button>
              <button
                className={`px-4 py-2 rounded-lg w-full sm:w-auto ${sortBy === "revenue" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => handleSort("revenue")}
              >
                Sort by Revenue
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table - Made responsive */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-4">Bookings</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
            <input
              type="date"
              className="w-full sm:w-auto px-4 py-2 border rounded-lg"
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="w-full sm:w-auto px-4 py-2 border rounded-lg"
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
            <button 
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={handleFilterByDate}
            >
              Filter by Range
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 sm:p-4 border text-sm sm:text-base">Property Name</th>
                  <th className="p-2 sm:p-4 border text-sm sm:text-base">Customer</th>
                  <th className="p-2 sm:p-4 border text-sm sm:text-base">Check-In</th>
                  <th className="p-2 sm:p-4 border text-sm sm:text-base">Check-Out</th>
                  <th className="p-2 sm:p-4 border text-sm sm:text-base">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings && filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.checkIn} className="hover:bg-gray-100">
                      <td className="p-2 sm:p-4 border text-sm sm:text-base">{booking.propertyName}</td>
                      <td className="p -2 sm:p-4 border text-sm sm:text-base">{booking.customer}</td>
                      <td className="p-2 sm:p-4 border text-sm sm:text-base">{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td className="p-2 sm:p-4 border text-sm sm:text-base">{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td className="p-2 sm:p-4 border text-sm sm:text-base">
                        {booking.revenue.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 sm:p-4 border text-center text-sm sm:text-base" colSpan={5}>
                      No bookings available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;