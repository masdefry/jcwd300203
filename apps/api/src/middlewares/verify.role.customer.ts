import { NextFunction, Response, Request } from 'express';

export const verifyRoleCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {authorizationRole} = req.body

        if(authorizationRole !== 'customer') throw {msg: 'User Unauthorized', status: 401}

        next()
    } catch (error) {
        
        next(error)
    }
}