import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import instance from '@/utils/axiosInstance';
import { IEditProfileInput } from '@/features/types/profile';

export const mutateEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IEditProfileInput) => {
      const formData = new FormData();
      if(data.name) formData.append('name', data.name);
      if(data.username) formData.append('username', data.username);
      if (data.profileImage) formData.append('profileImage', data.profileImage);

      console.log('Form values before submit:', {
        name: data.name,
        username: data.username,
        hasProfileImage: !!data.profileImage,
      });
      
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
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });
};