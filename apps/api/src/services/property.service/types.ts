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
      category: string;
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