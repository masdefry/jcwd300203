import { Request, Response, NextFunction } from 'express';
import { uploadMulter } from '../utils/multer';

export const uploadRegisterTenant = (req: Request, res: Response, next: NextFunction) => {
    const upload = uploadMulter.fields([{ name: 'profileImage', maxCount: 1 },
        { name: 'idCardImage', maxCount: 1 }]); 
    
    upload(req, res, (err) => {
        if (err) {

            return next(err); 
        }
        next();
    });
};