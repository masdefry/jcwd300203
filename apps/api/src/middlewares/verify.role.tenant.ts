import { NextFunction, Response, Request } from 'express';

export const verifyRoleTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {authorizationRole} = req.body

        if(authorizationRole !== 'tenant') throw {msg: 'User Unauthorized', status: 401}

        next()
    } catch (error) {
        
        next(error)
    }
}