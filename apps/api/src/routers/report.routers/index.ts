// routes/report.routes.ts
import { Router } from "express";
import { salesReport, propertyReport } from "@/controllers/report.controller";

const router = Router();

router.get("/sales-report", salesReport);
router.get("/property-report", propertyReport);

export default router;