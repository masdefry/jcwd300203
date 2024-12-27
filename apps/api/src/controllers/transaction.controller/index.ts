import { Request, Response, NextFunction } from "express";
import { createRoomReservationService, uploadPaymentProofService, confirmPaymentService} from "@/services/transaction.service";
import { parseCustomDate } from "@/utils/parse.date";
import midtransClient from 'midtrans-client'
import { CoreApi } from "midtrans-client";
import { prisma } from "@/connection"

// Initialize Midtrans client
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-3W12iKdf4GXKeedvdA7NrGuX',
});

const coreApi = new CoreApi({
  isProduction: false, // Set to true in production
  serverKey: "SB-Mid-server-3W12iKdf4GXKeedvdA7NrGuX",
});

/**
 * Handle Midtrans Payment Notification
 * @param req
 * @param res
 */
export const handlePaymentNotification = async (req: Request, res: Response) => {
  try {
    
    // Validate and parse the notification using Midtrans
    const notification = req.body;

    // Validate the notification using the transaction ID (order_id)
    const orderId = notification.order_id;
    if (!orderId) {
      throw new Error("Missing order_id in notification payload");
    }

    // Use `transaction.status` to fetch transaction details
    const statusResponse = await coreApi.transaction.status(orderId);

    const { order_id, transaction_status, fraud_status } = statusResponse;

    console.log("Payment Notification Received:", {
      order_id,
      transaction_status,
      fraud_status,
    });

    // Find the corresponding booking by order_id
    const bookingId = parseInt(order_id.split("-")[1], 10); // Assuming order_id format is ORDER-{bookingId}
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: true, message: "Booking not found" });
    }

    // Handle different transaction statuses
    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        // Update booking status to CONFIRMED
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: {
              create: { Status: "CONFIRMED" },
            },
          },
        });
      } else if (fraud_status === "challenge") {
        // Handle challenge status
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: {
              create: { Status: "WAITING_FOR_CONFIRMATION" },
            },
          },
        });
      }
    } else if (transaction_status === "settlement") {
      // Payment settled successfully
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: {
            create: { Status: "CONFIRMED" },
          },
        },
      });
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      // Payment failed or expired
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: {
            create: { Status: "CANCELED" },
          },
        },
      });
    } else if (transaction_status === "pending") {
      // Payment is pending
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: {
            create: { Status: "WAITING_FOR_PAYMENT" },
          },
        },
      });
    }

    // Respond to Midtrans with a 200 OK status
    res.status(200).json({ message: "Notification handled successfully" });
  } catch (error) {
    console.error("Error handling payment notification:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

/**
 * create room reservation
 * @param req
 * @param res 
 * @param next 
*/
export const createRoomReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId, propertyId, checkInDate, checkOutDate, room_qty, paymentMethod } = req.body;
    
    // convert roomId to integer
    const roomId = parseInt(req.body.roomId, 10); // Ensure roomId is an integer
    if (isNaN(roomId)) {
      throw { msg: "Invalid roomId", status: 400 };
    }

    // Validate request body
    if (!usersId || !propertyId || !roomId || !checkInDate || !checkOutDate || !room_qty) throw { msg: "All fields are required", status: 400 };
  
    // Convert incoming `YYYY-MM-DD` to `DD/MM/YYYY` for compatibility with `parseCustomDate`
    const formattedCheckInDate = checkInDate.split('-').reverse().join('/');
    const formattedCheckOutDate = checkOutDate.split('-').reverse().join('/');

    // Parse the dates
    const parsedCheckInDate = parseCustomDate(formattedCheckInDate);
    const parsedCheckOutDate = parseCustomDate(formattedCheckOutDate);

    // Validate parsed dates
    if (parsedCheckInDate >= parsedCheckOutDate) {
      throw { msg: "Check-out date must be after check-in date", status: 400 };
    }

    // Call service to create the booking
    const booking = await createRoomReservationService({
      usersId,
      propertyId,
      roomId,
      checkInDate: parsedCheckInDate,
      checkOutDate: parsedCheckOutDate,
      room_qty,
      paymentMethod,
    });

    if (paymentMethod === "GATEWAY") {
      // Create Midtrans transaction
      const paymentParams = {
        transaction_details: {
          order_id: `ORDER-${booking.id}`, // Unique order ID
          gross_amount: booking.price, // Total price
        }
      };

      const paymentToken = await snap.createTransaction(paymentParams);

      res.status(201).json({
        error: false,
        message: "Room reservation created successfully",
        data: {
          booking,
          token: paymentToken,
        },
      });
    } else {
      res.status(201).json({
        error: false,
        message: "Room reservation created successfully",
        data: booking,
      });
    }
    
  } catch (error) {
    next(error);
  }
};

// upload payment proof
export const uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { usersId } = req.body;

    // validate file
    const file = req.file;
    if (!file){
      throw {msg: "no file uploaded", status: 400}

    } 

    // Call the service
    const result = await uploadPaymentProofService({
      bookingId: Number(bookingId),
      usersId: Number(usersId),
      file 
    });

    res.status(200).json({
      error: false,
      message: "Payment proof uploaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// confirm payment or reject payment
export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId, action } = req.body; // "approve" or "reject"
    const { bookingId } = req.params;    
    
    const result = await confirmPaymentService({usersId: Number(usersId), bookingId: Number(bookingId), action});

    res.status(200).json({
      error: false,
      message: `Payment ${action} successfully`,
      data: result
    })

  } catch (error) {
    next(error) 
  }
}