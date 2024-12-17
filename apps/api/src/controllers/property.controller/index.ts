import { deletePropertyService, getPropertiesListService, getPropertiesListTenantService, getPropertyDetailsService, getPropertyDetailsTenantService } from "@/services/property.service";
import { Request, Response, NextFunction } from "express";
import { parseCustomDate } from "@/utils/parse.date";

export  const getPropertiesList = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {search, checkIn, checkOut, guest, sortBy, sortOrder, page, limit} = req.query

        if (checkIn && typeof checkIn !== "string") throw { msg: "Invalid date", status: 406 };
        if (checkOut && typeof checkOut !== "string") throw { msg: "Invalid date", status: 406 };
        if (search && typeof search !== "string") throw { msg: "Invalid search input", status: 406 };
        if (guest && typeof guest !== "string") throw { msg: "Invalid guest count", status: 406 };

        if (search && !checkIn && !checkOut && !guest) throw {msg: 'Please complete the input', status:400}

        const parsedCheckIn = checkIn ? parseCustomDate(checkIn) : undefined;
        const parsedCheckOut = checkOut ? parseCustomDate(checkOut) : undefined;
        const guestCount = guest ? Number(guest) : undefined 

        const pageNumber = page ? parseInt(page as string, 10) : 1
        const pageSize = limit ? parseInt(limit as string, 10) : 10
        const offset = (pageNumber - 1) * pageSize;

        const allowedSortBy = ['name', 'price'];
        const allowedSortOrder = ['asc', 'desc'];

        const validSort = allowedSortBy.includes(sortBy as string) ? (sortBy as string) : 'name'
        const validSortOrder = allowedSortOrder.includes (sortOrder as string) ? (sortOrder as string) : 'asc'

        console.log({
            parsedCheckIn,
            parsedCheckOut,
            search,
            guestCount,
            offset,
            pageSize,
            sortBy: validSort,
            sortOrder: validSortOrder
        });

        const properties = await getPropertiesListService({parsedCheckIn, parsedCheckOut, search: search || undefined, guest: guest || undefined, offset, pageSize, sortBy: validSort, sortOrder: validSortOrder})

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