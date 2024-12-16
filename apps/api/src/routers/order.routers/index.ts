import { Router } from "express"
import { getOrderList, cancelOrder, getTenantOrderList, sendOrderReminders, cancelUserOrder} from "@/controllers/order.controller"
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer";

const router = Router()

// user
router.get("/",verifyToken, verifyRoleCustomer, getOrderList)
router.post("/:bookingId/cancel", cancelOrder);

// tenant 
router.get("/tenant", verifyToken, verifyRoleTenant, getTenantOrderList)
router.post("/tenant/remind",sendOrderReminders)
router.post("/tenant/:bookingId/cancel", cancelUserOrder)

export default router