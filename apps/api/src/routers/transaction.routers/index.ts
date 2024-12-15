import { Router } from "express"

import { confirmPayment, createRoomReservation, uploadPaymentProof } from "@/controllers/transaction.controller"
import { proofOfPaymentUploader } from "@/middlewares/upload.payment.proof"
import { verifyToken } from "@/middlewares/verify.token"

const router = Router()

// create a new room reservation
router.post("/reserve", createRoomReservation)

// upload payment proof route
router.post("/upload-proof/:bookingId", proofOfPaymentUploader, uploadPaymentProof)

// tenant route
router.post("/:bookingId/confirm", confirmPayment)

export default router