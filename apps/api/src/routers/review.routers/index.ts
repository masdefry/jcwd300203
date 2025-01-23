import { Router } from "express";
import { getReview, addReview, replyToReview, getTenantReviews, getCustomerReviews } from "@/controllers/review.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";

const router = Router();

// customer route
router.get("/:bookingId",verifyToken, verifyRoleCustomer, getReview)
router.post("/",verifyToken, verifyRoleCustomer, addReview)
router.get("/customer/reviews", verifyToken, verifyRoleCustomer, getCustomerReviews);

// tenant route
router.get("/",verifyToken, verifyRoleTenant, getTenantReviews)
router.post("/:reviewId/reply",verifyToken, verifyRoleTenant,replyToReview)

export default router;