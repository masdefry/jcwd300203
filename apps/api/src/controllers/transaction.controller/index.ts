import { Request, Response, NextFunction } from "express";
import { createRoomReservationService, uploadPaymentProofService, confirmPaymentService} from "@/services/transaction.service";
import { parseCustomDate } from "@/utils/parse.date";

/**
 * create room reservation
 * @param req
 * @param res 
 * @param next 
*/
export const createRoomReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, propertyId, roomId, checkInDate, checkOutDate, room_qty, paymentMethod } = req.body;

    // Validate request body
    if (!customerId || !propertyId || !roomId || !checkInDate || !checkOutDate || !room_qty) {
      throw { msg: "All fields are required", status: 400 };
    }

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
      customerId,
      propertyId,
      roomId,
      checkInDate: parsedCheckInDate,
      checkOutDate: parsedCheckOutDate,
      room_qty,
      paymentMethod,
    });

    res.status(201).json({
      error: false,
      message: "Room reservation created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// upload payment proof
export const uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    // validate file
    const file = req.file;
    if (!file){
      throw {msg: "no file uploaded", status: 400}

    } 

    // Call the service
    const result = await uploadPaymentProofService({
      bookingId: Number(bookingId),
      userId: Number(userId),
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
    const { tenantId, action } = req.body; // "approve" or "reject"
    const { bookingId } = req.params;    
    
    const result = await confirmPaymentService({tenantId: Number(tenantId), bookingId: Number(bookingId), action});

    res.status(200).json({
      error: false,
      message: `Payment ${action} successfully`,
      data: result
    })

  } catch (error) {
    next(error) 
  }
}