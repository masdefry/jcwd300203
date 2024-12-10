import { Request, Response, NextFunction } from 'express';
import { uploadMulter } from '../utils/multer';

export const uploadRegisterTenant = (req: Request, res: Response, next: NextFunction) => {
    const upload = uploadMulter.fields([{ name: 'profileImage', maxCount: 1 },
        { name: 'idCardImage', maxCount: 1 }]);  // We only want one id card image

    // Use the upload middleware
    
    upload(req, res, (err) => {
        if (err) {

            return next(err); // Handle any error (e.g., file size limit exceeded)
        }
        next(); // Proceed if file upload is successful
    });
};