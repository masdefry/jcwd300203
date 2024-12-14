import { prisma } from "@/connection"

interface GetOrderListParams {
    userId: number;
    date?: string; // Optional filter by date
    orderNumber?: string; // Optional filter by order number
    status?: string; // Optional filter by status
}

interface CancelOrderParams {
    bookingId: number;
    userId: number;
}
  
export const getOrderListService = async ({ userId, date, orderNumber, status }: GetOrderListParams) => {
    // Build query filters
    const filters: any = {
      customerId: userId,
    };
  
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        filters.checkInDate = { gte: parsedDate }; // Orders with check-in date >= provided date
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
  
    // Fetch orders
    const orders = await prisma.booking.findMany({
      where: filters,
      include: {
        status: true, // Include statuses
      },
      orderBy: {
        createdAt: "desc", // Latest orders first
      },
    });
  
    return orders;
};

export const cancelOrderService = async ({ bookingId, userId }: CancelOrderParams) => { 
    // Fetch the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { status: true },
    });
  
    if (!booking) {
      throw { msg: "Booking not found", status: 404 };
    }
  
    if (booking.customerId !== userId) {
      throw { msg: "Unauthorized: You can only cancel your own bookings", status: 403 };
    }
  
    // // Check if proof of payment has been uploaded (nanti)
    // if (booking.proofOfPayment) {
    //   throw { msg: "Cannot cancel: Proof of payment has already been uploaded", status: 400 };
    // }
    
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
            Status: "CANCELED",
          },
        },
      },
    });
  
    return canceledBooking;
};