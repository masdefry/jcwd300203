import { getOrderListService, getTenantOrderListService, cancelOrderService, cancelUserOrderService } from "@/services/order.service";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/connection";
import { BookingStatus } from "@prisma/client";

// get order list
export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { usersId, authorizationRole } = req.body;
      const { date, orderNumber, status } = req.query;
  
      // Cast query parameters to strings or undefined
      const parsedDate = typeof date === "string" ? date : undefined;
      const parsedOrderNumber = typeof orderNumber === "string" ? orderNumber : undefined;
      const parsedStatus = typeof status === "string" ? status : undefined;
   
      // Call service to get orders
      const orders = await getOrderListService({ usersId, authorizationRole, date: parsedDate, orderNumber: parsedOrderNumber, status: parsedStatus });
  
      res.status(200).json({
        error: false,
        message: "Order list retrieved successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
};

// get tenant order list
export const getTenantOrderList = async(req: Request, res: Response, next: NextFunction ) => {
  try {
    const { usersId } = req.body
    const { status } = req.query
    
    const orders = await getTenantOrderListService({ usersId: Number(usersId), status: status as string }) 
    
    res.status(200).json({
      error: false,
      message: "Order list retrieved successfully",
      data: orders,
    }) 
    
  } catch (error) {
    next(error)
  }
}


export const sendOrderReminders = async() => {
  const today = new Date();
  const reminderDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // 1 day later
  
  const bookings = await prisma.booking.findMany({
    where: {
      checkInDate: reminderDate,
      status: { some: { Status: BookingStatus.CONFIRMED } },
    },
    include: { customer: true, property: true },
  });
  
  for (const booking of bookings) {
    // TODO: Use a mailer service to send email
    console.log(`Sending reminder email to: ${booking.customer.email}`);
  }
}

// cancel order service for user
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingId } = req.params; // The ID of the booking to cancel
      const { usersId } = req.body; // Logged-in user's ID
  
      // Call service to cancel the order
      const result = await cancelOrderService({ bookingId: Number(bookingId), usersId: Number(usersId) });
  
      res.status(200).json({
        error: false,
        message: "Order cancelled successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
};

// cancel order service for tenant
export const cancelUserOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body;
    const { bookingId } = req.params;

    const result = await cancelUserOrderService({ usersId: Number(usersId), bookingId: Number(bookingId) });

    res.status(200).json({
      error: false,
      message: "Order canceled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};