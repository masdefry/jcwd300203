export interface IGetPropertyList {
    parsedCheckIn: Date | undefined;
    parsedCheckOut: Date | undefined;
    search: string | undefined; 
    guest: string | undefined;
    sortBy: string;
    sortOrder: string;
    offset: number;
    pageSize: number;
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
    roomTypesToUpdate?: Array<{
        id: number;
        name?: string;
        price?: number | string;
        description?: string;
        qty?: number | string;
        guestCapacity?: number | string;
        facilities?: number[];
        images?: string[];
        specialPrice?: Array<{
            id?: number;
            date: Date;
            price: number;
        }>;
    }>;
    roomTypesToAdd?: Array<{
        name: string;
        price: number | string;
        description: string;
        qty: number | string;
        guestCapacity: number | string;
        facilities: number[];
        images?: string[];
        specialPrice?: Array<{
            date: Date;
            price: number;
        }>;
    }>;
    roomTypesToDelete?: number[];
    imagesToDelete?: number[];
}