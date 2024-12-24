import { prisma } from "@/connection"
import { BookingStatus } from "@prisma/client";

interface GetOrderListParams {
  usersId: number;
  authorizationRole: string;
  date?: string;
  orderNumber?: string;
  status?: string;
}

interface CancelOrderParams {
  bookingId: number;
  usersId: number;
}

interface GetTenantOrderParams {
  usersId: number,
  status: string
}
  
export const getOrderListService = async ({ usersId, authorizationRole, date, orderNumber, status }: GetOrderListParams) => {
  // Build query filters
  const filters: any = {
    customerId: usersId,
    status: {
      none: {
        Status: BookingStatus.CANCELED, // Exclude canceled orders
      },
    },
  };

  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      filters.checkInDate = { gte: parsedDate };
    }
  }

  if (orderNumber) {
    filters.id = Number(orderNumber); // Assuming order number corresponds to the booking ID
  }

  if (status) {
    filters.status = {
      some: {
        Status: BookingStatus[status as keyof typeof BookingStatus], // Match status dynamically
      },
    };
  }

  // Fetch orders
  const orders = await prisma.booking.findMany({
    where: filters,
    include: {
      status: {
        orderBy: { createdAt: "desc" }, // Ensure latest status is prioritized
        take: 1, // Fetch only the latest status for clarity
        select: { Status: true },
      },
      property: {
        select: {
          name: true,
          address: true,
        },
      },
      room: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

export const getTenantOrderListService = async ({ usersId, status }: GetTenantOrderParams) => {
  // Fetch bookings while excluding any that have a related status of "CANCELED"
  const orders = await prisma.booking.findMany({
    where: {
      property: {
        tenantId: usersId,
      },
      status: {
        none: {
          Status: BookingStatus.CANCELED, 
        },
      },
      ...(status && {
        status: {
          some: {
            Status: BookingStatus[status as keyof typeof BookingStatus],
          },
        },
      }),
    },
    include: {
      status: {
        orderBy: { createdAt: 'desc' }, // Ensure latest status is prioritized
        take: 1, // Only fetch the latest status for clarity
      },
      property: true,
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

// cancel order service for user
export const cancelOrderService = async ({ bookingId, usersId }: CancelOrderParams) => { 
    // Fetch the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { status: true },
    });
    
    if (!booking) {
      throw { msg: "Booking not found", status: 404 };
    }
  
    if (booking.customerId !== usersId) {
      throw { msg: "Unauthorized: You can only cancel your own bookings", status: 403 };
    }
  
    // Check if proof of payment has been uploaded
    if (booking.proofOfPayment) {
      throw { msg: "Cannot cancel: Proof of payment has already been uploaded", status: 400 };
    }
    
    // Check if payment deadline has passed
    const paymentDeadline = new Date(booking.createdAt.getTime() + 60 * 60 * 1000); // 1 hour from booking creation    
    if (new Date() > paymentDeadline) {
      throw { msg: "Cannot cancel: Payment deadline has passed", status: 400 };
    }
    
    // Update booking status to "CANCELED"
    const canceledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: {
          create: {
            Status: BookingStatus.CANCELED,
          },
        },
      },
    });
  
    return canceledBooking;
};

// cancel order service for tenant
export const cancelUserOrderService = async ({ usersId, bookingId }: { usersId: number; bookingId: number }) => {
  const booking = await prisma.booking.findUnique({
    where: {id: bookingId},
    include: { property: true },
  });

  if (!booking) {
    throw { msg: "Booking not found", status: 404 };
  }

  // Update the booking status to "CANCELED"
  const canceledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: { create: { Status: BookingStatus.CANCELED } },
    },
  });

  return canceledBooking;
};
