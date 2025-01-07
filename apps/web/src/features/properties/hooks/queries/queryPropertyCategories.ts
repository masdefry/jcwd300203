import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';

interface Category {
  id: number;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const fetchPropertyCategories = async (): Promise<Category[]> => {
  const response = await instance.get('/property/categories');
  return response.data.data;
};

export const useQueryPropertyCategories = () => {
  return useQuery({
    queryKey: ['propertyCategories'],
    queryFn: fetchPropertyCategories,
  });
};