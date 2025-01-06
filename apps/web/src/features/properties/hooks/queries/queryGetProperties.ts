import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';

interface Property {
  id: number;
  name: string;
  mainImage: string;
  address: string;
  city: string;
  category: string;
  description: string;
  roomCapacity: number;
  tenantId: number;
  images: string[];
  facilities: any[];
  createdAt: string;
  updatedAt: string;
}

interface PropertiesResponse {
  error: boolean;
  message: string;
  data: Property[];
}

const fetchProperties = async (): Promise<Property[]> => {
  const response = await instance.get<PropertiesResponse>('/property/tenant');
  return response.data.data;
};

export const useGetProperties = () => {
  return useQuery({
    queryKey: ['properties', 'tenant'],
    queryFn: fetchProperties,
  });
};