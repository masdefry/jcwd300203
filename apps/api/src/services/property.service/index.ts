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
    const propertyId = Number(id);

    const propertyDetails = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        images: true,
        facilities: true,
        reviews: {
          include: {
            customer: {
              select: { name: true, profileImage: true },
            },
          },
        },
      },
    });
  
    if (!propertyDetails) throw { msg: "Property not found", status: 404 };
  
    const roomTypes = await prisma.roomType.findMany({
      where: {
        propertyId: propertyId,
      },
      include: {
        images: true,
        facilities: true,
        flexiblePrice: true, 
        bookings: {
          where: {
            OR: [
              { checkInDate: { lte: parsedCheckOut }, checkOutDate: { gte: parsedCheckIn } },
            ],
          },
        },
      },
    });
  
    const formattedRoomTypes = roomTypes.map((room) => {
      const customPriceForDate = (date: Date) => {
        const matchingFlexiblePrice = room.flexiblePrice.find(
          (price) => new Date(price.customDate).toDateString() === date.toDateString()
        );
        return matchingFlexiblePrice ? matchingFlexiblePrice.customPrice : room.price;
      };
  
      const now = new Date();
      const next30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(now.getDate() + i);

        
        const bookedRoomsForDate = room.bookings.filter((booking) => {
          const checkInDate = new Date(booking.checkInDate);
          const checkOutDate = new Date(booking.checkOutDate);
          return (checkInDate <= date && checkOutDate >= date);
        }).reduce((total, booking) => total + booking.room_qty, 0);

        const availableRoomsForDate = room.qty - bookedRoomsForDate;

        return {
          date: date.toDateString(),
          price: customPriceForDate(date),
          availableRooms: availableRoomsForDate > 0 ? availableRoomsForDate : 0,
        };
      });
  
      return {
        id: room.id,
        name: room.name,
        quantity: room.qty,
        guestCapacity: room.guestCapacity,
        price: room.price,
        images: room.images.map((img) => ({
          id: img.id,
          url: img.url,
        })),
        facilities: room.facilities.map((facility) => ({
          id: facility.id,
          name: facility.name,
          icon: facility.icon,
        })),
        priceComparison: next30Days,  
      };
    });
  
    return {
      id: propertyDetails.id,
      name: propertyDetails.name,
      address: propertyDetails.address,
      city: propertyDetails.city,
      mainImage: propertyDetails.mainImage,
      roomCapacity: propertyDetails.roomCapacity,
      images: propertyDetails.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
      facilities: propertyDetails.facilities.map((facility) => ({
        id: facility.id,
        name: facility.name,
        icon: facility.icon,
      })),
      reviews: propertyDetails.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        customer: {
          name: review.customer.name,
          profileImage: review.customer.profileImage,
        },
      })),
      roomTypes: formattedRoomTypes,
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

export const getPropertyDetailsTenantService = async({ usersId, authorizationRole, id }: { usersId: number, authorizationRole: string, id: string }) => {
    const propertyId = Number(id);

    const tenant = await prisma.tenant.findUnique({
        where: {
            id: usersId,
            role: authorizationRole,
        }
    });

    if (!tenant) throw { msg: 'Unauthorized', status: 401 };

    const propertyDetails = await prisma.property.findUnique({
        where: {
            id: propertyId,
            tenantId: usersId,
        },
        include: {
            images: true,
            reviews: true,
            facilities: true,
        }
    });

    if (!propertyDetails) throw { msg: 'Property not found', status: 404 };

    const propertyRoom = await prisma.roomType.findMany({
        where: {
            propertyId: propertyId,
        },
        include: {
            images: true,
            facilities: true,
            flexiblePrice: true,  
        }
    });

    return {
        ...propertyDetails,
        roomTypes: propertyRoom.map((roomType) => ({
            id: roomType.id,
            quantity: roomType.qty,
            name: roomType.name,
            price: roomType.price, 
            guestCapacity: roomType.guestCapacity,
            images: roomType.images.map((img) => ({
                id: img.id,
                url: img.url,
            })),
            facilities: roomType.facilities.map((facility) => ({
                id: facility.id,
                name: facility.name,
                icon: facility.icon,
            })),
            specialPrice: roomType.flexiblePrice.map((flexiblePrice) => ({
                id: flexiblePrice.id,
                date: flexiblePrice.customDate,
                price: flexiblePrice.customPrice,
            })),
        })),
    };
};

export const deletePropertyService = async({usersId, authorizationRole, id} : {usersId: number, authorizationRole: string, id:string}) => {
  const propertyId = Number(id)

  const findTenant = await prisma.tenant.findUnique({
    where: {
      id: usersId, 
      role: authorizationRole
    }
  })

  if(!findTenant) throw {msg: 'Unauthorized', status: 401}

  const roomTypes = await prisma.roomType.findMany({
    where: {
      propertyId: propertyId,
    },
    select: {
      id: true, 
    },
  });

  const roomTypeIds = roomTypes.map((room) => room.id); 

  await prisma.$transaction(async(prisma) => {
    await prisma.booking.deleteMany({
      where:{
        propertyId: propertyId
      }
    }),
    await prisma.roomType.deleteMany({
      where: {
        propertyId: propertyId
      }
    }),
    await prisma.booking.deleteMany({
      where: {
        propertyId: propertyId
      }
    }),
    await prisma.propertyImage.deleteMany({
      where: {
        propertyId: propertyId
      }
    }),
    await prisma.roomImage.deleteMany({
      where: {
        roomId: {in: roomTypeIds}
      }
    }),
    await prisma.review.deleteMany({
      where: {
        propertyId: propertyId
      }
    }),
    await prisma.flexiblePrice.deleteMany({
      where: {
        roomTypeId: {in: roomTypeIds}
      }
    })
  })

  await prisma.property.delete({
    where:{
      id: propertyId,
      tenantId: usersId
    },
  })
}