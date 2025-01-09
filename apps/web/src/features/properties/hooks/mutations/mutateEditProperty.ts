import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import instance from '@/utils/axiosInstance';
import { errorHandler } from '@/utils/errorHandler';

interface EditPropertyData {
  id: string;
  formData: FormData;
}

export const useEditProperty = () => {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const id = pathname.split('/')[3];
    const router = useRouter();
    console.log('id from mutateEditProperty: ', id);
  
    const mutation = useMutation({
      mutationFn: async ({ formData }: EditPropertyData) => {
        const response = await instance.patch(`/property/edit/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },
      onSuccess: (res) => {
        toast.success(res?.message);
        queryClient.invalidateQueries({ queryKey: ['propertyDetails'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        router.push('/dashboard/properties');
      },
      onError: (err: any) => {
        errorHandler(err);
      },
    });
  
    const { isPending } = mutation;
  
    return {
      ...mutation,
      isSubmitting: isPending,
    };
  };