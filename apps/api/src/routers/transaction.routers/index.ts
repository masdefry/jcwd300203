import { Router } from "express"

import { createRoomReservation, uploadPaymentProof } from "@/controllers/transaction.controller"
import { proofOfPaymentUploader } from "@/middlewares/upload.payment.proof"
import { verifyToken } from "@/middlewares/verify.token"

const router = Router()

// create a new room reservation
router.post("/reserve", createRoomReservation)

// upload payment proof route
router.post("/upload-proof/:bookingId", proofOfPaymentUploader, uploadPaymentProof)

export default router