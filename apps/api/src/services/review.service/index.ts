import { prisma } from "@/connection";

interface AddReviewParams {
  usersId: number;
  propertyId: number;
  comment: string;
  rating: number;
}

interface ReplyToReviewParams {
    usersId: number;
    reviewId: number;
    reply: string;
}
  
export const addReviewService = async ({ usersId, propertyId, comment, rating }: AddReviewParams) => {
    const findUser = await prisma.customer.findUnique({
        where: {
            id: usersId
        }
    })
    if(!findUser) throw {msg: 'Unauthorized', status: 401}
     
    // Validate rating range
    if (rating < 1 || rating > 5) throw { msg: "Rating must be between 1 and 5", status: 400 };

  
    // Check if the booking exists and has passed the check-out date
    const booking = await prisma.booking.findFirst({
        where: {
        customerId: usersId,
        propertyId,
        checkOutDate: { lte: new Date() },
        },
    });

    if (!booking) throw { msg: "You can only review properties you have checked out from", status: 400 };

    // Check if the user has already reviewed this property
    const existingReview = await prisma.review.findFirst({
        where: { customerId: usersId, propertyId },
    });

    if (existingReview) throw { msg: "You have already reviewed this property", status: 400 };
    

    // Add the review
    const review = await prisma.review.create({
        data: { customerId: usersId, propertyId, comment, rating },
    });

    return review;
};

export const replyToReviewService = async ({ usersId, reviewId, reply }: ReplyToReviewParams) => {
    const findTenant = await prisma.tenant.findUnique({
        where: {
            id: usersId
        }
    })
    if (!findTenant) throw {msg: 'Unauthorized', status: 401}

    // Fetch the review with property details
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { property: true },
    });

    if (!review) throw { msg: "Review not found", status: 404 };

    if (review.property.tenantId !== usersId) throw { msg: "Unauthorized: You can only reply to reviews of your own properties", status: 403 };
    
    // Add the tenant's reply
    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { reply },
    });

    return updatedReview;
};