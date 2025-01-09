import { useState } from 'react';
import { useMutateCreateProperty } from './mutations/mutateCreateProperty';
import { useMutateCreateFacility } from './mutations/mutateCreateFacility';
import { usePropertyFacilities } from './queries/queryFacilities';
import { PropertyFormValues } from '@/features/types/property';

export const usePropertyForm = () => {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState<string[]>([]);
  const [roomImagePreviews, setRoomImagePreviews] = useState<Record<number, string[]>>({});

  const { mutate: createProperty, isPending } = useMutateCreateProperty();
  const { mutate: createFacility } = useMutateCreateFacility();
  const { data: facilitiesData, isLoading: isLoadingFacilities } = usePropertyFacilities();

 
    const handleSubmit = (values: PropertyFormValues) => {
    console.log('Calling createProperty with values:', values);
    createProperty(values);
    };
  
    

    const handleImagePreview = {
        setMainImage: (file: File | string) => {
          if (file instanceof File) {
            const url = window.URL.createObjectURL(file);
            setMainImagePreview(url);
          } else {
            setMainImagePreview(file);
          }
        },
        setPropertyImages: (images: Array<File | { url: string }>) => {
          const previews = images.map(image => {
            if (image instanceof File) {
              return window.URL.createObjectURL(image);
            }
            return image.url;
          });
          setPropertyImagePreviews(previews);
        },
        addPropertyImages: (files: File[]) => {
          const newPreviews = files.map(file => window.URL.createObjectURL(file));
          setPropertyImagePreviews(prev => [...prev, ...newPreviews]);
        },
        removePropertyImage: (index: number) => {
          setPropertyImagePreviews(prev => prev.filter((_, i) => i !== index));
        },
        setRoomImages: (images: Array<File | { url: string }>, roomIndex: number) => {
          const previews = images.map(image => {
            if (image instanceof File) {
              return window.URL.createObjectURL(image);
            }
            return image.url;
          });
          setRoomImagePreviews(prev => ({
            ...prev,
            [roomIndex]: previews
          }));
        },
        addRoomImages: (files: File[], roomIndex: number) => {
          const newPreviews = files.map(file => window.URL.createObjectURL(file));
          setRoomImagePreviews(prev => ({
            ...prev,
            [roomIndex]: [...(prev[roomIndex] || []), ...newPreviews]
          }));
        },
        removeRoomImage: (roomIndex: number, imageIndex: number) => {
          setRoomImagePreviews(prev => ({
            ...prev,
            [roomIndex]: prev[roomIndex].filter((_, i) => i !== imageIndex)
          }));
        }
      };

  return {
    mainImagePreview,
    propertyImagePreviews,
    roomImagePreviews,
    handleImagePreview,
    handleSubmit,
    createFacility,
    facilitiesData,
    createProperty,
    isPending,
    isLoadingFacilities
  };
};