import { deletePropertyService, getPropertiesListService, getPropertiesListTenantService, getPropertyDetailsService, getPropertyDetailsTenantService } from "@/services/property.service";
import { Request, Response, NextFunction } from "express";
import { parseCustomDate } from "@/utils/parse.date";

export  const getPropertiesList = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const properties = await getPropertiesListService()

        res.status(200).json({
            error: false,
            message: 'Properties retrieved',
            data: properties
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        const {checkIn, checkOut} = req.query;

        if (typeof checkIn !=='string' || typeof checkOut !== 'string') throw {msg: 'Invalid date' ,status: 406}

        const parsedCheckIn = parseCustomDate(checkIn)
        const parsedCheckOut = parseCustomDate(checkOut);
        const data = await getPropertyDetailsService({id, parsedCheckIn, parsedCheckOut})

        res.status(200).json({
            error: false,
            message: 'Property founded',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertiesListTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body

        const data = await getPropertiesListTenantService({usersId, authorizationRole})

        res.status(200).json({
            error: false,
            message: 'Properties retrieved',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertyDetailsTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body
        const {id} = req.params

        const data = await getPropertyDetailsTenantService({usersId, authorizationRole, id})

        res.status(200).json({
            error: false,
            message: 'Property found',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const createProperty = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {} = req.body;

    } catch (error) {
        next(error)
    }
}

export const deleteProperty = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body;
        const {id} = req.params;

        await deletePropertyService({usersId, authorizationRole, id})

        res.status(200).json({
            error: false,
            message: 'Property deleted',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}