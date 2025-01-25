import { prisma } from "@/connection"
import { BookingStatus } from "@prisma/client"; // Import Prisma enum type
import cron from "node-cron";
import path from "path";
import fs from "fs";
import { sendEmail } from "@/utils/emailSender";

interface RoomReservationParams {
  usersId: number;
  propertyId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  room_qty: number;
  paymentMethod: "MANUAL" | "GATEWAY";
}

interface UploadPaymentProofParams {
  bookingId: number;
  usersId: number;
  file: Express.Multer.File;
}

interface ConfirmPaymentParams {
  usersId: number;
  bookingId: number;
  action: "approve" | "reject";
}

export const createRoomReservationService = async ({
  usersId,
  propertyId,
  roomId,
  checkInDate,
  checkOutDate,
  room_qty,
  paymentMethod,
}: RoomReservationParams) => {
  const findUser = await prisma.customer.findUnique({
    where: {
      id: usersId
    },
    select: {
      isVerified: true,
      id: true
    }
  })

  if(!findUser) throw {msg: 'Please verify your account first', status: 406}
  
  // Check for custom price
  const customPrice = await prisma.flexiblePrice.findFirst({
    where: {
      roomTypeId: roomId,
      OR: [
        { startDate: { lte: checkOutDate }, endDate: { gte: checkInDate } },
        { startDate: { lte: checkInDate }, endDate: { gte: checkInDate } },
      ],
    },
    orderBy: { startDate: "asc" },
  });
  
  // Retrieve fallback price from RoomType table
  const room = await prisma.roomType.findUnique({
    where: { id: roomId },
  });
  
  if (!room) throw { msg: "Room not found", status: 404 };
  
  // Calculate price: use customPrice or fallback room price
  const pricePerNight = customPrice ? Number(customPrice.customPrice) : Number(room.price);
  const numberOfNights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = pricePerNight * room_qty * numberOfNights;

  // Check room availability based on "CONFIRMED" and "WAITING_FOR_CONFIRMATION"
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      OR: [
        { status: { some: { Status: "CONFIRMED" } } },
        { status: { some: { Status: "WAITING_FOR_CONFIRMATION" } } },
      ],
      AND: [
        { checkInDate: { lt: checkOutDate } },
        { checkOutDate: { gt: checkInDate } },
      ],
    },
  });

  const alreadyBookedQty = overlappingBookings.reduce((sum, booking) => sum + booking.room_qty, 0);

  if (room.qty - alreadyBookedQty < room_qty)
    throw { msg: "Not enough rooms available", status: 400 };

  // Manually generate the next ID
  const latestBooking = await prisma.booking.findFirst({
    orderBy: { id: "desc" },
  });
  const nextId = latestBooking ? latestBooking.id + 1 : 1;

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      id: nextId,
      customerId: usersId,
      propertyId,
      roomId,
      checkInDate,
      checkOutDate,
      room_qty,
      price: totalPrice,
      status: {
        create: [
          {
            Status:
              paymentMethod === "GATEWAY"
                ? BookingStatus.WAITING_FOR_CONFIRMATION
                : BookingStatus.WAITING_FOR_PAYMENT,
          },
        ],
      },
    },
    include: { status: true },
  });

  return booking;
};

export const getAvailableRoomsService = async (roomId: number, checkInDate: Date, checkOutDate: Date) => {
  const room = await prisma.roomType.findUnique({
    where: { id: roomId },
  });

  if (!room) throw { msg: "Room not found", status: 404 };

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      OR: [
        { status: { some: { Status: "CONFIRMED" } } },
        { status: { some: { Status: "WAITING_FOR_CONFIRMATION" } } },
        { status: { some: { Status: "WAITING_FOR_PAYMENT" } } },
      ],
      AND: [
        { checkInDate: { lt: checkOutDate } },
        { checkOutDate: { gt: checkInDate } },
      ],
    },
  });

  const bookedQty = overlappingBookings.reduce((sum, booking) => sum + booking.room_qty, 0);
  return room.qty - bookedQty;
};

/**
 * Scheduler: Cancel expired bookings automatically.
 * Runs every minute to check for expired bookings.
 */
