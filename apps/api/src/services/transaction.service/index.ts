import { prisma } from "@/connection"
import { BookingStatus } from "@prisma/client"; // Import Prisma enum type
import path from "path";
import fs from "fs";

interface RoomReservationParams {
  customerId: number;
  propertyId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  room_qty: number;
  paymentMethod: "MANUAL" | "GATEWAY";
}

interface UploadPaymentProofParams {
  bookingId: number;
  userId: number;
  file: Express.Multer.File;
}

interface ConfirmPaymentParams {
  tenantId: number;
  bookingId: number;
  action: "approve" | "reject";
}

export const createRoomReservationService = async ({
  customerId,
  propertyId,
  roomId,
  checkInDate,
  checkOutDate,
  room_qty,
  paymentMethod,
}: RoomReservationParams) => {
  // Check room availability
  const room = await prisma.roomType.findUnique({
    where: { id: roomId },
  });

  if (!room || room.qty < room_qty) {
    throw { msg: "Not enough rooms available", status: 400 };
  }

  // Retrieve the latest `id` from the `Booking` table
  const latestBooking = await prisma.booking.findFirst({
    orderBy: { id: "desc" },
  });
  const nextId = latestBooking ? latestBooking.id + 1 : 1;

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      id: nextId,
      customerId,
      propertyId,
      roomId,
      checkInDate,
      checkOutDate,
      room_qty,
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
    include: {
      status: true, // Include related statuses in the result
    },
  });

  // Decrease the available room count
  await prisma.roomType.update({
    where: { id: roomId },
    data: { qty: { decrement: room_qty } },
  });

  return booking;
};

export const uploadPaymentProofService = async ({ bookingId, userId, file }: UploadPaymentProofParams) => {
  // Convert userId to a number
  userId = Number(userId);

  // Validate booking ownership and status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { status: true },
  });

  if (!booking || booking.customerId !== userId) {
    throw { msg: "Unauthorized or invalid booking", status: 403 };
  }

  if (booking.status.some((s) => s.Status !== "WAITING_FOR_PAYMENT")) {
    throw { msg: "Cannot upload proof for this booking", status: 400 };
  }

  // Update booking with proof of payment path
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      proofOfPayment: file.filename,
      status: {
        create: {
          Status: "WAITING_FOR_CONFIRMATION",
        },
      },
    },
  });

  return updatedBooking;
};

// confirm payment service
export const confirmPaymentService = async ({tenantId, bookingId, action}: ConfirmPaymentParams) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true, status: true },
  })

  if (!booking || booking.property.tenantId !== tenantId) {
    throw { msg: "Unauthorized: You can only confirm/reject your own property's orders", status: 403 };
  }

  if (!booking.proofOfPayment) {
    throw { msg: "No proof of payment uploaded for this booking", status: 400 };
  }
  
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