import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { ICustomerProfile } from '@/features/types/profile';

export const useQueryCustomerProfile = () => {
  return useQuery<ICustomerProfile>({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      const response = await instance.get('/profile/customer');
      return response.data.data;
    },
  });
};