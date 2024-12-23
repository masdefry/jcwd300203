// controllers/report.controller.ts
import { Request, Response, NextFunction } from "express";
import { getSalesReportService, getPropertyReportService } from "@/services/report.service";

// Sales Report
export const salesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.body;
    const { startDate, endDate, sortBy } = req.query;

    const report = await getSalesReportService({ tenantId, startDate, endDate, sortBy });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// Property Report
export const propertyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.body;
    const report = await getPropertyReportService({ tenantId });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};