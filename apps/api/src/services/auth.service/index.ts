import { prisma } from "@/connection";
import { Ilogin } from "./types";
import { comparePassword } from "@/utils/hash.password";

export const registerCustomerService = async() => {
    
}

export const registerTenantService = async() => {
    
}

export const loginCustomerService = async({emailOrUsername}: Ilogin) => {
    const where: { email?: string; username?: string } = {};

    // Determine if the input is an email or username
    if (emailOrUsername.includes('@')) {
        where.email = emailOrUsername; // If it's an email
    } else {
        where.username = emailOrUsername; // Otherwise, treat it as a username
    }

    // Use the constructed where object in the findUnique call
    return await prisma.customer.findFirst({
        where: where 
    });
    
}

export const loginTenantService = async({emailOrUsername}: Ilogin) => {
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