import {Request, Response, NextFunction } from "express"
import {addReviewService, replyToReviewService} from "@/services/review.service";
  
// add review
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerId, propertyId, comment, rating } = req.body;        
        
        if (!comment || !rating) {
            throw { msg: "Comment and rating are required", status: 400 };
        }

        const review = await addReviewService({ customerId, propertyId, comment, rating });

        res.status(201).json({
            error: false,
            message: "Review added successfully",
            data: review,
        });

    } catch (error) {
        next(error) 
    }
};

// Reply to Review
export const replyToReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, reply } = req.body;
      const { reviewId } = req.params;
  
      if (!reply) {
        throw { msg: "Reply cannot be empty", status: 400 };
      }
  
      const updatedReview = await replyToReviewService({ tenantId, reviewId: Number(reviewId), reply });
  
      res.status(200).json({
        error: false,
        message: "Reply added successfully",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
};