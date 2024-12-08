import { Request, Response, NextFunction } from 'express';
import { uploadMulterProfile } from '../utils/multer';

export const uploadProfile = (req: Request, res: Response, next: NextFunction ) => {
  const upload = uploadMulterProfile.fields([{ name: 'profileImage', maxCount: 1 }]); // We only want one profile image
  // Use the upload middleware
  upload(req, res, (err) => {
    if (err) {
        console.log('Profile image:', req.files);  
      return next(err); // Handle any error (e.g., file size limit exceeded)
    }
    next(); // Proceed if file upload is successful
  });
};
