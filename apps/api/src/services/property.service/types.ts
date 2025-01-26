import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
// Base Interfaces
export interface IBaseFacility {
    id: number;
    name: string;
    icon: string | null;
    
  }
  
  export interface IBaseImage {
    id: number;
    url: string;
    deletedAt?: Date | null;
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
  
  export interface ITenantPropertyListResponse {
    id: number;
    name: string;
    address: string;
    city: string;
    mainImage: string;
    deletedAt: Date | null;
    tenantId: number;
    images: Array<{
      id: number;
      url: string;
      createdAt: Date;
      deletedAt: Date | null;
      propertyId: number;
    }>;
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
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

  
  // Availability and Pricing Interfaces
  export interface IPriceAvailability {
    date: string;
    price: Prisma.Decimal;  // Keep as Decimal until final conversion
    availableRooms: number;
  }
  export interface IDailyAvailability {
    date: string;
    price: Prisma.Decimal;
    availableRooms: number;
  }

  export interface IRoomDetailsFromDB {
    id: number;
    name: string;
    description: string;
    price: Prisma.Decimal;
    guestCapacity: number;
    qty: number;
    images: Array<{
      id: number;
      url: string;
    }>;
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
    flexiblePrice: Array<{
      startDate: Date;
      endDate: Date;
      customPrice: Prisma.Decimal;
    }>;
    unavailability: Array<{
      startDate: Date;
      endDate: Date;
    }>;
    bookings: Array<{
      room_qty: number;
      checkInDate: Date;
      checkOutDate: Date;
      status: Array<{
        Status: string;
      }>;
    }>;
  }

  // Response interface
export interface IRoomDetailsResponse {
    id: number;
    name: string;
    description: string;
    price: Prisma.Decimal;
    guestCapacity: number;
    qty: number;
    images: IBaseImage[];
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
    priceComparison: IDailyAvailability[];
  }

  // Database interfaces
  export interface IRoomTypeFromDB {
    id: number;
    name: string;
    qty: number;
    description: string;
    guestCapacity: number;
    price: Prisma.Decimal;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    flexiblePrice: Array<{
      startDate: Date;
      endDate: Date;
      customPrice: Prisma.Decimal;
    }>;
    unavailability: Array<{
      startDate: Date;
      endDate: Date;
    }>;
    bookings: Array<{
      checkInDate: Date;
      checkOutDate: Date;
      room_qty: number;
    }>;
  }
  
  export interface IRoomDetailsResponse {
    id: number;
    name: string;
    description: string;
    price: Decimal;
    guestCapacity: number;
    qty: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    priceComparison: IPriceAvailability[];
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

  export interface ICustomer {
    name: string;
    profileImage: string | null;
  }

  export interface IReview {
    id: number;
    rating: number;
    comment: string;
    reply: string | null;
    createdAt: Date;
    customer: ICustomer;
  }
  
  // Property Details Response Interface
  export interface IPropertyDetailsResponse {
    id: number;
    name: string;
    latitude: string | null;
    longitude: string | null;
    address: string;
    city: string;
    description: string;
    mainImage: string;
    roomCapacity: number;
    averageRating: number;
    totalReviews: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    reviews: Array<{
      id: number;
      rating: number;
      comment: string;
      reply: string | null;
      createdAt: Date;
      customer: {
        name: string;
        profileImage: string | null;
      };
    }>;
    roomTypes: Array<{
      id: number;
      name: string;
      quantity: number;
      description: string;
      guestCapacity: number;
      basePrice: number;  // Converted to number in final response
      currentPrice: number;  // Converted to number in final response
      images: IBaseImage[];
      facilities: IBaseFacility[];
      availability: IRoomAvailability;
      priceComparison: Array<{
        date: string;
        price: number;  // Converted to number in final response
        availableRooms: number;
      }>;
    }>;
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
    radius?: string;
  }
  
  // Database types from Prisma
  export interface IPropertyFromDB {
    id: number;
    name: string;
    address: string;
    city: string;
    latitude: string | null;
    longitude: string | null;
    mainImage: string;
    category: {
      id: number;
      name: string;
      icon: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    } | null;
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
    reviews: Array<{
      rating: number;
    }>;
    roomTypes: Array<{
      qty: number;
      price: Prisma.Decimal;
      flexiblePrice: Array<{
        customPrice: Prisma.Decimal;
      }>;
    }>;
  }
  
  
  // Response interface
  export interface IPropertyListResponse {
    id: number;
    name: string;
    category: string | null;
    categoryIcon: string | null;
    address: string;
    city: string;
    mainImage: string;
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;
    }>;
    price: number;
    averageRating: number;
    totalReviews: number;
    isAvailable: boolean;
    similarity: number;
  }
  
  // Location conditions type
  export interface ILocationConditions {
    AND?: Array<{
      latitude: {
        gte: string;
        lte: string;
      };
    } | {
      longitude: {
        gte: string;
        lte: string;
      };
    }>;
  }
  
  // Helper function return type
  export interface ICalculateDistanceParams {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
  }

  export interface IPriceComparison {
    date: string;
    price: Prisma.Decimal;
    availableRooms: number;
  }

  export interface IRoomAvailability {
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    availableRooms: number;
    isAvailable: boolean;
  }

  export interface IFormattedRoomType {
    id: number;
    name: string;
    quantity: number;
    description: string;
    guestCapacity: number;
    basePrice: Prisma.Decimal;
    currentPrice: Prisma.Decimal;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    availability: IRoomAvailability;
    priceComparison: IPriceAvailability[];
  }

// Add the new tenant property interfaces
export interface ITenantPropertyListParams {
    usersId: number;
    authorizationRole: string;
  }
  
  export interface ITenantPropertyDetailsParams extends ITenantPropertyListParams {
    id: string;
  }
  
  // Add new room type related interfaces for tenant
  export interface IFlexiblePrice {
    id: number;
    startDate: Date;
    endDate: Date;
    price: number;
  }
  
  export interface IBookedDate {
    startDate: Date;
    endDate: Date;
    reason: string;
    bookedQuantity: number;
  }
  
  export interface ICurrentBooking {
    checkInDate: Date;
    checkOutDate: Date;
    quantity: number;
    status: {
      Status: string;
      createdAt: Date;
    }[];
  }
  
  // Add tenant-specific response interfaces
  export interface ITenantRoomType {
    id: number;
    name: string;
    quantity: number;
    description: string;
    price: number;
    guestCapacity: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    flexiblePrices: IFlexiblePrice[];
    unavailableDates: IUnavailability[];
    bookedDates: IBookedDate[];
    currentBookings: ICurrentBooking[];
  }
  
  export interface IPropertyDetailsTenantResponse {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    mainImage: string;
    roomCapacity: number;
    category: {
      id: number;
      name: string;
      icon: string;
    } | null;
    averageRating: number;
    totalReviews: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    reviews: IReview[];
    roomTypes: ITenantRoomType[];
  }
  
  // Add tenant-specific database interfaces
  export interface ITenantRoomTypeFromDB {
    id: number;
    name: string;
    qty: number;
    description: string;
    price: Prisma.Decimal;
    guestCapacity: number;
    images: IBaseImage[];
    facilities: IBaseFacility[];
    flexiblePrice: Array<{
      id: number;
      startDate: Date;
      endDate: Date;
      customPrice: Prisma.Decimal;
    }>;
    unavailability: Array<{
      id: number;
      startDate: Date;
      endDate: Date;
      reason: string | null;
    }>;
    bookings: Array<{
      checkInDate: Date;
      checkOutDate: Date;
      room_qty: number;
      status: {
        Status: string;
        createdAt: Date;
      }[];
    }>;
  }