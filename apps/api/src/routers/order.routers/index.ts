import { Router } from "express"
import { getOrderList, cancelOrder, getTenantOrderList, sendOrderReminders, cancelUserOrder} from "@/controllers/order.controller"

const router = Router()

// user
router.get("/", getOrderList)
router.post("/:bookingId/cancel", cancelOrder);

// tenant 
router.get("/tenant",getTenantOrderList)
router.post("/tenant/remind",sendOrderReminders)
router.post("/tenant/:bookingId/cancel", cancelUserOrder)

export default router