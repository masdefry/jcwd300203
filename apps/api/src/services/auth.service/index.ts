import { prisma } from "@/connection";
import { ChangeEmailTokenPayload, IChangePassword, ILogin, IRegisterCustomer, IRegisterTenant } from "./types";
import fs from 'fs';
import { compile } from "handlebars";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { transporter } from "@/utils/transporter";
import { addHours, addMinutes, isBefore } from 'date-fns';
import { comparePassword, hashPassword } from "@/utils/hash.password";
import { createToken } from "@/utils/jwt";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "@/utils/jwt";

export const verifyEmailCustomerService = async({email}: {email: string}) => {
    const findUser = await prisma.customer.findUnique({
        where: {
            email: email
        }
    })
    
    if(findUser) {
        if(findUser.email && findUser.password !== '' && findUser.name !== '' && findUser.username !== ''){
            throw {msg: 'User already existed, please register with another email', status: 406}
        }
        try {
            jwt.verify(findUser.resetPasswordToken || '', ACCESS_TOKEN_SECRET);
            throw { msg: 'A verification link has already been sent. Please check your email.', status: 400 };
          } catch (error) {
            await prisma.customer.delete({
              where: { email },
            });
          }
    }
    
    const verifyEmailToken = jwt.sign({data: {email: email} }, ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    const token = await prisma.customer.create({
        data: {
            email: email,
            username: '',
            password: '',
            name: '',
            resetPasswordToken: verifyEmailToken,
            tokenExpiry: expirationTime
        }
    })

    const url = `http://localhost:3000/register/user/${token.resetPasswordToken}`
    const emailTemplate = fs.readFileSync('./src/public/registration.html', 'utf-8');
    const compiledEmailBody = await compile(emailTemplate)
    const personalizedEmailBody = compiledEmailBody({
        name: email,
        url: url
    })

    await transporter.sendMail({
        to: email,
        subject: 'Complete your RentUp account registration',
        html: personalizedEmailBody
    })
}

export const verifyEmailTenantService = async({email}: {email: string}) => {
    const findUser = await prisma.tenant.findUnique({
        where: {
            email: email
        }
    })

    if(findUser) {
        if(findUser.email && findUser.password !== '' && findUser.name !== '' && findUser.username !== ''){
            throw {msg: 'User already existed, please register with another email', status: 406}
        }
        try {
            jwt.verify(findUser.resetPasswordToken || '', ACCESS_TOKEN_SECRET);
            throw { msg: 'A verification link has already been sent. Please check your email.', status: 400 };
          } catch (error) {
            await prisma.tenant.delete({
              where: { email },
            });
          }
    }
    
    const verifyEmailToken = jwt.sign({data: {email: email} }, ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    const token = await prisma.tenant.create({
        data: {
            email: email,
            username: '',
            password: '',
            name: '',
            profileImage: '',
            IdCardImage: '',
            resetPasswordToken: verifyEmailToken,
            tokenExpiry: expirationTime
        }
    })

    const url = `http://localhost:3000/register/tenant/${token.resetPasswordToken}`
    const emailTemplate = fs.readFileSync('./src/public/registration.html', 'utf-8');
    const compiledEmailBody = await compile(emailTemplate)
    const personalizedEmailBody = compiledEmailBody({
        name: email,
        url: url
    })

    await transporter.sendMail({
        to: email,
        subject: 'Complete your RentUp account registration',
        html: personalizedEmailBody
    })

}

export const registerCustomerService = async({resetPasswordToken, username, password, name}: IRegisterCustomer) => {
    return await prisma.customer.update({
        where:{
            resetPasswordToken: resetPasswordToken
        },
        data: {
            username: username,
            password: password,
            name: name,
            resetPasswordToken: null
        }
    })
}

export const registerTenantService = async({username, password, name, profileImage, idCardImage, resetPasswordToken}: IRegisterTenant) => {
    return await prisma.tenant.update({
        where: { resetPasswordToken: resetPasswordToken },  
        data: {
            username: username,
            password: password,
            name: name,
            profileImage: profileImage, 
            IdCardImage: idCardImage,
            resetPasswordToken: null
        }
    });
}

export const loginCustomerService = async({emailOrUsername}: ILogin) => {
    const where: { email?: string; username?: string } = {};

    if (emailOrUsername.includes('@')) {
        where.email = emailOrUsername; 
    } else {
        where.username = emailOrUsername; 
    }

    const user = await prisma.customer.findUnique({
        where: where as any
    });

    if(!user) throw {msg: 'Wrong email or username', status: 404};

    return user;
}

export const loginTenantService = async({emailOrUsername}: ILogin) => {
    const where: { email?: string; username?: string } = {};

    if (emailOrUsername.includes('@')) {
        where.email = emailOrUsername; 
    } else {
        where.username = emailOrUsername; 
    }

    const user = await prisma.tenant.findUnique({
        where: where as any
    });

    if(!user) throw {msg: 'User not found', status: 404};

    return user;
}

export const keepLoginService = async({usersId, authorizationRole}: {usersId: number, authorizationRole: string}) => {
    const findCustomer =await prisma.customer.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    })

    if(findCustomer) return findCustomer

    const findTenant = await prisma.tenant.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    })

    if(!findTenant) throw {msg: 'user not found', status: 406}

    if(findTenant) return findTenant
}

