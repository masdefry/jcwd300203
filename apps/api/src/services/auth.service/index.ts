import { prisma } from "@/connection";
import { ILogin, IRegisterCustomer } from "./types";
import { comparePassword } from "@/utils/hash.password";

export const registerCustomerService = async({email, username, password, name}: IRegisterCustomer) => {
    await prisma.customer.create({
        data: {
            email: email,
            username: username,
            password: password,
            name: name,
            resetPasswordToken: null
        }
    })
}

export const registerTenantService = async() => {

}

export const loginCustomerService = async({emailOrUsername}: ILogin) => {
    const where: { email?: string; username?: string } = {};

    // Determine if the input is an email or username
    if (emailOrUsername.includes('@')) {
        where.email = emailOrUsername; 
    } else {
        where.username = emailOrUsername; 
    }

    return await prisma.customer.findFirst({
        where: where 
    });
    
}

export const loginTenantService = async({emailOrUsername}: ILogin) => {
    const where: { email?: string; username?: string } = {};

    if (emailOrUsername.includes('@')) {
        where.email = emailOrUsername; 
    } else {
        where.username = emailOrUsername; 
    }

    return await prisma.tenant.findFirst({
        where: where 
    });
}