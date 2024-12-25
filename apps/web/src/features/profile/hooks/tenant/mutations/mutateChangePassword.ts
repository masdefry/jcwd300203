import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import instance from '@/utils/axiosInstance';
import { IChangePasswordInput } from '@/features/types/profile';

export const mutateChangePassword = () => {
  return useMutation({
    mutationFn: async (data: IChangePasswordInput) => {
      const response = await instance.patch('/auth/password/tenant', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.msg || 'Failed to change password');
    },
  });
};