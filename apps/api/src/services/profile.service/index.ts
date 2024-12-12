import { prisma } from "@/connection";
import { IEditCustomerProfile } from "./types";
import { deleteFiles } from "@/utils/delete.files";

export const getCustomerProfileService = async({usersId}: {usersId: number}) => {
    const user = await prisma.customer.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {message: 'Session expired', status: 404}

    return user
}

export const getTenantProfileService = async({usersId}: {usersId: number}) => {
    const user = await prisma.tenant.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {message: 'Session expired', status: 404}

    return user
}

export const editCustomerProfileService = async({usersId, name, username, uploadedImage}: IEditCustomerProfile) => {
    const oldProfileImage = await prisma.customer.findUnique({
        where: {
            id: usersId
        },
        select: {
            profileImage: true
        }
    })

    if(!oldProfileImage) throw {message: 'Something went wrong', status: 404}

    if (uploadedImage?.profileImage?.[0]){
        const newImage = uploadedImage.profileImage[0].filename

        if(oldProfileImage.profileImage){
            deleteFiles({
                uploadedImage: {
                    images: [{
                        path: `src/public/images/profileImage/${oldProfileImage.profileImage}`
                    }]
                }
            })
        }

        await prisma.customer.update({
            where: {
                id: usersId
            },
            data: {
                profileImage: newImage
            }
        })
    }

    if (name){
        await prisma.customer.update({
            where: {
                id: usersId
            },
            data: {
                name: name
            }
        })
    }

    if (username){
        const checkUsername = await prisma.customer.findUnique({
            where: {
                username: username
            }
        })

        if (checkUsername) throw {message: 'Username is already used, please choose another one', status: 406}

        await prisma.customer.update({
            where: {
                id: usersId
            },
            data: {
                username: username
            }
        })
    }

}

export const editTenantProfileService = async() => {
    
}
