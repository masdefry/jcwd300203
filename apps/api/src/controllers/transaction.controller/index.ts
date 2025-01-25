import { Request, Response, NextFunction } from "express";
import { createRoomReservationService, uploadPaymentProofService, confirmPaymentService, getAvailableRoomsService} from "@/services/transaction.service";
import { parseCustomDate } from "@/utils/parse.date";
import midtransClient from 'midtrans-client'
import { CoreApi } from "midtrans-client";
import { prisma } from "@/connection"
import { sendReminderEmails } from "@/services/transaction.service";

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
 * Update Booking Status
 * @param req
 * @param res
 */
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ error: true, message: "Missing required fields" });
    }

    // Validate the status
    const validStatuses = ["CONFIRMED", "CANCELED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: true, message: "Invalid status value" });
    }

    // Find the booking record
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ error: true, message: "Booking not found" });
    }

    // Find the Status record using bookingId
    const statusRecord = await prisma.status.findFirst({
      where: { bookingId: Number(bookingId) },
    });

    if (!statusRecord) {
      return res.status(404).json({ error: true, message: "Status record not found" });
    }

    // Update the Status record using the unique `id`
    const updatedStatus = await prisma.status.update({
      where: { id: statusRecord.id }, // Use the unique `id`
      data: { Status: status },
    });

    // Restore room qty if the booking is canceled
    if (status === "CANCELED") {
      await prisma.roomType.update({
        where: { id: booking.roomId }, // Use `roomId` from the booking
        data: {
          qty: {
            increment: booking.room_qty, // Increment the qty by the canceled room_qty
          },
        },
      });
    }
    
    return res.status(200).json({
      error: false,
      message: `Booking status updated to ${status}`,
      data: updatedStatus,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ error: true, message: "Internal server error" });
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
  
    // Parse the dates
    // Convert incoming `checkInDate` and `checkOutDate` directly to Date objects
    const parsedCheckInDate = new Date(checkInDate);
    const parsedCheckOutDate = new Date(checkOutDate);

    // Validate parsed dates
    if (isNaN(parsedCheckInDate.getTime()) || isNaN(parsedCheckOutDate.getTime())) {
      throw { msg: "Invalid dates provided", status: 400 };
    }

    if (parsedCheckInDate >= parsedCheckOutDate) {
      throw { msg: "Check-out date must be after check-in date", status: 400 };
    }
    
    // get available room before making the booking
    const availableRooms = await getAvailableRoomsService(roomId, parsedCheckInDate, parsedCheckOutDate);
    if (availableRooms < room_qty) {
      throw { msg: "Not enough rooms available", status: 400 };
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
          order_id: `ORDER-${booking.id}-${Date.now()}`, // Unique order ID
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

// trigger order reminder (manual)
export const triggerOrderReminder = async (req: Request, res: Response) => {
  try {
    const result: any = await sendReminderEmails();
    res.status(200).json({
      error: false,
      message: `Reminder emails sent to ${result.count} users.`,
    });
  } catch (error) {
    console.error("Error triggering order reminders:", error);
    res.status(500).json({
      error: true,
      message: "Failed to send order reminders.",
    });
  }
};