export const scheduleBookingCleanup = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running booking cleanup task...");

    try {
      // Fetch bookings that have expired, no proof of payment, and are NOT already cancelled
      const expiredBookings = await prisma.booking.findMany({
        where: {
          proofOfPayment: null,
          expiryDate: { lte: new Date() },
          status: {
            none: { Status: BookingStatus.CANCELED },
          },
        },
        include: { status: true },
      });

      // console.log(expiredBookings)

      for (const booking of expiredBookings) {
        // Add a CANCELED status for the booking
        await prisma.status.create({
          data: {
            bookingId: booking.id,
            Status: BookingStatus.CANCELED,
          },
        });

        console.log(`Booking ID ${booking.id} has been cancelled.`);
      }

      console.log("Booking cleanup task completed.");
    } catch (error) {
      console.error("Error running booking cleanup task:", error);
    }
  });
};

// upload payment proof
export const uploadPaymentProofService = async ({
  bookingId,
  usersId,
  file,
}: {
  bookingId: number;
  usersId: number;
  file: Express.Multer.File;
}) => {
  // Step 1: Validate the booking ownership and current status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      status: {
        orderBy: { createdAt: "desc" }, // Get the latest status
        take: 1, // Only fetch the latest status
      },
    },
  });

  if (!booking || booking.customerId !== usersId) {
    throw { msg: "Unauthorized or invalid booking", status: 403 };
  }

  const latestStatus = booking.status[0];
  if (!latestStatus || latestStatus.Status !== "WAITING_FOR_PAYMENT") {
    throw { msg: "Cannot upload proof for this booking", status: 400 };
  }

  // Step 2: Update proof of payment in the `booking` table
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      proofOfPayment: file.filename,
    },
  });

  // Step 3: Update the `Status` record for this booking
  await prisma.status.update({
    where: { id: latestStatus.id },
    data: {
      Status: "WAITING_FOR_CONFIRMATION",
    },
  });

  return {
    message: "Proof of payment uploaded and status updated to WAITING_FOR_CONFIRMATION",
    booking: updatedBooking,
  };
};

// confirm payment service
export const confirmPaymentService = async ({usersId, bookingId, action}: ConfirmPaymentParams) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true, status: true },
  })

  if (!booking || booking.property.tenantId !== usersId) throw { msg: "Unauthorized: You can only confirm/reject your own property's orders", status: 403 };
  
  if (!booking.proofOfPayment) throw { msg: "No proof of payment uploaded for this booking", status: 400 };
  
  // approve transaction
  if (action === "approve") {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: { create: { Status: BookingStatus.CONFIRMED } },
      },
    });

    // TODO: Send email to the user with booking details and usage rules
    return updatedBooking;
  } 
  
  // reject transaction
  else {
    // Update status back to "Canceled"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        proofOfPayment: null,
        status: { create: { Status: BookingStatus.WAITING_FOR_PAYMENT } },
      },
    });

    return updatedBooking;
  }
}

// send reminder emails for customer with confirmed order
export const sendReminderEmails = async () => {
  try {
    // Find all bookings with status "CONFIRMED"
    const orders = await prisma.booking.findMany({
      where: {
        status: {
          some: {
            Status: "CONFIRMED",
          },
        },
      },
      include: {
        property: true,
        customer: true,
      },
    });

    if (orders.length === 0) {
      console.log("No confirmed orders found for reminder emails.");
      return { success: true, count: 0 }; // Return a consistent structure
    }

    for (const order of orders) {
      if (!order.customer || !order.property) {
        console.warn(
          `Missing customer or property for order ID ${order.id}. Skipping email.`
        );
        continue;
      }

      const emailContent = `
        <p>Dear ${order.customer.name},</p>
        <p>This is a reminder for your upcoming reservation:</p>
        <ul>
          <li><strong>Property:</strong> ${order.property.name}</li>
          <li><strong>Check-in Date:</strong> ${order.checkInDate.toDateString()}</li>
          <li><strong>Rules:</strong> ${order.property.description || "N/A"}</li>
        </ul>
        <p>Please ensure you bring the necessary documents for check-in.</p>
        <p>Thank you for choosing our service!</p>
      `;

      // Send email
      await sendEmail({
        to: order.customer.email,
        subject: "Reservation Reminder",
        html: emailContent,
      });

      console.log(`Reminder email sent to ${order.customer.email}`);
    }

    return { success: true, count: orders.length };
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    throw error; // Rethrow the error to ensure it's handled upstream
  }
};

export const startOrderReminderCronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running Order Reminder Cron Job...");
    try {
      const result = await sendReminderEmails();
      console.log(`Order Reminder Cron Job completed. Emails sent: ${result.count}`);
    } catch (error) {
      console.error("Error triggering order reminders:", error);
    }
  });
};