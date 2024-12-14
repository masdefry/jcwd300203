import { Router } from "express"
import { getOrderList, cancelOrder } from "@/controllers/order.controller"

const router = Router()

// create a new room reservation
router.get("/", getOrderList)
router.post("/:bookingId/cancel", cancelOrder);

export default router