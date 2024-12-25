import { Request, Response, NextFunction } from 'express';
import { uploadMulterProfile } from '../utils/multer';

export const uploadProfile = (req: Request, res: Response, next: NextFunction ) => {
  const upload = uploadMulterProfile.fields([{ name: 'profileImage', maxCount: 1 }]); 
  const {usersId, authorizationRole} = req.body
  upload(req, res, (err) => {
    if (err) {
        console.log('Profile image:', req.files);  
      return next(err); 
    }
    
    req.body.usersId = usersId;
    req.body.authorizationRole = authorizationRole;

    next(); 
  });
};
