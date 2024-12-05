import { Request, Response, NextFunction } from "express";
import { comparePassword, hashPassword } from "@/utils/hash.password";
import { loginCustomerService, loginTenantService, registerCustomerService } from "@/services/auth.service";
import { createToken } from "@/utils/jwt";

export const registerCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, username, password, name} = req.body;
        if (!email || !password || !username || !name) throw {message: 'Input cannot be blank', status: 406};

        const hashedPassword = await hashPassword(password);

        await registerCustomerService({email, username, password: hashedPassword, name})

        res.status(201).json({
            error: false,
            message: 'Successfully registered, please login',
            data: {
                email: email,
                name: name,
                username: username
            }
        })
    } catch (error) {
        next(error)
    }
}


export const loginCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {emailOrUsername, password} = req.body;
        if(!emailOrUsername || !password) throw {message: 'Input cannot be blank', status: 406};

        const user = await loginCustomerService({emailOrUsername, password})

        const verifyPassword = comparePassword(password, user!.password)
        if (!verifyPassword) throw {message: 'False password, please try again', status: 406};
        
        const token = await createToken({id: user?.id, role: user?.role})
        
        res.status(200).json({
            error: false,
            message: 'Successfully logged in',
            data: {
                token,
                email: user?.email,
                name: user?.name,
                profilePicture: user?.profileImage
            }
        })
    } catch (error) {
        next(error);
    }
}

export const loginTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {emailOrUsername, password} = req.body;
        if(!emailOrUsername || !password) throw {message: 'Input cannot be blank', status: 406};

        const user = await loginTenantService({emailOrUsername, password})

        const verifyPassword = comparePassword(password, user!.password)
        if (!verifyPassword) throw {message: 'False password, please try again', status: 406};
        
        const token = await createToken({id: user?.id, role: user?.role})

        res.status(200).json({
            error: false,
            message: 'Successfully logged in',
            data: {
                token,
                email: user?.email,
                name: user?.name,
                profilePicture: user?.profileImage
            }
        })
    } catch (error) {
        next (error);
    }
}