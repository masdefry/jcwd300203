import {Request, Response, NextFunction } from "express"
import {addReviewService, replyToReviewService} from "@/services/review.service";
import prisma from "@/prisma";
import { BookingStatus } from "@prisma/client";

// Get Review by Booking ID
export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body;
    const { bookingId } = req.params;

    // Validate input
    if (!bookingId) {
      throw { msg: "Booking ID is required", status: 400 };
    }

    // Fetch the propertyId from the Booking table
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      select: { propertyId: true }, // Retrieve only the propertyId
    });

    if (!booking) {
      throw { msg: "Booking not found", status: 404 };
    }

    // Fetch the review using propertyId and customerId
    const review = await prisma.review.findFirst({
      where: {
        propertyId: booking.propertyId,
        customerId: usersId,
      },
    });

    if (!review) {
      return res.status(404).json({ error: true, msg: "Review not found" });
    }

    res.status(200).json({
      error: false,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// add review
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { usersId, propertyId, comment, rating } = req.body;

      if (!comment || !rating) throw { msg: "Comment and rating are required", status: 400 };
      if (!usersId) throw { msg: "Something went wrong", status: 401 };
      if (!propertyId) throw { msg: "Property not found", status: 404 };

      // Check if the user has a CONFIRMED booking for the given property
      const confirmedBooking = await prisma.booking.findFirst({
        where: {
          customerId: usersId,
          propertyId: propertyId,
          status: {
            some: {
              Status: BookingStatus.CONFIRMED,
            },
          },
        },
        include: {
          status: true,
        },
      });
      
      if (!confirmedBooking) {
          throw { msg: "No confirmed booking found for this property.", status: 403 };
      }

      // Add the review
      const review = await addReviewService({ usersId, propertyId, comment, rating });

      res.status(201).json({
          error: false,
          message: "Review added successfully",
          data: review,
      });

  } catch (error) {
      next(error);
  }
};

// get tenant review
export const getTenantReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body;
     console.log('userId:',usersId)
    const reviews = await prisma.review.findMany({
      where: {
        property: {
          tenantId: usersId
        }
      },
      include: {
        customer: true,
        property: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      error: false,
      message: "Reviews retrieved successfully",
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// Reply to Review
export const replyToReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId, reply, authorizationRole } = req.body;
    const { reviewId } = req.params;

    if (!reviewId) throw { msg: "Review not found", status: 404 };
    if (!usersId || authorizationRole !== "tenant") throw { msg: "Something went wrong", status: 401 };
    if (!reply) throw { msg: "Reply cannot be empty", status: 400 };

    const updatedReview = await replyToReviewService({
      usersId,
      reviewId: Number(reviewId),
      reply,
    });

    res.status(200).json({
      error: false,
      message: "Reply updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body;

    const reviews = await prisma.review.findMany({
      where: {
        customerId: usersId,
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      error: false,
      message: "Customer reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};