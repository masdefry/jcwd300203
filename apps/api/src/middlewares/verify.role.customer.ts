import { NextFunction, Response, Request } from 'express';

export const verifyRoleCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {authorizationRole, usersId} = req.body

        if(authorizationRole !== 'customer') throw {msg: 'User Unauthorized', status: 401}

        if(authorizationRole && usersId){
            req.body.usersId = usersId
            req.body.authorizationRole = authorizationRole
        }

        next()
    } catch (error) {
        
        next(error)
    }
}