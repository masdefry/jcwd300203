import { prisma } from "@/connection";
import { BookingStatus } from "@prisma/client";

export const getSalesReportService = async ({ 
  tenantId, 
  startDate, 
  endDate, 
  sortBy,
  page = 1,
  limit = 1000
}: {
  tenantId: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) => {
  if (!tenantId) throw { msg: "Tenant ID is required", status: 400 };

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const where = {
    property: { tenantId },
    checkInDate: {
      gte: startOfYear,
      lte: endOfYear
    },
    status: {
      some: {
        Status: BookingStatus.CONFIRMED
      }
    }
  };

  // Override date range if provided
  if (startDate) where.checkInDate.gte = new Date(startDate);
  if (endDate) where.checkInDate.lte = new Date(endDate);

  const [totalBookings, bookings] = await prisma.$transaction([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        customer: true,
        property: true,
        status: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { checkInDate: sortBy || 'asc' }
    })
  ]);

  const totalRevenue = bookings.reduce((sum: number, booking: any) => 
    sum + Number(booking.price || 0), 0
  );

  return {
    totalRevenue,
    bookings: bookings.map((booking: any) => ({
      propertyName: booking.property.name,
      customer: booking.customer.name,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      totalRooms: booking.room_qty,
      status: booking.status[0].Status,
      revenue: Number(booking.price || 0)
    }))
  };
};

// Property Report Service
export const getPropertyReportService = async ({ tenantId }: { tenantId: number }) => {
  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      roomTypes: {
        include: {
          bookings: {
            where: {
              checkOutDate: { gte: new Date() }, // Only include active bookings
            },
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

  const calendarEvents = properties.flatMap((property: any) => {
    return property.roomTypes.flatMap((roomType: any) => {
      const events = [];
      const activeBookings = roomType.bookings?.filter((booking: any) => {
        const latestStatus: BookingStatus = booking.status?.sort(
          (a: { createdAt: Date }, b: { createdAt: Date }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]?.Status;
        return ["CONFIRMED", "WAITING_FOR_CONFIRMATION"].includes(latestStatus);
      });
      const totalBookedRooms = activeBookings?.reduce((total: number, booking: any) => {
        return total + booking.room_qty;
      }, 0) || 0;
      const availableRoomCount = Math.max(roomType.qty - totalBookedRooms, 0);

      activeBookings?.forEach((booking: any)=> {
        events.push({
          title: `Booked: ${property.name} - Room ${roomType.name}`,
          start: booking.checkInDate,
          end: booking.checkOutDate,
          status: "Booked",
          color: "red",
        });
      });

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