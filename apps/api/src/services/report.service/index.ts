// services/report.service.ts
import { prisma } from "@/connection";
import { BookingStatus } from "@prisma/client";

export const getSalesReportService = async ({ tenantId, startDate, endDate, sortBy }: any) => {
  const where: any = {
    property: { tenantId: tenantId },
    status: {
      some: { Status: BookingStatus.CONFIRMED }, // Only confirmed bookings
    },
  };

  // Validate and parse startDate and endDate
  if (startDate) {
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) throw { msg: "Invalid start date", status: 400 };
    where.createdAt = { ...where.createdAt, gte: parsedStartDate };
  }

  if (endDate) {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) throw { msg: "Invalid end date", status: 400 };
    where.createdAt = { ...where.createdAt, lte: parsedEndDate };
  }

  // Fetch bookings with confirmed status and calculate total revenue
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: true,
      property: true,
      status: true,
    },
    orderBy: {
      createdAt: sortBy || "asc", // Sort by createdAt or other criteria
    },
  });

  // Calculate total revenue from the bookings
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);

  // Format the result
  const formattedBookings = bookings.map((booking) => ({
    propertyName: booking.property.name,
    customer: booking.customer.name,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    totalRooms: booking.room_qty,
    status: booking.status.map((s) => s.Status).join(", "),
    revenue: Number(booking.price || 0), // Individual booking revenue
  }));

  // Return formatted bookings along with total revenue
  return {
    totalRevenue,
    bookings: formattedBookings,
  }; 
};

// services/report.service.ts
export const getPropertyReportService = async ({ tenantId }: { tenantId: number }) => {
    // Fetch all bookings for tenant's properties
    const bookings = await prisma.booking.findMany({
      where: {
        property: { tenantId: tenantId },
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
        property: { select: { name: true } },
        status: { select: { Status: true, createdAt: true } },
      },
    });
  
    // Format data for calendar display
    return bookings.map((booking) => ({
      title: `Booked: ${booking.property.name}`,
      start: booking.checkInDate,
      end: booking.checkOutDate,
      status: booking.status.map((s) => s.Status).join(", "),
    }));
};