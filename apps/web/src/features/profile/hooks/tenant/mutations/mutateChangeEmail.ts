import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import instance from '@/utils/axiosInstance';
import { IChangeEmailInput } from '@/features/types/profile';

export const useChangeEmail = () => {
  return useMutation({
    mutationFn: async (data: IChangeEmailInput) => {
      const response = await instance.post('/auth/request/email', data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to request email change');
    },
  });
};