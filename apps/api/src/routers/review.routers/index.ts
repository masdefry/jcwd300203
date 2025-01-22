import { Router } from "express";
import { getReview, addReview, replyToReview, getTenantReviews } from "@/controllers/review.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";

const router = Router();

// add review router
router.get("/:bookingId",verifyToken, verifyRoleCustomer, getReview)
router.post("/",verifyToken, verifyRoleCustomer, addReview)
router.get("/",verifyToken, verifyRoleTenant, getTenantReviews)
router.post("/:reviewId/reply",verifyToken, verifyRoleTenant,replyToReview)

export default router;