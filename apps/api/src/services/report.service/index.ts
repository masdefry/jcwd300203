// services/report.service.ts
import { prisma } from "@/connection";

export const getSalesReport = async ({ tenantId, startDate, endDate, sortBy }: any) => {
  const where: any = {
    property: { tenantId },
    status: {
      some: {Status: "CONFIRMED"}
    }
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

  // Fetch and group bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: true,
      property: true,
      status: true,
    },
    orderBy: {
      createdAt: sortBy || "asc", // Sort by date or total sales
    },
  });

  // Format the result
  return bookings.map((booking) => ({
    propertyName: booking.property.name,
    customer: booking.customer.name,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    totalRooms: booking.room_qty,
    status: booking.status.map((s) => s.Status).join(", "),
  }));
};

// services/report.service.ts
export const getPropertyReport = async ({ tenantId }: { tenantId: number }) => {
    // Fetch all bookings for tenant's properties
    const bookings = await prisma.booking.findMany({
      where: {
        property: { tenantId },
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