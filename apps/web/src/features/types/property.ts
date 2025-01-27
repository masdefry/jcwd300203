import { FormikErrors, FormikTouched, FormikHelpers } from 'formik';

export interface Facility {
  id: number;
  name: string;
  icon: string;
  type: 'PROPERTY' | 'ROOM';
}

export interface RoomType {
  name: string;
  price: string;
  description: string;
  qty: string;
  guestCapacity: string;
  facilities: number[];
  newFacility: string;
  images: File[];
}

export interface PropertyFormValues {
    name: string;
    address: string;
    description: string;
    city: string;
    categoryId: string;
    roomCapacity: string;
    mainImage: File | null;
    propertyImages: File[];
    facilityIds: number[];  
    facilities: any[];
    roomTypes: Array<{
      name: string;
      price: string;
      description: string;
      qty: string;
      guestCapacity: string;
      facilities: number[];  
      images: File[];
    }>;
  }

// Base interface for form handling
export interface FormSectionProps {
    values: PropertyFormValues;
    setFieldValue: FormikHelpers<PropertyFormValues>['setFieldValue'];
    errors: FormikErrors<PropertyFormValues>;
    touched: FormikTouched<PropertyFormValues>;
  }


// Facilities section props
export interface FacilitiesSectionProps {
    values: any;
    setFieldValue: (field: string, value: any) => void;
    errors: any;
    touched: any;
    type: 'PROPERTY' | `ROOM-${number}`;
  }

export interface RoomTypeSectionProps {
    values: PropertyFormValues;
    setFieldValue: (field: string, value: any) => void;
    errors: FormikErrors<PropertyFormValues>;
    touched: FormikTouched<PropertyFormValues>;
    roomImagePreviews: Record<number, string[]>;
    handleImagePreview: {
      addRoomImages: (files: File[], roomIndex: number) => void;
      removeRoomImage: (roomIndex: number, imageIndex: number) => void;
    };
  }
// Image upload section props
export interface ImageUploadSectionProps {
  title: string;
  preview?: string | null;
  previewList?: string[];
  onMainImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultipleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  error?: string | undefined;
  multiple?: boolean;
}

export interface FacilitiesResponse {
  error: boolean;
  message: string;
  data: {
    propertiesFacilities: Facility[];
    roomFacilities: Facility[];
  };
}


  

  export interface RoomTypeImage {
    id: number;
    url: string;
  }
  
  export interface RoomTypeResponse {
    id: number;
    quantity: number;
    name: string;
    price: string;
    guestCapacity: number;
    description?: string;
    images: RoomTypeImage[];
    facilities: Array<{
      id: number;
      name: string;
      icon: string;
    }>;
    flexiblePrices?: Array<{  
      id: number;
      startDate: string;     
      endDate: string;        
      price: string;
    }>;
    unavailableDates?: Array<{  
      id: number;
      startDate: string;
      endDate: string;
      reason: string;
    }>;
    currentBookings?: Array<{  
      checkInDate: Date,
        checkOutDate: Date,
        quantity: number,
        status: string
    }>;
}
  
  export interface RoomTypeForm {
    id?: number;
    name: string;
    price: string;
    description: string;
    qty: number;
    guestCapacity: number;
    facilities: number[];
    images: Array<File | RoomTypeImage>;
    specialPrice?: Array<{
      id?: number;
      startDate: Date | null;
      endDate: Date | null;
      price: string;
    }>;
    unavailableDates?: Array<{
      id?: number;
      startDate: Date | null;
      endDate: Date | null;
      reason: string;
    }>;
    specialPricesToDelete?: number[];
    unavailabilityToDelete?: number[];
  }
  
  export interface PropertyType {
    id: number;
    name: string;
    mainImage: string;
    address: string;
    city: string;
    category?: {  
      id: number;
      name: string;
      icon: string;
    };
    description: string;
    roomCapacity: number;
    images: Array<{
      id: number;
      url: string;
    }>;
    facilities: Array<{
      id: number;
      name: string;
      icon: string | null;  
    }>;
    roomTypes: RoomTypeResponse[];
    averageRating: number;  
    totalReviews: number;   
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
}
  
  export interface PropertyDetailsRoomSectionProps {
    values: {
      roomTypes: RoomTypeForm[];
    };
    setFieldValue: (field: string, value: any) => void;
    errors: any;
    touched: any;
    roomImagePreviews: { [key: number]: string[] };
    handleImagePreview: {
      addRoomImages: (files: File[], roomIndex: number) => void;
      setRoomImages: (images: Array<File | RoomTypeImage>, roomIndex: number) => void;
      removeRoomImage: (roomIndex: number, imageIndex: number) => void;
    };
  }