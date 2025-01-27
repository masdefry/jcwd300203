// controllers/report.controller.ts
import { Request, Response, NextFunction } from "express";
import { getSalesReportService, getPropertyReportService } from "@/services/report.service";

// Sales Report
export const salesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body; 
    const tenantId = usersId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Tenant ID is required" });
    }
    
    // Extract pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;

    const { startDate, endDate, sortBy } = req.query;
    const report = await getSalesReportService({ 
      tenantId, 
      startDate: startDate ? new Date(startDate as string) : undefined, 
      endDate: endDate ? new Date(endDate as string) : undefined, 
      sortBy: sortBy === "asc" || sortBy === "desc" ? sortBy : undefined,
      page, 
      limit 
    });
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...report,
        currentPage: page
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Property Report
export const propertyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usersId } = req.body;
    const tenantId = usersId; 
    
    const report = await getPropertyReportService({ tenantId });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};