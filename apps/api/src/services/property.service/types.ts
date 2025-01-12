export interface IGetPropertyList {
    parsedCheckIn: Date | undefined;
    parsedCheckOut: Date | undefined;
    search: string | undefined; 
    guest: string | undefined;
    sortBy: string;
    sortOrder: string;
    offset: number;
    pageSize: number;
    priceMin?: number;
    priceMax?: number;
    categories?: number[];
    facilities?: number[];
    minRating?: number;
}

export interface ICreateProperty {
    usersId: number;
    authorizationRole: string;
    propertyData: {
      name: string;
      address: string;
      city: string;
      categoryId: string | number;
      description: string;
      roomCapacity: number;
      facilityIds: number[];
      roomTypes: {
        name: string;
        price: number;
        description: string;
        qty: number;
        guestCapacity: number;
        facilities: number[];
      }[];
    };
    files: { [fieldname: string]: Express.Multer.File[] };
}

export interface IGetRoomDetailsById {
  roomId: string;
  parsedCheckIn?: Date;
  parsedCheckOut?: Date;
}

interface ISpecialPrice {
    startDate: Date;
    endDate: Date;
    price: number;
  }
  
  interface IUnavailability {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }
  
  export interface IRoomType {
    id: number;
    name: string;
    price: string | number;
    description: string;
    qty: string | number;
    guestCapacity: string | number;
    images?: string[];
    facilities?: number[];
    specialPrice?: ISpecialPrice[];
    unavailableDates?: IUnavailability[];
    specialPricesToDelete?: number[];
    unavailabilityToDelete?: number[];
}

export interface IEditProperty {
    propertyId: number;
    tenantId: number;
    tenantRole: string;
    name?: string;
    address?: string;
    city?: string;
    categoryId?: number;
    description?: string;
    roomCapacity?: number;
    mainImage?: string;
    propertyImages?: string[];
    facilityIds?: number[];
    roomTypesToUpdate?: IRoomType[];
    roomTypesToAdd?: IRoomType[];
    roomTypesToDelete?: number[];
    imagesToDelete?: number[];
    specialPricesToDelete?: number[];
    unavailabilityToDelete?: number[];
}