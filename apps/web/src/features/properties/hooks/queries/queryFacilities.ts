import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { FacilitiesResponse } from '@/features/types/property';

export const usePropertyFacilities = () => {
  return useQuery<FacilitiesResponse>({
    queryKey: ['facilities'],
    queryFn: async () => {
      const response = await instance.get('/property/facilites');
      return response.data;
    }
  });
};