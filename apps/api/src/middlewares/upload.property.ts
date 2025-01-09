import { uploadMulterProperty } from "@/utils/multer";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const uploadProperty = (req: Request, res: Response, next: NextFunction) => {
    const { usersId, authorizationRole } = req.body;
    console.log('Upload middleware initial body:', { usersId, authorizationRole });
    // Configure upload fields to handle maximum possible number of room types
    const uploadFields = [
        { name: 'mainImage', maxCount: 1 },
        { name: 'propertyImages', maxCount: 20 },
    ];

    // Add fields for all possible room types (let's say max 10 room types)
    for (let i = 0; i < 10; i++) {
        uploadFields.push({
            name: `roomTypeImages${i}`,
            maxCount: 15
        });
    }

    // Offset for new room type.
    for (let i = 10000; i < 10010; i++) {
        uploadFields.push({
            name: `roomTypeImages${i}`,
            maxCount: 15
        });
    }

    console.log('Configured upload fields:', uploadFields);

    const upload = uploadMulterProperty.fields(uploadFields);

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log('Multer error details:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                throw {
                    msg: 'File too large! Maximum size is 2MB',
                    status: 413
                };
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                throw {
                    msg: `Too many files uploaded for field: ${err.field}`,
                    status: 400
                };
            }
            throw {
                msg: err.message,
                status: 400
            };
        }

        if (err) {
            return next(err);
        }

        req.body.usersId = usersId;
        req.body.authorizationRole = authorizationRole;
        
        console.log('Upload middleware final body:', req.body);

        console.log('Successfully processed files:', Object.keys(req.files || {}));
        next();
    });
};