export const requestResetPasswordService = async({email}: {email: string}) => {
    const customer = await prisma.customer.findUnique({
        where: {email},
        select: {
            id: true, role: true, email: true, name: true, resetPasswordToken: true, tokenExpiry: true
        }
    })

    const tenant = await prisma.tenant.findUnique({
        where: {email},
        select: {
            id: true, role: true, email: true, name: true, resetPasswordToken: true, tokenExpiry: true
        }
    })

    const user = customer || tenant

    if(!user) throw {msg: 'Invalid email, please try with a valid email', status: 404}

    let resetPasswordToken = user.resetPasswordToken
    let tokenExpiry = user.tokenExpiry

    const currentTime = new Date ()

    if (!resetPasswordToken && !tokenExpiry) {
        resetPasswordToken = jwt.sign({ data: { email } }, ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        tokenExpiry = addMinutes(currentTime, 5);

        if (user === customer) {
            await prisma.customer.update({
                where: { email },
                data: {
                    resetPasswordToken,
                    tokenExpiry,
                },
            });
        } else if (user === tenant) {
            await prisma.tenant.update({
                where: { email },
                data: {
                    resetPasswordToken,
                    tokenExpiry,
                },
            });
        }
    }

    const resetUrl = `http://localhost:3000/forget-password/${resetPasswordToken}`;
    const emailTemplate = fs.readFileSync('./src/public/reset-password.html', 'utf-8');
    const compiledTemplate = await compile(emailTemplate);
    const personalizedEmailBody = compiledTemplate({
        name: user.name,
        email: user.email,
        url: resetUrl,
    });

    await transporter.sendMail({
        to: user.email,
        subject: 'Reset Your Password',
        html: personalizedEmailBody,
    });
}

export const resetPasswordService = async({resetPasswordToken, password}: {resetPasswordToken: string | undefined, password: string}) => {
    const currentTime = new Date();

    const customer = await prisma.customer.findUnique({
        where: {
            resetPasswordToken: resetPasswordToken, tokenExpiry: {gt: currentTime}
        }
    })
    
    const tenant = await prisma.tenant.findUnique({
        where: {resetPasswordToken: resetPasswordToken, tokenExpiry: {gt: currentTime}}
    })

    const user = customer || tenant

    if(!user) throw {msg: 'Invalid or expired link, please request a new one', status: 406}

    if(user == customer){
        await prisma.customer.update({
            where: {
                id: user.id
            },
            data: {
                password: password,
                resetPasswordToken: null,
                tokenExpiry: null
            }
        })
    }else if(user == tenant){
        await prisma.tenant.update({
            where: {
                id: user.id
            },
            data: {
                password: password,
                resetPasswordToken: null,
                tokenExpiry: null
            }
        })
    }
}

export const changeCustomerPasswordService = async({usersId, password, newPassword}:IChangePassword) => {
    const user = await prisma.customer.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {msg: 'Something went wrong', status: 406}

    const isComparePassword = await comparePassword(password, user!.password)
    if(!isComparePassword) throw {msg: 'False password, please try again', status: 406};

    const hashedPassword = await hashPassword(newPassword)

    await prisma.customer.update({
        where: {
            id: usersId
        },
        data: {
            password: hashedPassword
        }
    })
}

export const changeTenantPasswordService = async({usersId, password, newPassword}:IChangePassword) => {
    const user = await prisma.tenant.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {msg: 'Something went wrong', status: 406}

    const isComparePassword = await comparePassword(password, user!.password)
    if(!isComparePassword) throw {msg: 'False password, please try again', status: 406};

    const hashedPassword = await hashPassword(newPassword)

    await prisma.tenant.update({
        where: {
            id: usersId
        },
        data: {
            password: hashedPassword
        }
    })
}

export const requestChangeEmailService = async({usersId, authorizationRole, newEmail}: {usersId: number, authorizationRole: string, newEmail: string}) => {
    const user = (await prisma.customer.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    })) || (await prisma.tenant.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    }))

    if(!user) throw {msg: 'Session expired', status: 404}

    const newEmailExists = (await prisma.customer.findUnique({
        where: {
            email: newEmail
        }
    })) || (await prisma.tenant.findUnique({
        where: {
            email: newEmail
        }
    }))

    if(newEmailExists) throw {msg: 'Email is already used, please use another email', status: 400}

    const changeEmailToken = jwt.sign({
        data: {
            newEmail
        }}, ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);   
    
    if (authorizationRole === 'customer'){
        await prisma.customer.update({
            where: {
                id: usersId
            },
            data: {
                resetPasswordToken:changeEmailToken,
                tokenExpiry: expirationTime
            }
        })
    } else if (authorizationRole === 'tenant'){
        await prisma.tenant.update({
            where: {
                id: usersId
            },
            data: {
                resetPasswordToken: changeEmailToken,
                tokenExpiry: expirationTime
            }
        })
    }  
    
    const emailTemplate = fs.readFileSync(
        './src/public/change-email.html',
        'utf-8'
      ); 
      const compiledEmailBody = await compile(emailTemplate);
      const personalizedEmailBody = compiledEmailBody({
        name: user.name || 'User',
        newEmail: newEmail,
        url: `http://localhost:3000/change-email/${changeEmailToken}`, 
      });
    
      await transporter.sendMail({
        to: newEmail,
        subject: 'Verify Your New Email',
        html: personalizedEmailBody,
      });
    
}

