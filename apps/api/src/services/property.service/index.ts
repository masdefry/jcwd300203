import { prisma } from '@/connection';
import { ICreateProperty, IEditProperty, IGetPropertyList, IGetRoomDetailsById, IBaseImage, IBaseFacility, IPropertyListResponse, ILocationConditions, IPropertyFromDB, IPropertyDetailsResponse, IFormattedRoomType, IReview, IPriceAvailability, IRoomTypeFromDB, ITenantPropertyListResponse, IPropertyDetailsTenantResponse, IRoomDetailsResponse, IRoomDetailsFromDB, IDailyAvailability, IRoomUnavailabilityFromDB, IRoomBookingFromDB, IPrismaTransaction, IRoomTypeDetail, IRoomTypeResponse, ITenantRoomTypeResponse, IRoomWithImages } from './types';
import { deleteFiles } from '@/utils/delete.files';
import { calculateDistance } from '@/utils/calculate.distance';
import { Decimal } from '@prisma/client/runtime/library';


export const getPropertiesListService = async ({parsedCheckIn, parsedCheckOut, search, guest, sortBy, sortOrder, offset, pageSize, priceMin, priceMax, categories, facilities, minRating, latitude, longitude, radius}: IGetPropertyList):Promise<IPropertyListResponse[]> => {
  const guestCount = Number(guest);
  const currentDate = new Date();

  const parsedLat = latitude ? parseFloat(latitude) : undefined;
  const parsedLng = longitude ? parseFloat(longitude) : undefined;
  const parsedRadius = radius ? parseFloat(radius) : undefined;

  const locationConditions: ILocationConditions = {};
  if (parsedLat && parsedLng && parsedRadius) {
    locationConditions['AND'] = [
      {
        latitude: {
          gte: String(parsedLat - parsedRadius / 111.32),
          lte: String(parsedLat + parsedRadius / 111.32)
        }
      },
      {
        longitude: {
          gte: String(parsedLng - parsedRadius / (111.32 * Math.cos(parsedLat * Math.PI / 180))),
          lte: String(parsedLng + parsedRadius / (111.32 * Math.cos(parsedLat * Math.PI / 180)))
        }
      }
    ];
  }


  const properties = await prisma.property.findMany({
    where: {
      ...locationConditions,
      deletedAt: null,
      // Add category filter
      ...(categories?.length ? {
        categoryId: {
          in: categories
        }
      } : {}),
      ...(facilities?.length ? {
        facilities: {
          some: {
            id: {
              in: facilities
            }
          }
        }
      } : {}),
      // Add rating filter
      ...(minRating ? {
        reviews: {
          some: {
            rating: {
              gte: minRating
            }
          }
        }
      } : {})
    },
    include: {
      category: true,
      reviews: {
        select: {
          rating: true
        }
      },
      facilities: true,
      roomTypes: {
        where: {
          ...(guestCount ? { guestCapacity: { gte: guestCount } } : {}),
          // Check room availability
          AND: [
            // Check bookings
            {
              bookings: {
                none: {
                  AND: [
                    { checkInDate: { lt: parsedCheckOut || currentDate } },
                    { checkOutDate: { gt: parsedCheckIn || currentDate } },
                    {
                      status: {
                        some: {
                          Status: {
                            in: ['WAITING_FOR_CONFIRMATION', 'CONFIRMED']
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            // Check room unavailability
            {
              unavailability: {
                none: {
                  AND: [
                    { startDate: { lt: parsedCheckOut || currentDate } },
                    { endDate: { gt: parsedCheckIn || currentDate } }
                  ]
                }
              }
            }
          ],
        },
        include: {
          flexiblePrice: {
            where: {
              AND: [
                { startDate: { lte: parsedCheckOut || currentDate } },
                { endDate: { gte: parsedCheckIn || currentDate } }
              ]
            },
            select: { customPrice: true }
          }
        }
      }
    }
  });

  const formattedProperties = properties.map((property: IPropertyFromDB) => {
    let isAvailable = false;
    let price: number | null = null;

    property.roomTypes.forEach((roomType) => {
      // Check room availability
      if (roomType.qty > 0) isAvailable = true;

      // Get price (either flexible or base)
      const flexiblePrice = roomType.flexiblePrice[0]?.customPrice;
      const roomPrice = flexiblePrice
        ? Number(flexiblePrice.toFixed(2))
        : Number(roomType.price.toFixed(2));
      
      if (price === null || roomPrice < price) price = roomPrice;
    });

    let locationScore = 0;
    if (parsedLat && parsedLng && property.latitude && property.longitude) {
      const propertyLat = parseFloat(property.latitude);
      const propertyLng = parseFloat(property.longitude);
      
      if (!isNaN(propertyLat) && !isNaN(propertyLng)) {
        const distance = calculateDistance(
          parsedLat,
          parsedLng,
          propertyLat,
          propertyLng
        );
        locationScore = Math.max(0, 5 - distance / 1000);
      }
    }

    // Calculate average rating
    const averageRating = property.reviews.length > 0
      ? parseFloat((property.reviews.reduce((sum: number, review: {rating: number}) => sum + review.rating, 0) / property.reviews.length).toFixed(1))
      : 0;

    const similarity = search
      ? (property.name.toLowerCase().includes(search.toLowerCase()) ? 3 : 0) +
        (property.city.toLowerCase().includes(search.toLowerCase()) ? 2 : 0) +
        (property.address.toLowerCase().includes(search.toLowerCase()) ? 1 : 0) +
        (property.category?.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)
      : 0;

    return {
      id: property.id,
      name: property.name,
      category: property.category?.name || null,
      categoryIcon: property.category?.icon || null,
      address: property.address,
      city: property.city,
      mainImage: property.mainImage,
      facilities: property.facilities,
      price: price || 0,
      averageRating,
      totalReviews: property.reviews.length,
      isAvailable,
      similarity,
    };
  });

  // Filter by price range if specified
  let filteredProperties = formattedProperties;
  if (priceMin !== undefined || priceMax !== undefined) {
    filteredProperties = filteredProperties.filter((prop: IPropertyListResponse)=> 
      (priceMin === undefined || prop.price >= priceMin) &&
      (priceMax === undefined || prop.price <= priceMax)
    );
  }

  // Sort properties
  const sortedProperties = filteredProperties.sort((a: IPropertyListResponse, b: IPropertyListResponse) => {
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
    if (sortBy === 'rating') {
      return sortOrder === 'asc' 
        ? a.averageRating - b.averageRating 
        : b.averageRating - a.averageRating;
    }
    return 0;
  });

  const paginatedProperties =
    pageSize && offset !== undefined
      ? sortedProperties.slice(offset, offset + pageSize)
      : sortedProperties;

  return paginatedProperties;
};

export const getPropertyDetailsService = async ({
  id,
  parsedCheckIn,
  parsedCheckOut,
  guestCount
}: {
  id: string;
  parsedCheckIn: Date | undefined;
  parsedCheckOut: Date | undefined;
  guestCount?: number
}):Promise<IPropertyDetailsResponse> => {
  const propertyId = Number(id);
    const currentDate = new Date();

    const propertyDetails = await prisma.property.findUnique({
        where: {
            id: propertyId,
            deletedAt: null
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
            flexiblePrice: {
                where: {
                    AND: [
                        { startDate: { lte: parsedCheckOut } },
                        { endDate: { gte: parsedCheckIn } }
                    ]
                }
            },
            unavailability: {
                where: {
                    AND: [
                        { startDate: { lte: parsedCheckOut } },
                        { endDate: { gte: parsedCheckIn } }
                    ]
                }
            },
            bookings: {
                where: {
                    AND: [
                        { checkInDate: { lte: parsedCheckOut } },
                        { checkOutDate: { gte: parsedCheckIn } },
                        {
                            status: {
                                some: {
                                    Status: {
                                        in: ['WAITING_FOR_CONFIRMATION', 'CONFIRMED']
                                    }
                                }
                            }
                        }
                    ]
                },
                select: {
                    checkInDate: true,
                    checkOutDate: true,
                    room_qty: true
                }
            },
        },
    });

    const formattedRoomTypes: IFormattedRoomType[] = roomTypes.map((room: IRoomTypeFromDB) => {
        const getPriceForDate = (date: Date) => {
            const flexiblePrice = room.flexiblePrice.find(price => 
                date >= price.startDate && date <= price.endDate
            );
            return flexiblePrice 
                ? flexiblePrice.customPrice
                : room.price
        };

        const isRoomAvailableForDate = (date: Date) => {
            const isUnavailable = room.unavailability.some(unavailable => 
                date >= unavailable.startDate && date <= unavailable.endDate
            );
            if (isUnavailable) return 0;

            const bookedRooms = room.bookings
                .filter(booking => {
                    const checkIn = new Date(booking.checkInDate);
                    const checkOut = new Date(booking.checkOutDate);
                    return date >= checkIn && date <= checkOut;
                })
                .reduce((total, booking) => total + booking.room_qty, 0);

            return Math.max(0, room.qty - bookedRooms);
        };

        const now = new Date();
        const next30Days: IPriceAvailability[] = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(now.getDate() + i);
            return {
                date: date.toDateString(),
                price: getPriceForDate(date),
                availableRooms: isRoomAvailableForDate(date)
            };
        });

        return {
            id: room.id,
            name: room.name,
            quantity: room.qty,
            description: room.description,
            guestCapacity: room.guestCapacity,
            basePrice: room.price,
            currentPrice: getPriceForDate(parsedCheckIn || now),
            images: room.images.map((img: IBaseImage) => ({
                id: img.id,
                url: img.url,
            })),
            facilities: room.facilities.map((facility: IBaseFacility) => ({
                id: facility.id,
                name: facility.name,
                icon: facility.icon,
            })),
            availability: {
                checkIn: parsedCheckIn,
                checkOut: parsedCheckOut,
                availableRooms: isRoomAvailableForDate(parsedCheckIn || now),
                isAvailable: isRoomAvailableForDate(parsedCheckIn || now) > 0
            },
            priceComparison: next30Days,
        };
    });

    const averageRating = propertyDetails.reviews.length > 0
        ? (propertyDetails.reviews.reduce((sum: number, review: {rating: number}) => sum + review.rating, 0) / propertyDetails.reviews.length)
        : 0;

        return {
          id: propertyDetails.id,
          name: propertyDetails.name,
          latitude: propertyDetails.latitude,
          longitude: propertyDetails.longitude,
          address: propertyDetails.address,
          city: propertyDetails.city,
          description: propertyDetails.description,
          mainImage: propertyDetails.mainImage,
          roomCapacity: propertyDetails.roomCapacity,
          averageRating: propertyDetails.reviews.length > 0 
              ? Number((propertyDetails.reviews.reduce((sum: number, review: {rating: number}) => sum + review.rating, 0) / propertyDetails.reviews.length).toFixed(1))
              : 0,
          totalReviews: propertyDetails.reviews.length,
          images: propertyDetails.images
              .filter((img: IBaseImage) => !img.deletedAt)  
              .map((img: IBaseImage) => ({
                  id: img.id,
                  url: img.url,
              })),
          facilities: propertyDetails.facilities.map((facility: IBaseFacility) => ({
              id: facility.id,
              name: facility.name,
              icon: facility?.icon || null,
          })),
          reviews: propertyDetails.reviews.map((review: IReview) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              reply: review.reply || null,
              createdAt: review.createdAt,
              customer: review.customer && {
                  name: review.customer.name,
                  profileImage: review.customer.profileImage || null,
              },
          })),
          roomTypes: formattedRoomTypes.map(room => ({
            id: room.id,
            name: room.name,
            quantity: room.quantity,
            description: room.description,
            guestCapacity: room.guestCapacity,
            basePrice: Number(room.basePrice.toString()),  // Convert Decimal to number
            currentPrice: Number(room.currentPrice.toString()),  // Convert Decimal to number
            images: room.images,
            facilities: room.facilities,
            availability: room.availability,
            priceComparison: room.priceComparison.map(pc => ({
                date: pc.date,
                price: Number(pc.price.toString()),  // Convert Decimal to number
                availableRooms: pc.availableRooms
            }))
        })),
      };
};

export const getPropertiesListTenantService = async ({
  usersId,
  authorizationRole,
}: {
  usersId: number;
  authorizationRole: string;
}): Promise<ITenantPropertyListResponse[]> => {
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
      deletedAt: null
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
}):Promise<IPropertyDetailsTenantResponse> => {
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
      deletedAt: null
    },
    include: {
      images: {
        where: {
          deletedAt: null
        }
      },
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              profileImage: true
            }
          }
        }
      },
      facilities: true,
      category: true
    },
  });

  if (!propertyDetails) throw { msg: 'Property not found', status: 404 };

  const propertyRoom = await prisma.roomType.findMany({
    where: {
      propertyId: propertyId,
      deletedAt: null
    },
    include: {
      images: {
        where: {
          deletedAt: null
        }
      },
      facilities: true,
      flexiblePrice: {
        orderBy: {
          startDate: 'asc'
        }
      },
      unavailability: {
        orderBy: {
          startDate: 'asc'
        }
      },
      bookings: {
        where: {
          status: {
            some: {
              Status: {
                in: ['WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'CONFIRMED']
              }
            }
          }
        },
        select: {
          checkInDate: true,
          checkOutDate: true,
          room_qty: true,
          status: true
        },
        orderBy: {
          checkInDate: 'asc'
        }
      }
    },
  });

  const averageRating = propertyDetails.reviews.length > 0
    ? Number((propertyDetails.reviews.reduce((sum: number, review: {rating: number}) => sum + review.rating, 0) / propertyDetails.reviews.length).toFixed(1))
    : 0;

  return {
    id: propertyDetails.id,
    name: propertyDetails.name,
    description: propertyDetails.description,
    address: propertyDetails.address,
    latitude: propertyDetails.latitude,
    longitude: propertyDetails.longitude,
    city: propertyDetails.city,
    mainImage: propertyDetails.mainImage,
    roomCapacity: propertyDetails.roomCapacity,
    category: propertyDetails.category ? {
      id: propertyDetails.category.id,
      name: propertyDetails.category.name,
      icon: propertyDetails.category.icon
    } : null,
    averageRating,
    totalReviews: propertyDetails.reviews.length,
    images: propertyDetails.images.map((img: IBaseImage) => ({
      id: img.id,
      url: img.url,
    })),
    facilities: propertyDetails.facilities.map((facility: IBaseFacility) => ({
      id: facility.id,
      name: facility.name,
      icon: facility.icon || null,
    })),
    reviews: propertyDetails.reviews.map((review: IReview) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reply: review.reply || null,
      createdAt: review.createdAt,
      customer: {
        name: review.customer.name,
        profileImage: review.customer.profileImage || null,
      },
    })),
    roomTypes: propertyRoom.map((roomType: IRoomTypeDetail): ITenantRoomTypeResponse => ({
      id: roomType.id,
      name: roomType.name,
      quantity: roomType.qty,
      description: roomType.description,
      price: Number(roomType.price.toString()),
      guestCapacity: roomType.guestCapacity,
      images: roomType.images.map((img: IBaseImage) => ({
        id: img.id,
        url: img.url,
      })),
      facilities: roomType.facilities.map((facility: IBaseFacility) => ({
        id: facility.id,
        name: facility.name,
        icon: facility.icon || null,
      })),
      flexiblePrices: roomType.flexiblePrice.map((price: {id: number, startDate: Date, endDate: Date, customPrice: Decimal}) => ({
        id: price.id,
        startDate: price.startDate,
        endDate: price.endDate,
        price: Number(price.customPrice.toString())
      })),
      unavailableDates: roomType.unavailability.map((unavailable: IRoomUnavailabilityFromDB) => ({
        id: unavailable.id,         
        startDate: unavailable.startDate,
        endDate: unavailable.endDate,
        reason: unavailable.reason || 'Marked as unavailable',
      })),
      bookedDates: roomType.bookings.map((booking: IRoomBookingFromDB) => ({
        startDate: booking.checkInDate,
        endDate: booking.checkOutDate,
        reason: 'Booked',
        bookedQuantity: booking.room_qty
      })),
      currentBookings: roomType.bookings.map((booking: IRoomBookingFromDB) => ({
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        quantity: booking.room_qty,
        status: booking.status
      }))
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

  const roomTypeIds = roomTypes.map((room: {id: number}) => room.id);

  await prisma.$transaction(async (prisma: IPrismaTransaction) => {
    await prisma.property.update({
      where: {
        id: propertyId,
        tenantId: usersId,
      },
      data: {
        deletedAt: currentTime,
      },
    });

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

    await prisma.roomImage.updateMany({
      where: {
        roomId: { in: roomTypeIds },
      },
      data: {
        deletedAt: currentTime,
      },
    });

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

export const getPropertyCategoriesService = async() => {
  const categories = await prisma.category.findMany()

  return categories
}

export const createPropertyCategoriesService = async({name, iconFileName}:{name: string, iconFileName: string }) => {
  await prisma.category.create({
    data: {
      name: name,
      icon: iconFileName
    }
  })
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
    return await prisma.$transaction(async (tx: IPrismaTransaction) => {
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
          latitude: propertyData.latitude,
          longitude: propertyData.longitude,
          categoryId: Number(propertyData.categoryId),
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
          category: true,
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

export const editPropertyService = async({
  propertyId,
  tenantId,
  tenantRole,
  name,
  address,
  city,
  categoryId,
  description,
  roomCapacity,
  mainImage,
  propertyImages,
  facilityIds,
  latitude,
  longitude,
  roomTypesToUpdate = [],
  roomTypesToAdd = [],
  roomTypesToDelete = [],
  imagesToDelete = []
}: IEditProperty) => {
  const tenant = await prisma.tenant.findUnique({
      where: {
          id: tenantId,
          role: tenantRole
      }
  });
  
  if (!tenant) throw {msg: 'Invalid Credentials', status: 401};

  // Verify property ownership
  const existingProperty = await prisma.property.findUnique({
      where: {
          id: propertyId,
          tenantId,
          deletedAt: null
      },
      include: {
          images: true,
          roomTypes: {
              include: {
                  images: true,
                  flexiblePrice: true,
                  unavailability: true
              }
          }
      }
  });

  if (!existingProperty) throw { msg: 'Property not found or unauthorized', status: 404 };

  return await prisma.$transaction(async (tx: IPrismaTransaction) => {
      const imagesToBeDeleted: { path: string }[] = [];

      if (name || address || city || categoryId !== undefined || description || roomCapacity !== undefined || mainImage) {
          await tx.property.update({
              where: { id: propertyId },
              data: {
                  ...(name && { name }),
                  ...(address && { address }),
                  ...(city && { city }),
                  ...(categoryId !== undefined && { categoryId }),
                  ...(description && { description }),
                  ...(roomCapacity !== undefined && { roomCapacity }),
                  ...(mainImage && { mainImage }),
                  ...(latitude && {latitude}),
                  ...(longitude && {longitude})
              }
          });
      }

      if (imagesToDelete.length > 0) {
          const imagesToRemove = existingProperty.images.filter((img: {id: number}) => imagesToDelete.includes(img.id));
          imagesToRemove.forEach((img: {url: string}) => {
              imagesToBeDeleted.push({ path: `src/public/images/${img.url}` });
          });

          await tx.propertyImage.deleteMany({
              where: { 
                  id: { in: imagesToDelete },
                  propertyId 
              }
          });
      }

      if (propertyImages?.length) {
          await tx.propertyImage.createMany({
              data: propertyImages.map(url => ({
                  url,
                  propertyId
              }))
          });
      }

      if (facilityIds) {
          await tx.property.update({
              where: { id: propertyId },
              data: {
                  facilities: {
                      set: facilityIds.map(id => ({ id }))
                  }
              }
          });
      }

      if (roomTypesToDelete.length > 0) {
          const roomsToDelete = existingProperty.roomTypes.filter((room: {id: number}) => roomTypesToDelete.includes(room.id));
          roomsToDelete.forEach((room: IRoomWithImages) => {
              room.images.forEach((img: {url: string}) => {
                  imagesToBeDeleted.push({ path: `src/public/images/${img.url}` });
              });
          });

          await tx.roomType.deleteMany({
              where: {
                  id: { in: roomTypesToDelete },
                  propertyId
              }
          });
      }

      for (const room of roomTypesToUpdate) {
          const existingRoom = await tx.roomType.findFirst({
              where: {
                  id: room.id,
                  propertyId
              },
              include: {
                  images: true,
                  flexiblePrice: true,
                  unavailability: true
              }
          });

          if (!existingRoom) continue;

          const roomUpdateData: any = {};
          if (room.name) roomUpdateData.name = room.name;
          if (room.price) roomUpdateData.price = parseFloat(room.price as string);
          if (room.description) roomUpdateData.description = room.description;
          if (room.qty) roomUpdateData.qty = parseInt(room.qty as string);
          if (room.guestCapacity) roomUpdateData.guestCapacity = parseInt(room.guestCapacity as string);

          if (Object.keys(roomUpdateData).length > 0) {
              await tx.roomType.update({
                  where: { id: room.id },
                  data: roomUpdateData
              });
          }

          if (room.specialPricesToDelete && room.specialPricesToDelete.length > 0) {
            await tx.flexiblePrice.deleteMany({
                where: {
                    id: { 
                        in: room.specialPricesToDelete.map(id => Number(id))
                    },
                    roomTypeId: room.id
                }
            });
        }

          if (room.unavailabilityToDelete && room.unavailabilityToDelete.length > 0) {
            await tx.roomUnavailability.deleteMany({
                where: {
                    id: { 
                        in: room.unavailabilityToDelete.map(id => Number(id))
                    },
                    roomTypeId: room.id
                }
            });
        }

          if (room.images?.length) {
              existingRoom.images.forEach((img: {id: number; createdAt: Date; deletedAt: Date | null; url: string; roomId: number;}) => {
                  imagesToBeDeleted.push({ path: `src/public/images/${img.url}` });
              });

              await tx.roomImage.deleteMany({
                  where: { roomId: room.id }
              });

              await tx.roomImage.createMany({
                  data: room.images.map((url: string) => ({
                      url,
                      roomId: room.id
                  }))
              });
          }

          if (room.facilities?.length) {
              await tx.roomType.update({
                  where: { id: room.id },
                  data: {
                      facilities: {
                          set: room.facilities.map(id => ({ id }))
                      }
                  }
              });
          }

          if (room.specialPrice?.length) {
            const newSpecialPrices = room.specialPrice
                .filter(sp => !sp.id)
                .map(sp => ({
                    roomTypeId: room.id,
                    startDate: new Date(sp.startDate),
                    endDate: new Date(sp.endDate),
                    customPrice: Number(sp.price) 
                }));
        
            if (newSpecialPrices.length > 0) {
                await tx.flexiblePrice.createMany({
                    data: newSpecialPrices
                });
            }
        }
        
          if (room.unavailableDates?.length) {
            const newUnavailabilityDates = room.unavailableDates
                .filter(period => !period.id)
                .map(period => ({
                    roomTypeId: room.id,
                    startDate: new Date(period.startDate),
                    endDate: new Date(period.endDate),
                    reason: period.reason || ''
                }));
        
            if (newUnavailabilityDates.length > 0) {
                await tx.roomUnavailability.createMany({
                    data: newUnavailabilityDates
                });
            }
        }
      }

      for (const room of roomTypesToAdd) {
          const newRoom = await tx.roomType.create({
              data: {
                  name: room.name,
                  price: parseFloat(room.price as string),
                  description: room.description,
                  qty: parseInt(room.qty as string),
                  guestCapacity: parseInt(room.guestCapacity as string),
                  propertyId,
                  facilities: {
                      connect: room.facilities?.map(id => ({ id })) || []
                  }
              }
          });

          if (room.images?.length) {
              await tx.roomImage.createMany({
                  data: room.images.map(url => ({
                      url,
                      roomId: newRoom.id
                  }))
              });
          }

          // Add special pricing
          if (room.specialPrice?.length) {
              await tx.flexiblePrice.createMany({
                  data: room.specialPrice.map(sp => ({
                      roomTypeId: newRoom.id,
                      startDate: sp.startDate,
                      endDate: sp.endDate,
                      customPrice: Number(sp.price)
                  }))
              });
          }

          if (room.unavailableDates?.length) {
              await tx.roomUnavailability.createMany({
                  data: room.unavailableDates.map(period => ({
                      roomTypeId: newRoom.id,
                      startDate: period.startDate,
                      endDate: period.endDate,
                      reason: period.reason
                  }))
              });
          }
      }

      if (imagesToBeDeleted.length > 0) {
          deleteFiles({ imagesUploaded: { images: imagesToBeDeleted } });
      }

      return { propertyId };
  }, {
      maxWait: 15000,
      timeout: 20000,
  });
};

export const getRoomDetailsByIdService = async ({
  roomId,
  parsedCheckIn,
  parsedCheckOut,
}: IGetRoomDetailsById): Promise<IRoomDetailsResponse> => {
  const roomIdNumber = Number(roomId);
  if (!roomIdNumber) throw { msg: "Invalid room ID", status: 400 };

  const roomDetails = await prisma.roomType.findUnique({
    where: { 
      id: roomIdNumber,
      deletedAt: null
    },
    include: {
      facilities: true,
      images: true,
      flexiblePrice: {
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                { endDate: { gte: new Date() } }
              ]
            }
          ]
        }
      },
      unavailability: {
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                { endDate: { gte: new Date() } }
              ]
            }
          ]
        }
      },
      bookings: {
        where: {
          OR: [
            {
              checkInDate: { lte: parsedCheckOut },
              checkOutDate: { gte: parsedCheckIn },
            },
          ],
          status: {
            some: {
              Status: {
                in: ['WAITING_FOR_CONFIRMATION', 'CONFIRMED']
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          room_qty: true,
          checkInDate: true,
          checkOutDate: true,
          status: {
            select: {
              Status: true,
            },
          },
        },
      },
    },
  }) as IRoomDetailsFromDB | null;

  if (!roomDetails) throw { msg: "Room not found", status: 404 };

  // Calculate the number of days between check-in and check-out
  if (!parsedCheckOut) throw { msg: "Check-out date is required", status: 400 };
  if (!parsedCheckIn) throw { msg: "Check-in date is required", status: 400 };
  const numDays = Math.ceil((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60 * 60 * 24));

  // Generate the list of available rooms for the entire duration
  const priceComparison: IDailyAvailability[] = [];
  for (let i = 0; i <= numDays; i++) {
    const date = new Date(parsedCheckIn.getTime() + i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);

    const totalBooked = roomDetails.bookings.reduce((total, booking) => {
      return total + booking.room_qty;
    }, 0);

    const isUnavailable = roomDetails.unavailability.some(
      (period) => date >= period.startDate && date <= period.endDate
    );

    let availableRooms = isUnavailable ? 0 : Math.max(roomDetails.qty - totalBooked, 0);
    availableRooms = Math.min(availableRooms, roomDetails.qty);

    const flexiblePrice = roomDetails.flexiblePrice.find(
      (price) => date >= price.startDate && date <= price.endDate
    )?.customPrice;

    priceComparison.push({
      date: date.toDateString(),
      price: flexiblePrice || roomDetails.price,
      availableRooms,
    });
  }

  return {
    id: roomDetails.id,
    name: roomDetails.name,
    description: roomDetails.description,
    price: roomDetails.price,
    guestCapacity: roomDetails.guestCapacity, 
    qty: roomDetails.qty,
    images: roomDetails.images.map((img) => ({
      id: img.id,
      url: img.url,
    })),
    facilities: roomDetails.facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      icon: facility.icon,
    })),
    priceComparison: priceComparison,
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