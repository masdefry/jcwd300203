import { prisma } from '@/connection';
import { ICreateProperty, IGetPropertyList, IGetRoomDetailsById } from './types';

export const getPropertiesListService = async ({
  parsedCheckIn,
  parsedCheckOut,
  search,
  guest,
  sortBy,
  sortOrder,
  offset,
  pageSize,
}: IGetPropertyList) => {
  const guestCount = Number(guest);
  const currentDate = new Date();

  const properties = await prisma.property.findMany({
    include: {
      facilities: true,
      roomTypes: {
        where: {
          ...(guestCount ? { guestCapacity: { gte: guestCount } } : {}),
        },
        include: {
          bookings: {
            where: {
              ...(parsedCheckIn && parsedCheckOut
                ? {
                    AND: [
                      { checkInDate: { lt: parsedCheckOut || currentDate } },
                      { checkOutDate: { gt: parsedCheckIn || currentDate } },
                    ],
                  }
                : {}),
              status: {
                some: {
                  Status: {
                    in: [
                      'WAITING_FOR_PAYMENT',
                      'WAITING_FOR_CONFIRMATION',
                      'CONFIRMED',
                    ],
                  },
                },
              },
            },
            select: { room_qty: true },
          },
          flexiblePrice: {
            where: {
              ...(parsedCheckIn && parsedCheckOut
                ? { customDate: { gte: parsedCheckIn, lte: parsedCheckOut } }
                : { customDate: currentDate }),
            },
            select: { customPrice: true },
          },
        },
      },
    },
  });

  const formattedProperties = properties.map((property) => {
    let isAvailable = false;
    let isAlmostFullyBooked = false;
    let price: number | null = null;

    property.roomTypes.forEach((roomType) => {
      const totalBookedRooms = roomType.bookings.reduce(
        (sum: number, booking: { room_qty: number }) => sum + booking.room_qty,
        0,
      );

      const isRoomAvailable = totalBookedRooms < roomType.qty;
      const isRoomAlmostBooked = totalBookedRooms >= roomType.qty * 0.85;

      if (isRoomAvailable) isAvailable = true;
      if (isRoomAlmostBooked) isAlmostFullyBooked = true;

      const flexiblePrice = roomType.flexiblePrice[0]?.customPrice;
      const roomPrice = flexiblePrice
        ? Number(flexiblePrice.toFixed(2))
        : Number(roomType.price.toFixed(2));
      if (price === null || roomPrice < price) price = roomPrice;
    });

    const similarity = search
      ? (property.name.toLowerCase().includes(search.toLowerCase()) ? 3 : 0) +
        (property.city.toLowerCase().includes(search.toLowerCase()) ? 2 : 0) +
        (property.address.toLowerCase().includes(search.toLowerCase()) ? 1 : 0) +
        (property.category?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)
      : 0;

    return {
      id: property.id,
      name: property.name,
      category: property.category,
      address: property.address,
      city: property.city,
      mainImage: property.mainImage,
      facilities: property.facilities,
      price: price || 0,
      isAvailable,
      isAlmostFullyBooked,
      similarity,
    };
  });

  const sortedProperties = formattedProperties.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity; 
    }
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    }
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0; 
  });

 const paginatedProperties =
  pageSize && offset !== undefined
    ? sortedProperties.slice(offset, offset + pageSize)
    : sortedProperties;

  console.log('Formatted and Sorted Properties:', paginatedProperties);
  return paginatedProperties;
};

export const getPropertyDetailsService = async ({
  id,
  parsedCheckIn,
  parsedCheckOut,
}: {
  id: string;
  parsedCheckIn: Date | undefined;
  parsedCheckOut: Date | undefined;
}) => {
  const propertyId = Number(id);
  const currentDate = new Date()

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

  if (!propertyDetails) throw { msg: 'Property not found', status: 404 };

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
            {
              checkInDate: { lte: parsedCheckOut },
              checkOutDate: { gte: parsedCheckIn },
            },
          ],
        },
      },
    },
  });

  const formattedRoomTypes = roomTypes.map((room) => {
    const customPriceForDate = (date: Date) => {
      const matchingFlexiblePrice = room.flexiblePrice.find(
        (price) =>
          new Date(price.customDate).toDateString() === date.toDateString(),
      );
      return matchingFlexiblePrice
        ? matchingFlexiblePrice.customPrice
        : room.price;
    };

    const now = new Date();
    const next30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() + i);

      const bookedRoomsForDate = room.bookings
        .filter((booking) => {
          const checkInDate = new Date(booking.checkInDate);
          const checkOutDate = new Date(booking.checkOutDate);
          return checkInDate <= date && checkOutDate >= date;
        })
        .reduce((total, booking) => total + booking.room_qty, 0);

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
};

