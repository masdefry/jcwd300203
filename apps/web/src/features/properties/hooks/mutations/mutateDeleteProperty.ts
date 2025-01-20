import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: number) => {
        const response = await instance.patch(`/property/delete/${propertyId}`);
        return response.data;
      },
    onSuccess: (res) => {
      toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      errorHandler(error)
    },
  });
};