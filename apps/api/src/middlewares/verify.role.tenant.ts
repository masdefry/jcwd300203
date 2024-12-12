import { NextFunction, Response, Request } from 'express';

export const verifyRoleTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {authorizationRole,usersId} = req.body

        if(authorizationRole !== 'tenant') throw {msg: 'User Unauthorized', status: 401}

        if(authorizationRole && usersId){
            req.body.usersId = usersId
        }

        next()
    } catch (error) {
        
        next(error)
    }
}