export const changeEmailService = async({usersId, authorizationRole, token}: {usersId: number; authorizationRole: string; token: string;}) => {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as ChangeEmailTokenPayload;
    if (!decoded || !decoded?.data?.newEmail) throw { msg: 'Token expired or invalid', status: 406};

    const {newEmail} = decoded?.data

    const newEmailExists = (await prisma.customer.findUnique({
        where: {
            email: newEmail,
            role: authorizationRole,
        }
    }))||
    (await prisma.tenant.findUnique({
        where: {
            email: newEmail,
            role: authorizationRole
        }
    }))

    if(newEmailExists) throw {msg: 'Email is already in use', status: 406}

    const updateEmail = (await prisma.customer.update({
        where: {
            id: usersId,
            role: authorizationRole
        },
        data: {
            email: newEmail,
            resetPasswordToken: null,
            tokenExpiry: null
        }
    }))||(await prisma.tenant.update({
        where: {
            id: usersId,
            role: authorizationRole
        },
        data: {
            email: newEmail,
            resetPasswordToken: null,
            tokenExpiry: null
        }
    }))

    if(!updateEmail) throw {msg: 'User not found or unauthorized', status: 406}
}

export const requestVerifyCustomerService = async({usersId}: {usersId: number}) => {
    const currentTime = new Date()
    const user = await prisma.customer.findUnique({
        where: {
            id: usersId
        },
        select: {
            resetPasswordToken: true,
            tokenExpiry: true,
            id: true,
            role: true,
            name: true,
            email: true
        }
    })
    if(!user) throw {msg: 'Something went wrong', status: 404}

    if (user?.resetPasswordToken && user.tokenExpiry && user.tokenExpiry > currentTime) throw {msg: `The verification email sent to ${user.email} is still valid`, status:400}; 

    const verifyAccountToken = await createToken({id: user?.id, role: user?.role})
    const expiry = addHours(currentTime, 1)
    await prisma.customer.update({
        where: {
            id: usersId
        },
        data: {
            resetPasswordToken: verifyAccountToken,
            tokenExpiry: expiry
        }
    })

    const url = `http://localhost:3000/verify-account/${verifyAccountToken}`;
        const emailTemplate = fs.readFileSync('./src/public/verify-account.html', 'utf-8');
        const compiledTemplate = await compile(emailTemplate);
        const personalizedEmailBody = compiledTemplate({
            name: user!.name,
            email: user!.email,
            url: url,
        });
    
         await transporter.sendMail({
            to: user!.email,
            subject: 'Reset Your Password',
            html: personalizedEmailBody,
        });
}

export const verifyCustomerService = async({usersId, customToken}: {usersId: number, customToken: string}) => {
    const decoded = jwt.decode(customToken) as JwtPayload
    const currentTime = new Date ()
    if(!decoded || !decoded.data || !decoded.data.id || !decoded.data.role) throw {msg: 'Invalid or expired token', status: 406}

    const user = await prisma.customer.findUnique({
        where: {
            id: usersId
        }
    })

    if (!user) throw {msg: 'User not found', status: 406}

    if(user.tokenExpiry && user.tokenExpiry < currentTime) throw {msg: 'Link invalid, please request another one', status: 406}

    await prisma.customer.update({
        where: {
            id: usersId
        },
        data: {
            isVerified: true,
            tokenExpiry: null,
            resetPasswordToken: null
        }
    })
}