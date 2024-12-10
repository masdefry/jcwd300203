import { Request } from "express";
export interface RequestWithFiles extends Request {
    files?: { [fieldname: string]: Express.Multer.File[] | any};
}