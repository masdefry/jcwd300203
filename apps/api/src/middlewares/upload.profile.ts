import { Request, Response, NextFunction } from 'express';
import { uploadMulterProfile } from '../utils/multer';

export const uploadProfile = (req: Request, res: Response, next: NextFunction ) => {
  const upload = uploadMulterProfile.fields([{ name: 'profileImage', maxCount: 1 }]); 

  upload(req, res, (err) => {
    if (err) {
        console.log('Profile image:', req.files);  
      return next(err); 
    }
    next(); 
  });
};
