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