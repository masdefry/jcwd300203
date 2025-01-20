import { Request, Response, NextFunction } from "express";
import { comparePassword, hashPassword } from "@/utils/hash.password";
import { changeCustomerPasswordService, changeEmailService, changeTenantPasswordService, keepLoginService, loginCustomerService, loginTenantService, registerCustomerService, registerTenantService, requestChangeEmailService, requestResetPasswordService, requestVerifyCustomerService, resetPasswordService, verifyCustomerService, verifyEmailCustomerService, verifyEmailTenantService } from "@/services/auth.service";
import { createRefreshToken, createToken, decodeRefreshToken } from "@/utils/jwt";
import { prisma } from "@/connection";
import { generateUsername } from "@/utils/generate.username";
import { RequestWithFiles } from "./types";

export const verifyEmailCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body;

        await verifyEmailCustomerService({email})

        res.status(200).json({
            error: false,
            message: 'A verification email has been sent, please check your email',
            data: {}
        }) 
    } catch (error) {
        next (error);
    }
}

export const verifyEmailTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body;

        await verifyEmailTenantService({email})

        res.status(200).json({
            error: false,
            message: 'A verification email has been sent, please check your email',
            data: {}
        }) 
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error: true,
                msg: error.msg,
                data: {}
            });
        }
        next (error);
    }
}

export const registerCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {username, password, name} = req.body;
        const {authorization} = req.headers;

        if (!password || !username || !name) throw {message: 'Input cannot be blank', status: 406};

        
        const hashedPassword = await hashPassword(password);

        const user = await registerCustomerService({resetPasswordToken: authorization?.split(' ')[1],username, password: hashedPassword, name})

        res.status(201).json({
            error: false,
            message: 'Successfully registered, please login',
            data: {
                email: user.email,
                name: user.name,
                username: user.username
            }
        })
    } catch (error) {
        next(error)
    }
}

export const registerTenant = async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    try {
        const { username, password, name } = req.body;
        const { authorization } = req.headers;

        const verificationToken = authorization?.split(' ')[1]
        
        const profileImage = req.files?.profileImage?.[0];  
        const idCardImage = req.files?.idCardImage?.[0];  

        if (!username || !password || !name) throw { msg: 'Input cannot be blank', status: 406 };
        
       
        const hashedPassword = await hashPassword(password);

        const profileImageName = profileImage?.filename;
        const idCardImageName = idCardImage?.filename;

        const tenant = await registerTenantService({username, password: hashedPassword, name, profileImage: profileImageName, idCardImage: idCardImageName, resetPasswordToken: verificationToken})

        res.status(201).json({
         error: false,   
         message: 'Tenant registered successfully',
         data: {
            email: tenant.email,
            name: tenant.name,
         } 
        });
    } catch (error) {
        next(error);
    }
};


export const loginCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {emailOrUsername, password} = req.body;
        if(!emailOrUsername || !password) throw {message: 'Input cannot be blank', status: 406};

        const user = await loginCustomerService({emailOrUsername, password})

        const verifyPassword = await comparePassword(password, user!.password)
        if (!verifyPassword) throw {msg: 'False password, please try again', status: 406};

        const token = await createToken({id: user?.id, role: user?.role});
        const refreshToken = await createRefreshToken({id: user?.id, role: user?.role});

        res.cookie('refreshToken', refreshToken ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 Day
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        })

        res.status(200).json({
            error: false,
            message: 'Successfully logged in',
            data: {
                token,
                email: user!.email,
                role: user!.role,
                name: user!.name,
                profilePicture: user!.profileImage,
                isVerified: user!.isVerified
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
        if (!verifyPassword) throw {msg: 'False password, please try again', status: 406};

        const token = await createToken({id: user?.id, role: user?.role})
        const refreshToken = await createRefreshToken({id: user?.id, role: user?.role});

        res.cookie('refreshToken', refreshToken ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'strict'
        })

        res.status(200).json({
            error: false,
            message: 'Successfully logged in',
            data: {
                token,
                email: user?.email,
                role: user?.role,
                name: user?.name,
                profilePicture: user?.profileImage
            }
        })
    } catch (error) {
        next (error);
    }
}

