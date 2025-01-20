import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { ITenantProfile } from '@/features/types/profile';

export const queryTenantProfile = () => {
  return useQuery<ITenantProfile>({
    queryKey: ['tenantProfile'],
    queryFn: async () => {
      const response = await instance.get('/profile/tenant');
      return response.data.data;
    },
  });
};