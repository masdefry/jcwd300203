import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';

export const useMutateCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await instance.post('/property/facilities/create', formData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey:['facilities']});
      toast.success(data.message);
    },
    onError: (error) => {
      errorHandler(error);
    }
  });
};