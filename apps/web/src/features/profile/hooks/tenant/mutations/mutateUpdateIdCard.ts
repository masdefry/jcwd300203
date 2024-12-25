import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import instance from '@/utils/axiosInstance';
import { IUploadIdCardInput } from '@/features/types/profile';

export const mutateUpdateIdCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IUploadIdCardInput) => {
      const formData = new FormData();
      if(data.idCardImage) formData.append('idCardImage', data.idCardImage);

      const response = await instance.patch('/profile/tenant', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tenantProfile'] });
      toast.success(res?.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update ID Card');
    },
  });
};