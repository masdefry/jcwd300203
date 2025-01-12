import { prisma } from "@/connection";
import { BookingStatus } from "@prisma/client";

export const getSalesReportService = async ({ tenantId, startDate, endDate, sortBy }: any) => {
  if (!tenantId) {
    throw { msg: "Tenant ID is required", status: 400 };
  }

  const where: any = {
    property: { tenantId: tenantId }, // Filter by tenantId
    status: {
      some: { Status: BookingStatus.CONFIRMED }, // Only include confirmed bookings
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

  // Fetch bookings with confirmed status for the specific tenant
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: true,
      property: true,
      status: true,
    },
    orderBy: {
      createdAt: sortBy || "asc", // Sort by createdAt or provided criteria
    },
  });

  // Calculate total revenue for the tenant's bookings
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);

  // Format the bookings for response
  const formattedBookings = bookings.map((booking) => ({
    propertyName: booking.property.name,
    customer: booking.customer.name,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    totalRooms: booking.room_qty,
    status: booking.status.map((s) => s.Status).join(", "),
    revenue: Number(booking.price || 0), // Revenue for this booking
  }));

  return {
    totalRevenue,
    bookings: formattedBookings,
  };
};

export const getPropertyReportService = async ({ tenantId }: { tenantId: number }) => {
  // Fetch all properties with their rooms and bookings for the specific tenant
  const properties = await prisma.property.findMany({
    where: { tenantId: tenantId },
    include: {
      roomTypes: {
        include: {
          bookings: {
            where: {
              OR: [
                { status: { some: { Status: BookingStatus.CONFIRMED } } },
                { status: { some: { Status: BookingStatus.WAITING_FOR_CONFIRMATION } } },
                { status: { some: { Status: BookingStatus.WAITING_FOR_PAYMENT } } },
                { status: { some: { Status: BookingStatus.CANCELED } } },
              ],
            },
            select: {
              id: true,
              checkInDate: true,
              checkOutDate: true,
              status: { select: { Status: true } },
            },
          },
        },
      },
    },
  });

  // Process room availability and bookings
  const calendarEvents = properties.flatMap((property) => {
    return property.roomTypes.flatMap((roomType: any) => {
      const events = [];

      // Process bookings to separate active bookings and canceled bookings
      const activeBookings = roomType.bookings?.filter((booking: any) =>
        ["CONFIRMED", "WAITING_FOR_CONFIRMATION", "WAITING_FOR_PAYMENT"].includes(
          booking.status[0]?.Status
        )
      );

      const canceledBookings = roomType.bookings?.filter((booking: any) =>
        booking.status[0]?.Status === "CANCELED"
      );

      // Count active and canceled bookings
      const activeRoomCount = activeBookings?.length || 0;
      const canceledRoomCount = canceledBookings?.length || 0;

      // Add "Booked" events for rooms with active bookings
      if (activeBookings && activeBookings.length > 0) {
        activeBookings.forEach((booking: any) => {
          events.push({
            title: `Booked: ${property.name} - Room ${roomType.name}`,
            start: booking.checkInDate,
            end: booking.checkOutDate,
            status: "Booked",
            color: "red",
          });
        });
      }

      // Calculate the total available rooms by considering canceled rooms
      const availableRoomCount = roomType.qty - activeRoomCount;

      if (availableRoomCount > 0) {
        events.push({
          title: `Available: ${property.name} - Room ${roomType.name} (${availableRoomCount + canceledRoomCount} available)`,
          start: new Date(), // Available starting today
          end: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Available for a month ahead
          status: "Available",
          color: "green",
        });
      }

      return events;
    });
  });

  return calendarEvents;
};
