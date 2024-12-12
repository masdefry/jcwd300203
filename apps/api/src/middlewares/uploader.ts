import { NextFunction, Request, Response } from 'express';
import { uploadMulter } from '../utils/multer';

export const uploader = (req: Request, res: Response, next: NextFunction) => {
    const uploaded = uploadMulter.fields([{name: 'images', maxCount: 3}])
    const {usersId, authorizationRole} = req.body

    uploaded(req, res, function(err){
        try{
            console.log(err)
            console.log(req.files)
            if(err) throw {msg: err.message}
            
            if(!Array.isArray(req?.files) && !req?.files?.mainImage?.length) throw {msg: 'File not found'}
            
            if(usersId && authorizationRole){
                req.body.usersId = usersId
                req.body.authrorizationRole = authorizationRole
            }
       
            next()
        }catch(err){
            console.log(err);
            next(err)
        }
    })
}