// Base Interfaces
export interface IBaseFacility {
    id: number;
    name: string;
    icon: string | null;
  }
  
  export interface IBaseImage {
    id: number;
    url: string;
  }
  
  // Property List Interfaces
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
    latitude?: string;
    longitude?: string;
    radius?: string; // in kilometers
    searchType?: 'city' | 'radius' | 'both';
  }
  
  export interface IPropertyListResponse {
    id: number;
    name: string;
    category: string | null;
    categoryIcon: string | null;
    address: string;
    city: string;
    mainImage: string;
    facilities: IBaseFacility[];
    price: number;
    averageRating: number;
    totalReviews: number;
    isAvailable: boolean;
    similarity: number;
  }
  
  // Property Management Interfaces
  export interface ICreateRoomType {
    name: string;
    price: number;
    description: string;
    qty: number;
    guestCapacity: number;
    facilities: number[];
  }
  
  export interface ICreateProperty {
    usersId: number;
    authorizationRole: string;
    propertyData: {
      name: string;
      address: string;
      city: string;
      latitude?: string;
      longitude?: string;
      categoryId: string | number;
      description: string;
      roomCapacity: number;
      facilityIds: number[];
      roomTypes: ICreateRoomType[];
    };
    files: { [fieldname: string]: Express.Multer.File[] };
  }
  
  export interface ISpecialPrice {
    id?: number;
    startDate: Date;
    endDate: Date;
    price: number;
  }
  
  export interface IUnavailability {
    id?: number;
    startDate: Date;
    endDate: Date;
    reason: string;
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
    latitude?: string;
    longitude?: string;
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
  
  // Room Details Interfaces
  export interface IGetRoomDetailsById {
    roomId: string;
    parsedCheckIn?: Date;
    parsedCheckOut?: Date;
  }
  
  export interface IRoomDetailsResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    guestCapacity: number;
    qty: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    priceComparison: IPriceAvailability[];
  }
  
  // Availability and Pricing Interfaces
  export interface IPriceAvailability {
    date: string;
    price: number;
    availableRooms: number;
  }
  
  export interface IRoomTypeAvailability {
    checkIn?: Date;
    checkOut?: Date;
    availableRooms: number;
    isAvailable: boolean;
  }
  
  // Extended Room Type Interface for Responses
  export interface IRoomTypeResponse extends Omit<IRoomType, 'price' | 'qty' | 'guestCapacity'> {
    quantity: number;
    basePrice: number;
    currentPrice: number;
    availability: IRoomTypeAvailability;
    priceComparison: IPriceAvailability[];
  }
  
  // Property Details Response Interface
  export interface IPropertyDetailsResponse {
    id: number;
    name: string;
    latitude?: string;
    longitude?: string;
    address: string;
    city: string;
    description: string;
    mainImage: string;
    roomCapacity: number;
    averageRating: number;
    totalReviews: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    roomTypes: IRoomTypeResponse[];
  }
  
  // Tenant Property Management Interfaces
  export interface ITenantPropertyParams {
    usersId: number;
    authorizationRole: string;
    id?: string;
  }
  
  export interface IPropertyFacilities {
    propertiesFacilities: IBaseFacility[];
    roomFacilities: IBaseFacility[];
  }
  
  export interface IPropertyCategory {
    id: number;
    name: string;
    icon: string;
  }
  
  export interface ICreateFacility {
    name: string;
    type: 'property' | 'room';
    iconFileName?: string;
  }
  
  export interface ICategory {
    name: string;
    iconFileName: string;
  }