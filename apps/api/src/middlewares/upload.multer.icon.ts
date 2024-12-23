import { Request, Response, NextFunction } from 'express';
import { uploadMulterIcon } from '../utils/multer';

export const uploadIcon = (req: Request, res: Response, next: NextFunction) => {
  const upload = uploadMulterIcon.single('icon'); 
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};