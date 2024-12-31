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
    setMainImage: (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setMainImagePreview(objectUrl);
      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    },
    
    addPropertyImages: (files: File[]) => {
      const newPreviews = files.map(file => {
        const objectUrl = URL.createObjectURL(file);
        return objectUrl;
      });
      setPropertyImagePreviews(prev => [...prev, ...newPreviews]);
      return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
    },
    
    addRoomImages: (files: File[], roomIndex: number) => {
      const newPreviews = files.map(file => {
        const objectUrl = URL.createObjectURL(file);
        return objectUrl;
      });
      setRoomImagePreviews(prev => ({
        ...prev,
        [roomIndex]: [...(prev[roomIndex] || []), ...newPreviews]
      }));
      return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
    },
    
    removePropertyImage: (index: number) => {
      setPropertyImagePreviews(prev => {
        const urlToRemove = prev[index];
        URL.revokeObjectURL(urlToRemove);
        return prev.filter((_, i) => i !== index);
      });
    },
    
    removeRoomImage: (roomIndex: number, imageIndex: number) => {
      setRoomImagePreviews(prev => {
        const urlToRemove = prev[roomIndex][imageIndex];
        URL.revokeObjectURL(urlToRemove);
        return {
          ...prev,
          [roomIndex]: prev[roomIndex].filter((_, i) => i !== imageIndex)
        };
      });
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