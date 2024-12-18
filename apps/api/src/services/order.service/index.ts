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
          Status: status,
        },
      };
    }
  
    // Fetch orders with proof of payment
    const orders = await prisma.booking.findMany({
      where: filters,
      include: {
          status: { select: { Status: true } }, // Select status value
          property: {
              select: { 
                  name: true, 
                  address: true, 
              },
          },
          room: {
              select: { 
                  name: true, 
                  price: true 
              },
          },
      },
  }); 
  
    return orders;
};


// get tenant order list service
export const getTenantOrderListService = async ({usersId, status}: GetTenantOrderParams) => {
  const filters: any = {property: {usersId}}
  
  if (status) {
    filters.status = {
      some: {Status: status},
    };
  }
  
  const orders = await prisma.booking.findMany({
    where: filters,
    include: {
      status: true,
      property: true,
      customer: true
    },
    orderBy: {createdAt: "desc"}
  })
  
  return orders
}

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

  if (booking.property.tenantId !== usersId) {
    throw { msg: "Unauthorized: You can only cancel your own property's orders", status: 403 };
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
