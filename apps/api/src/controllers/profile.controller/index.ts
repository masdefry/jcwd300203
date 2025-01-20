import { editCustomerProfileService, editTenantProfileService, getCustomerProfileService, getTenantProfileService } from "@/services/profile.service";
import { Request, Response, NextFunction } from "express";
import { RequestWithFiles } from "../auth.controller/types";
import { IEditCustomerProfile } from "@/services/profile.service/types";

export const getCustomerProfile = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId} = req.body;

        const user = await getCustomerProfileService({usersId});

        res.status(200).json({
            error: false,
            message: 'Profile retrieved',
            data: {
                name: user?.name,
                email: user?.email,
                username: user?.username,
                role: user?.role,
                profileImage: user?.profileImage,
                verified: user?.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getTenantProfile = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId} = req.body;

        const user = await getTenantProfileService({usersId});

        res.status(200).json({
            error: false,
            message: 'Profile retrieved',
            data: {
                name: user?.name,
                email: user?.email,
                username: user?.username,
                role: user?.role,
                profileImage: user?.profileImage,
                idCardImage: user?.IdCardImage
            }
        })
    } catch (error) {
        next(error);
    }
}

export const editCustomerProfile = async(req: RequestWithFiles, res: Response, next: NextFunction) => {
    try {
        const {usersId, name, username} = req.body
        const uploadedImage = req.files

        await editCustomerProfileService({usersId, name, username, uploadedImage} as IEditCustomerProfile)

        res.status(200).json({
            error: false,
            message: 'Profile successfully updated',
            data: {}
        })
    } catch (error) {
        next(error);
    }
}

export const editTenantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, name, username} = req.body

        const uploadedImage = req.files

        console.log('Received files:', uploadedImage);
        console.log('Request body:', { usersId, name, username });

        await editTenantProfileService({usersId, name, username, uploadedImage} as IEditCustomerProfile)

        res.status(200).json({
            error: false,
            message: 'Profile Successfully updated',
            data: {}
        })
    } catch (error) {
        next(error);
    }
}