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
  const room = await prisma.propertyRoomType.findUnique({
    where: { id: roomId },
  });

  if (!room || room.qty < room_qty) {
    throw { msg: "Not enough rooms available", status: 400 };
  }

  // Retrieve the latest `id` from the `Booking` table
  const latestBooking = await prisma.booking.findFirst({
    orderBy: { id: "desc" }, // Get the booking with the highest `id`
  });
  const nextId = latestBooking ? latestBooking.id + 1 : 1; // If no booking exists, start with `1`

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
  await prisma.propertyRoomType.update({
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
      status: {
        create: {
          Status: "WAITING_FOR_CONFIRMATION",
        },
      },
    },
  });

  return updatedBooking;
};