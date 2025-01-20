import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';

interface Category {
    id: number;
    name: string;
    icon: string;
  }
  
  interface CategoriesResponse {
    error: boolean;
    message: string;
    data: Category[];
  }

const fetchPropertyCategories = async (): Promise<Category[]> => {
  const response = await instance.get<CategoriesResponse>('/property/categories');
  return response.data.data;
};

export const useQueryPropertyCategories = () => {
  return useQuery({
    queryKey: ['propertyCategories'],
    queryFn: fetchPropertyCategories,
  });
};