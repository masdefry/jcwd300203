import { prisma } from "@/connection"

export const getPropertiesListService = async() => {
    return await prisma.property.findMany({
        include: {
            images: true,
            facilities: true
        }
    })
}

export const getPropertyDetailsService = async({id, parsedCheckIn, parsedCheckOut}:{id: string, parsedCheckIn: Date, parsedCheckOut: Date}) => {
    const propertyId = Number(id)

    const propertyDetails = await prisma.property.findUnique({
        where: {
            id: propertyId
        },
        include: {
            images: true,
            reviews: true,
            facilities: true
        }
    }) 

    if(!propertyDetails) throw {msg: 'Property not found', status: 404}

    const propertyRoom = await prisma.propertyRoomType.findMany({
        where: {
            propertyId: propertyId
        },
        include: {
            Room: {
                include: {
                    images: true,
                    facilities: true
                }
            }
        }
    })
    return {
        ...propertyDetails,
        roomTypes: propertyRoom.map((roomType) => ({
          id: roomType.id,
          quantity: roomType.qty,  
          name: roomType.name,
          price: roomType.price,
          rooms: roomType.Room.length > 0 ? [{
            id: roomType.Room[0].id, 
            guestCapacity: roomType.Room[0].guestCapacity,
            images: roomType.Room[0].images.map((img) => ({
              id: img.id,
              url: img.url,
            })),
            facilities: roomType.Room[0].facilities.map((facility) => ({
              id: facility.id,
              name: facility.name,
              icon: facility.icon,
            })),
          }] : [], 
        })),
    };
}

export const getPropertiesListTenantService = async({usersId, authorizationRole}:{usersId: number, authorizationRole: string}) => {
    const tenant = await prisma.tenant.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    }) 

    if(!tenant) throw {msg: 'Unauthorized', status: 401}

    const property = await prisma.property.findMany({
        where: {
            tenantId: tenant.id
        },
        include: {
            images: true,
            facilities: true
        }
    })

    return property;
}

export const getPropertyDetailsTenantService = async({usersId, authorizationRole, id}:{usersId: number, authorizationRole: string, id: string}) => {
    const propertyId = Number(id)

    const tenant = await prisma.tenant.findUnique({
        where: {
            id: usersId,
            role: authorizationRole
        }
    })

    if(!tenant) throw {msg: 'Unauthorized', status: 401}

    const propertyDetails = await prisma.property.findUnique({
        where: {
            id: propertyId,
            tenantId: usersId
        },
        include: {
            images: true,
            reviews: true,
            facilities: true
        }
    }) 

    if(!propertyDetails) throw {msg: 'Property not found', status: 404}

    const propertyRoom = await prisma.propertyRoomType.findMany({
        where: {
            propertyId: propertyId
        },
        include: {
            Room: {
                include: {
                    images: true,
                    facilities: true
                }
            }
        }
    })
    return {
        ...propertyDetails,
        roomTypes: propertyRoom.map((roomType) => ({
          id: roomType.id,
          quantity: roomType.qty,  
          name: roomType.name,
          price: roomType.price,
          rooms: roomType.Room.length > 0 ? [{
            id: roomType.Room[0].id, 
            guestCapacity: roomType.Room[0].guestCapacity,
            images: roomType.Room[0].images.map((img) => ({
              id: img.id,
              url: img.url,
            })),
            facilities: roomType.Room[0].facilities.map((facility) => ({
              id: facility.id,
              name: facility.name,
              icon: facility.icon,
            })),
          }] : [], 
        })),
    };
}