import { prisma } from "@/connection"
import { BookingStatus } from "@prisma/client"; // Import Prisma enum type
import path from "path";
import fs from "fs";

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

  if(!findUser || !findUser.isVerified) throw {msg: 'Please verify your account first', status: 406}
  const room = await prisma.roomType.findUnique({
    where: { id: roomId },
  });

  if (!room || room.qty < room_qty) throw { msg: "Not enough rooms available", status: 400 };
  
  // Retrieve the latest `id` from the `Booking` table
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

export const uploadPaymentProofService = async ({ bookingId, usersId, file }: UploadPaymentProofParams) => {
  // Convert usersId to a number
  usersId = Number(usersId);

  // Validate booking ownership and status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { status: true },
  });

  if (!booking || booking.customerId !== usersId) {
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