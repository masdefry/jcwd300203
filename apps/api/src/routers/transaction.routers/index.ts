import { Router } from "express"

import { confirmPayment, createRoomReservation, uploadPaymentProof } from "@/controllers/transaction.controller"
import { proofOfPaymentUploader } from "@/middlewares/upload.payment.proof"
import { verifyToken } from "@/middlewares/verify.token"
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer"
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant"

const router = Router()

// create a new room reservation
router.post("/reserve",verifyToken, verifyRoleCustomer, createRoomReservation)

// upload payment proof route
router.post("/upload-proof/:bookingId",verifyToken, verifyRoleCustomer, proofOfPaymentUploader, uploadPaymentProof)

// tenant route
router.post("/:bookingId/confirm",verifyToken, verifyRoleTenant, confirmPayment)

export default router