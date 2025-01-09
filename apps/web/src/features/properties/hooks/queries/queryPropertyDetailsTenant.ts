import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { PropertyType } from '@/features/types/property';

interface PropertyDetailsResponse {
  error: boolean;
  message: string;
  data: PropertyType;
}

export const usePropertyDetailsTenant = () => {
  const pathname = usePathname();
  const id = pathname.split('/')[3];

  const { data: property, isLoading } = useQuery({
    queryKey: ['propertyDetails', id],
    queryFn: async () => {
      const response = await instance.get<PropertyDetailsResponse>(`property/tenant/details/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });

  return {
    property,
    isLoading,
    propertyId: id
  };
};