import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';
import { PropertyFormValues } from '@/features/types/property';


export const useMutateCreateProperty = () => {
  const queryClient = useQueryClient();

  
  return useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const formData = new FormData();
      
      formData.append('name', values.name);
      formData.append('address', values.address);
      formData.append('city', values.city);
      formData.append('categoryId', values.categoryId);
      formData.append('description', values.description);
      formData.append('roomCapacity', values.roomCapacity);
      
      if (values.facilityIds && values.facilityIds.length > 0) formData.append('facilityIds', JSON.stringify(values.facilityIds));
      
      if (values.mainImage instanceof File) formData.append('mainImage', values.mainImage);
      
      if (values.propertyImages && values.propertyImages.length > 0) {
        values.propertyImages.forEach((image) => {
          if (image instanceof File) {
            formData.append('propertyImages', image);
          }
        });
      }

      if (values.roomTypes && values.roomTypes.length > 0) {
        const roomTypesData = values.roomTypes.map((room) => ({
          name: room.name,
          price: room.price,
          description: room.description,
          qty: room.qty,
          guestCapacity: room.guestCapacity,
          facilities: room.facilities || [],
        }));

        formData.append('roomTypes', JSON.stringify(roomTypesData));

        values.roomTypes.forEach((roomType, index) => {
          if (roomType.images && roomType.images.length > 0) {
            roomType.images.forEach((image) => {
              if (image instanceof File) {
                formData.append(`roomTypeImages${index}`, image);
              }
            });
          }
        });
      }

      try {
        console.log('Submitting form data:', {
          name: values.name,
          address: values.address,
          city: values.city,
          category: values.categoryId,
          roomTypes: values.roomTypes.length
        });

        const response = await instance.post('/property', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(data?.message || 'Property created successfully!');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      errorHandler(error);
    }
  });
};