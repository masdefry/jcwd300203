// routes/report.routes.ts
import { Router } from "express";
import { salesReport, propertyReport } from "@/controllers/report.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";

const router = Router();

router.get("/sales-report", salesReport);
router.get("/property-report", verifyToken, verifyRoleTenant, propertyReport);

export default router;