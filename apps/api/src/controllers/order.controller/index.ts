import { getOrderListService, cancelOrderService } from "@/services/order.service";
import { Request, Response, NextFunction } from "express";

// get order list
export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const { date, orderNumber, status } = req.query;
  
      // Cast query parameters to strings or undefined
      const parsedDate = typeof date === "string" ? date : undefined;
      const parsedOrderNumber = typeof orderNumber === "string" ? orderNumber : undefined;
      const parsedStatus = typeof status === "string" ? status : undefined;
   
      // Call service to get orders
      const orders = await getOrderListService({ userId, date: parsedDate, orderNumber: parsedOrderNumber, status: parsedStatus });
  
      res.status(200).json({
        error: false,
        message: "Order list retrieved successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
};

// cancel order service
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingId } = req.params; // The ID of the booking to cancel
      const { userId } = req.body; // Logged-in user's ID
  
      // Call service to cancel the order
      const result = await cancelOrderService({ bookingId: Number(bookingId), userId: Number(userId) });
  
      res.status(200).json({
        error: false,
        message: "Order cancelled successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
};