export const getPropertiesListTenantService = async ({
  usersId,
  authorizationRole,
}: {
  usersId: number;
  authorizationRole: string;
}) => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: usersId,
      role: authorizationRole,
    },
  });

  if (!tenant) throw { msg: 'Unauthorized', status: 401 };

  const property = await prisma.property.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: {not: null}
    },
    include: {
      images: true,
      facilities: true,
    },
  });

  return property;
};

export const getPropertyDetailsTenantService = async ({
  usersId,
  authorizationRole,
  id,
}: {
  usersId: number;
  authorizationRole: string;
  id: string;
}) => {
  const propertyId = Number(id);

  const tenant = await prisma.tenant.findUnique({
    where: {
      id: usersId,
      role: authorizationRole,
    },
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
    },
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
    },
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

export const deletePropertyService = async ({
  usersId,
  authorizationRole,
  id,
}: {
  usersId: number;
  authorizationRole: string;
  id: string;
}) => {
  const propertyId = Number(id);
  const currentTime = new Date()

  const findTenant = await prisma.tenant.findUnique({
    where: {
      id: usersId,
      role: authorizationRole,
    },
  });

  if (!findTenant) throw { msg: 'Unauthorized', status: 401 };

  const roomTypes = await prisma.roomType.findMany({
    where: {
      propertyId: propertyId,
    },
    select: {
      id: true,
    },
  });

  const roomTypeIds = roomTypes.map(room => room.id);

  await prisma.$transaction(async (prisma) => {
    await prisma.property.update({
      where: {
        id: propertyId,
        tenantId: usersId,
      },
      data: {
        deletedAt: currentTime,
      },
    });

    // Soft delete room types
    if (roomTypeIds.length > 0) {
      await prisma.roomType.updateMany({
        where: {
          id: { in: roomTypeIds },
        },
        data: {
          deletedAt: currentTime,
        },
      });
    }

    // Soft delete room images
    await prisma.roomImage.updateMany({
      where: {
        roomId: { in: roomTypeIds },
      },
      data: {
        deletedAt: currentTime,
      },
    });

    // Soft delete property images
    await prisma.propertyImage.updateMany({
      where: {
        propertyId: propertyId,
      },
      data: {
        deletedAt: currentTime,
      },
    });
  });
};

export const getPropertiesAndRoomFacilitiesService = async() => {
  const propertiesFacilities = await prisma.propFacility.findMany()
  const roomFacilities = await prisma.roomFacility.findMany()

  return {
    propertiesFacilities: propertiesFacilities,
    roomFacilities: roomFacilities
  }
}

export const createFacilitiesIconsService = async({name, type, iconFileName}:{name: string, type: string, iconFileName: string | undefined}) => {
  if(type === 'property'){
    await prisma.propFacility.create({
      data: {
        name: name,
        icon: iconFileName
      }
    })
  }else if(type === 'room'){
    await prisma.roomFacility.create({
      data: {
        name: name,
        icon: iconFileName
      }
    })
  }else throw {msg: 'invalid type', status: 406}
}

export const createPropertyService = async({usersId, authorizationRole, propertyData, files}: ICreateProperty) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const findTenant = await tx.tenant.findUnique({
        where: {
          id: usersId,
          role: authorizationRole
        }
      });
      
      if (!findTenant) throw { msg: 'Invalid credentials', status: 401 };

      const baseProperty = await tx.property.create({
        data: {
          name: propertyData.name,
          address: propertyData.address,
          city: propertyData.city,
          category: propertyData.category,
          description: propertyData.description,
          roomCapacity: Number(propertyData.roomCapacity),
          mainImage: files.mainImage[0].filename,
          tenantId: usersId,
        }
      });

      console.log('Created base property:', baseProperty);

      if (files.propertyImages?.length) {
        await tx.propertyImage.createMany({
          data: files.propertyImages.map(image => ({
            url: image.filename,
            propertyId: baseProperty.id
          }))
        });
      }

      if (propertyData.facilityIds.length) {
        await tx.property.update({
          where: { id: baseProperty.id },
          data: {
            facilities: {
              connect: propertyData.facilityIds.map(id => ({ id }))
            }
          }
        });
      }

      for (const [index, roomType] of propertyData.roomTypes.entries()) {
        const newRoomType = await tx.roomType.create({
          data: {
            name: roomType.name,
            price: parseFloat(roomType.price.toString()),
            description: roomType.description,
            qty: parseInt(roomType.qty.toString()),
            guestCapacity: parseInt(roomType.guestCapacity.toString()),
            propertyId: baseProperty.id
          }
        });

        if (files[`roomTypeImages${index}`]?.length) {
          await tx.roomImage.createMany({
            data: files[`roomTypeImages${index}`].map(image => ({
              url: image.filename,
              roomId: newRoomType.id
            }))
          });
        }

        if (roomType.facilities.length) {
          await tx.roomType.update({
            where: { id: newRoomType.id },
            data: {
              facilities: {
                connect: roomType.facilities.map(id => ({ id }))
              }
            }
          });
        }
      }

      const completeProperty = await tx.property.findUnique({
        where: { id: baseProperty.id },
        include: {
          images: true,
          facilities: true,
          roomTypes: {
            include: {
              images: true,
              facilities: true
            }
          }
        }
      });

      return completeProperty;
    });
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

