import { prisma } from "@/connection";
import { BookingStatus } from "@prisma/client";

export const getSalesReportService = async ({ 
  tenantId, 
  startDate, 
  endDate, 
  sortBy, 
  page = 1, 
  limit = 2 
}: any) => {
  if (!tenantId) {
    throw { msg: "Tenant ID is required", status: 400 };
  }

  // Calculate pagination values
  const skip = (page - 1) * limit;

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

  // Count total bookings for pagination
  const totalBookings = await prisma.booking.count({ where });
  const totalPages = Math.ceil(totalBookings / limit);

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
    skip: skip,
    take: limit,
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
    totalPages,
  };
};

export const getPropertyReportService = async ({ tenantId }: { tenantId: number }) => {
  // Fetch all properties with their rooms and bookings for the specific tenant
  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      roomTypes: {
        include: {
          bookings: {
            include: {
              status: {
                select: {
                  Status: true,
                  createdAt: true, 
                },
              },
            },
          },
        },
      },
    },
  });

  // Process room availability and bookings
  const calendarEvents = properties.flatMap((property) => {
    return property.roomTypes.flatMap((roomType) => {
      const events = [];

      // Get active bookings based on the latest status
      const activeBookings = roomType.bookings?.filter((booking) => {
        const latestStatus = booking.status?.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]?.Status;

        return ["CONFIRMED", "WAITING_FOR_CONFIRMATION", "WAITING_FOR_PAYMENT"].includes(latestStatus);
      });

      // Calculate available rooms
      const availableRoomCount = Math.max(roomType.qty, 0);

      // Add "Booked" events for active bookings
      activeBookings?.forEach((booking) => {
        events.push({
          title: `Booked: ${property.name} - Room ${roomType.name}`,
          start: booking.checkInDate,
          end: booking.checkOutDate,
          status: "Booked",
          color: "red",
        });
      });

      // Add "Available" event for available rooms
      if (availableRoomCount > 0) {
        events.push({
          title: `Available: ${property.name} - Room ${roomType.name} (${availableRoomCount} available)`,
          start: new Date(),
          end: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: "Available",
          color: "green",
        });
      }
      
      return events;
    });
  });

  return calendarEvents;
};