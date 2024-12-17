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
  // Fetch all properties with their rooms and bookings for the specific tenant
  const properties = await prisma.property.findMany({
    where: { tenantId: tenantId },
    include: {
      roomTypes: {
        include: {
          bookings: {
            where: {
              status: {
                some: {
                  Status: {
                    in: [
                      BookingStatus.CONFIRMED,
                      BookingStatus.WAITING_FOR_CONFIRMATION,
                      BookingStatus.WAITING_FOR_PAYMENT,
                    ],
                  },
                },
              },
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

      // Add "Booked" events for rooms with active bookings
      roomType.bookings.forEach((booking: any) => {
        if (
          booking.status.some((s: any) =>
            ["CONFIRMED", "WAITING_FOR_CONFIRMATION", "WAITING_FOR_PAYMENT"].includes(s.Status)
          )
        ) {
          events.push({
            title: `Booked: ${property.name} - Room ${roomType.id}`,
            start: booking.checkInDate,
            end: booking.checkOutDate,
            status: "Booked",
            color: "red",
          });
        }
      });

      // If no bookings exist, mark room as "Available"
      if (!roomType.bookings || roomType.bookings.length === 0) {
        events.push({
          title: `Available: ${property.name} - Room ${roomType.id}`,
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