export const getRoomDetailsByIdService = async ({
  roomId,
  parsedCheckIn,
  parsedCheckOut,
}: IGetRoomDetailsById) => {
  const roomIdNumber = Number(roomId);

  // Validate roomId
  if (!roomIdNumber) throw { msg: "Invalid room ID", status: 400 };

  // Fetch room details from database
  const roomDetails = await prisma.roomType.findUnique({
    where: { id: roomIdNumber },
    include: {
      facilities: true,
      images: true,
      flexiblePrice: true,
      bookings: {
        where: {
          OR: [
            {
              checkInDate: { lte: parsedCheckOut },
              checkOutDate: { gte: parsedCheckIn },
            },
          ],
        },
        select: {
          room_qty: true,
          checkInDate: true,
          checkOutDate: true,
        },
      },
    },
  });

  if (!roomDetails) throw { msg: "Room not found", status: 404 };

  // Calculate availability for the next 30 days
  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // Calculate total booked rooms for the specific date
    const bookedRooms = roomDetails.bookings
      .filter((booking) => {
        const bookingCheckIn = new Date(booking.checkInDate);
        const bookingCheckOut = new Date(booking.checkOutDate);
        return bookingCheckIn <= date && bookingCheckOut >= date;
      })
      .reduce((total, booking) => total + booking.room_qty, 0);

    // Calculate available rooms
    const availableRooms = Math.max(roomDetails.qty - bookedRooms, 0);

    // Check for flexible pricing on this date
    const flexiblePrice = roomDetails.flexiblePrice.find(
      (price) => new Date(price.customDate).toDateString() === date.toDateString()
    )?.customPrice;

    return {
      date: date.toDateString(),
      price: flexiblePrice || roomDetails.price,
      availableRooms,
    };
  });

  // Return formatted room details
  return {
    id: roomDetails.id,
    name: roomDetails.name,
    description: roomDetails.description,
    price: roomDetails.price,
    guestCapacity: roomDetails.guestCapacity,
    images: roomDetails.images.map((img) => ({
      id: img.id,
      url: img.url,
    })),
    facilities: roomDetails.facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      icon: facility.icon,
    })),
    priceComparison: next30Days,
  };
};

export const getPropertyIdByRoomIdService = async (roomId: string) => {
  try {
    const room = await prisma.roomType.findUnique({
      where: { id: Number(roomId) },
      select: { propertyId: true },
    });
    return room?.propertyId || null;
  } catch (error) {
    console.error("Error fetching propertyId by roomId:", error);
    throw new Error("Unable to fetch propertyId for the given roomId.");
  }
};