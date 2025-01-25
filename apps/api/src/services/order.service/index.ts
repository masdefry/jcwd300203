import { prisma } from "@/connection"
import { BookingStatus } from "@prisma/client";

interface GetOrderListParams {
  usersId: number;
  authorizationRole: string;
  date?: string;
  orderNumber?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CancelOrderParams {
  bookingId: number;
  usersId: number;
}

interface GetTenantOrderParams {
  usersId: number,
  status: string, 
  page?: number;               
  limit?: number;         
}
  
export const getOrderListService = async ({ 
  usersId, 
  authorizationRole, 
  date, 
  orderNumber, 
  status, 
  page = 1, 
  limit = 5 
}: GetOrderListParams) => {
// Calculate pagination values
const skip = (page - 1) * limit;

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

// Fetch total count for pagination
const totalOrders = await prisma.booking.count({ where: filters });
const totalPages = Math.ceil(totalOrders / limit);

// Fetch orders with pagination
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
  skip: skip,
  take: limit,
});

return { 
  orders, 
  totalPages 
};
};

export const getTenantOrderListService = async ({ 
  usersId, 
  status, 
  page = 1, 
  limit = 10 
}: GetTenantOrderParams) => {
  const skip = (page - 1) * limit;

  // First get the total count of matching orders
  const totalOrders = await prisma.booking.count({
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
  });

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));
  
  // Adjust page number if it exceeds total pages
  const adjustedPage = Math.min(page, totalPages);
  const adjustedSkip = (adjustedPage - 1) * limit;

  // Fetch orders with adjusted pagination
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
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      property: true,
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: adjustedSkip,
    take: limit,
  });

  return {
    orders,
    totalPages: totalPages,
    currentPage: adjustedPage,
  };
};

// cancel order service for user
export const cancelOrderService = async ({
  bookingId,
  usersId,
}: CancelOrderParams) => {
  // Fetch the booking with the latest status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      status: {
        orderBy: { createdAt: "desc" }, // Fetch the latest status first
        take: 1, // Only take the latest status
      },
    },
  });

  if (!booking) throw { msg: "Booking not found", status: 404 };

  if (booking.customerId !== usersId) {
    throw { msg: "Unauthorized: You can only cancel your own bookings", status: 403 };
  }

  if (booking.proofOfPayment) {
    throw { msg: "Cannot cancel: Proof of payment has already been uploaded", status: 400 };
  }

  // Check if the payment deadline has passed
  const paymentDeadline = new Date(booking.createdAt.getTime() + 60 * 60 * 1000); // 1 hour from booking creation
  if (new Date() > paymentDeadline) {
    throw { msg: "Cannot cancel: Payment deadline has passed", status: 400 };
  }

  // Fetch the latest status row
  const latestStatus = booking.status[0];
  if (!latestStatus || latestStatus.Status !== "WAITING_FOR_PAYMENT") {
    throw { msg: "Cannot cancel: Booking is not in 'WAITING_FOR_PAYMENT' status", status: 400 };
  }

  // Update the status row to "CANCELED"
  await prisma.status.update({
    where: { id: latestStatus.id }, // Update the specific status row
    data: {
      Status: BookingStatus.CANCELED,
    },
  });

  return {
    message: `Booking ID ${bookingId} has been successfully canceled.`,
  };
};

// cancel order service for tenant
export const cancelUserOrderService = async ({
  bookingId
}: {
  bookingId: number;
}) => {
  // Fetch the booking with the latest status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      status: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!booking) throw { msg: "Booking not found", status: 404 };
  
  // Fetch the latest status row
  const latestStatus = booking.status[0];

  // Update the latest status row to "CANCELED"
  const updatedStatus = await prisma.status.update({
    where: { id: latestStatus.id }, // Update the specific status row
    data: {
      Status: BookingStatus.CANCELED,
    },
  });

  return {
    message: `Booking ID ${bookingId} has been successfully canceled.`,
    updatedStatus,
  };
};
