import { prisma } from "@/connection";
import { IEditCustomerProfile, IEditTenantProfile } from "./types";
import { deleteFiles } from "@/utils/delete.files";

export const getCustomerProfileService = async({usersId}: {usersId: number}) => {
    const user = await prisma.customer.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {msg: 'Session expired', status: 404}

    return user
}

export const getTenantProfileService = async({usersId}: {usersId: number}) => {
    const user = await prisma.tenant.findUnique({
        where: {
            id: usersId
        }
    })

    if(!user) throw {msg: 'Session expired', status: 404}

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

    if (uploadedImage?.profileImage?.[0]) {
        const newImage = uploadedImage.profileImage[0].filename;

        if(oldProfileImage?.profileImage) {
            deleteFiles({
                imagesUploaded: {  
                    images: [{
                        path: `src/public/images/${oldProfileImage.profileImage}`
                    }]
                }
            });
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

        if (checkUsername && checkUsername.id !== usersId) throw {msg: 'Username is already used, please choose another one', status: 406}

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

export const editTenantProfileService = async({usersId, name, username, uploadedImage}: IEditTenantProfile) => {
    const tenant = await prisma.tenant.findUnique({
        where: {
            id: usersId
        },
        select: {
            profileImage: true,
            IdCardImage: true
        }
    })

    if(!tenant) throw {msg: 'Something went wrong', status: 404}

    const isLocalFile = (path: string) => {
        return path && path.startsWith('src/public/images/');
    };

    if (uploadedImage?.idCardImage?.[0]) {
        const newIdCard = uploadedImage.idCardImage[0].filename;

        if(tenant.IdCardImage && isLocalFile(tenant.IdCardImage)) {
            try {
                deleteFiles({
                    imagesUploaded: {
                        images: [{
                            path: `src/public/images/${tenant.IdCardImage}`
                        }]
                    }
                });
            } catch (error) {
                console.error('Error deleting ID card image:', error);
            }

        }

        await prisma.tenant.update({
            where: {
                id: usersId
            },
            data: {
                IdCardImage: newIdCard
            }
        })
    }  
   

    if (uploadedImage?.profileImage?.[0]) {
        const newProfilePicture = uploadedImage.profileImage[0].filename;

        if(tenant.profileImage && isLocalFile(tenant.profileImage)) {
            try {
                deleteFiles({
                    imagesUploaded: {
                        images: [{
                            path: `src/public/images/${tenant.profileImage}`
                        }]
                    }
                });
            } catch (error) {
                console.error('Error deleting profile image:', error);
                // Continue execution even if deletion fails
            }
        }
        await prisma.tenant.update({
            where: {
                id: usersId
            },
            data: {
                profileImage: newProfilePicture
            }
        })
    }

    if (name){
        await prisma.tenant.update({
            where: {
                id: usersId
            },
            data: {
                name: name
            }
        })
    }

    if (username){
        const checkUsername = await prisma.tenant.findUnique({
            where: {
                username: username,
            }
        })

        if (checkUsername && checkUsername.id !== usersId) throw {msg: 'Username is already used, please choose another one', status: 406}

        await prisma.tenant.update({
            where: {
                id: usersId
            },
            data: {
                username: username
            }
        })
    }
}

