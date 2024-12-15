import { Router } from "express";
import { addReview, replyToReview } from "@/controllers/review.controller";

const router = Router();

// add review router
router.post("/", addReview)
router.post("/:reviewId/reply",replyToReview)

export default router;