export const loginWithSocialMedia = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, profileImage} = req.body;

        const findUser = await prisma.customer.findUnique({
            where: {email: email}
        });

        const hashedPassword = await hashPassword("userwithsocialmedia123");

        const userName = generateUsername(name);

        let dataUser;

        if (!findUser) {
            dataUser = await prisma.customer.create({
                data: {
                    email: email,
                    name: name,
                    profileImage: profileImage,
                    isGoogle: true,
                    password: hashedPassword,
                    username: userName
                }
            })
        }
        
        const token = createToken({id: dataUser!.id, role: dataUser!.role});

        res.status(200).json({
            error: false,
            message: 'Successfully logged in',
            data: {
                token,
                email: findUser?.email,
                role: findUser?.role,
                name: findUser?.name,
                profilePicture: findUser?.profileImage
            }
        })
    } catch (error) {
        next (error)
    }
}

export const keepLogin = async(req: Request, res: Response, next: NextFunction) => {
    try {
    const {usersId, authorizationRole} = req.body

    const user = await keepLoginService({usersId, authorizationRole})

    res.status(200).json({
        error: false,
        message: 'account is logged in',
        data: {
            name: user?.name,
            email: user?.email,
            role: user?.role,
            isVerified: "isVerified" in user! ? user.isVerified : null,
            profileImage: user?.profileImage,
            username: user?.username
        }
    })
    } catch (error) {
        next(error)
    }
}

export const requestResetPassword = async(req: Request, res: Response, next: NextFunction) => {
   try {
    const {email} = req.body

    await requestResetPasswordService({email})

    res.status(200).json({
        error: false,
        message: 'A verification email has been sent, please check your email',
        data: {}
    })    
   } catch (error) {
       next(error)
   }
}

export const resetPassword = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        const { password } = req.body;

        const token = authorization?.split(' ')[1]
        const hashedPassword = await hashPassword(password)

        await resetPasswordService({resetPasswordToken: token, password: hashedPassword})

        res.status(200).json({
            error: false,
            message: 'Password updated',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const changeCustomerPassword = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, password, newPassword} = req.body

        await changeCustomerPasswordService({usersId, password, newPassword})

        res.status(200).json({
            error: false,
            message: 'Password successfully changed',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const changeTenantPassword = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, password, newPassword} = req.body

        await changeTenantPasswordService({usersId, password, newPassword})

        res.status(200).json({
            error: false,
            message: 'Password successfully changed',
            data: {}
        })
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error: true,
                msg: error.msg,
                data: {}
            });
        }
        next(error)
    }
}

export const requestChangeEmail = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole, newEmail} = req.body

        await requestChangeEmailService({usersId, authorizationRole, newEmail})

        res.status(200).json({
            error: false,
            message: `Email verification sended to ${newEmail}, please check your inbox`,
            data: {}
        })
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error: true,
                msg: error.msg,
                data: {}
            });
        }
        next(error)
    }
}

export const changeEmail = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { usersId, authorizationRole } = req.body;
        
        const tokenWithBearer = req.headers['newemailtoken'];
    
        if (!tokenWithBearer) throw { msg: 'Token not provided', status: 400 };
        
    
        const tokenString = Array.isArray(tokenWithBearer) ? tokenWithBearer.join(' ') : tokenWithBearer;
    
        const tokenParts = tokenString.split(' '); 
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') throw { msg: 'Invalid token format', status: 406 };
        
        const token = tokenParts[1]; 
    
        if (!token || token === '') throw { msg: 'Invalid token, please try again', status: 406 };
        
    
        await changeEmailService({ usersId, authorizationRole, token });

        res.status(200).json({
            error: false,
            message: 'Email successfully updated',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const requestVerifyCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId} = req.body

        await requestVerifyCustomerService({usersId})
    
        res.status(200).json({
            error: false,
            message: 'A verification link sended, please check your email',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const refreshToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken: string = req.cookies.refreshToken;

        console.log(refreshToken);

        if (!refreshToken) throw {msg: 'Session expired', status: 406};

        const decoded: any = await decodeRefreshToken(refreshToken);
        
        const {id, role} = decoded.data

        const user = await (prisma.customer.findUnique({
            where: {
                id: id,
                role: role
            }
        }))||(prisma.tenant.findUnique({
            where: {
                id: id,
                role: role
            }
        }))

        if(!user) throw {msg: 'Invalid credentials', status: 404};

        const newToken = await createToken({id, role})

        res.status(200).json({
            error: false,
            message: 'Token refreshed',
            data: {token: newToken}
        })
    } catch (error) {
        next(error)
    }
}

export const verifyCustomer = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId} = req.body

        const customToken = Array.isArray(req.headers['x-verify-token']) ? req.headers['x-verify-token'][0] : req.headers['x-verify-token']; 

        if (!customToken || customToken === '') throw {message: 'Invalid token', status: 406}

        await verifyCustomerService({usersId, customToken})

        res.status(200).json({
            error: false,
            message: 'Account verification succeeded',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}