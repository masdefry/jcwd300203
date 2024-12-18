import {Request, Response, NextFunction } from "express"
import {addReviewService, replyToReviewService} from "@/services/review.service";
import prisma from "@/prisma";
import { BookingStatus } from "@prisma/client";

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

// Reply to Review
export const replyToReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { usersId, reply, authorizationRole } = req.body;
      const { reviewId } = req.params;

      if(!reviewId) throw {msg: 'Review not found', status:404};
      if(!usersId || authorizationRole !== 'tenant') throw {msg: 'Something went wrong', status: 401};
      if(!reply) throw { msg: "Reply cannot be empty", status: 400 };
  
      const updatedReview = await replyToReviewService({ usersId, reviewId: Number(reviewId), reply });
  
      res.status(200).json({
        error: false,
        message: "Reply added successfully",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
};