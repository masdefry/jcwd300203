import instance from "@/utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const mutateRequestVerification = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await instance.post('/auth/request/verify/customer');
        return response.data;
      },
      onSuccess: (res) => {
        toast.success(res?.message);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.msg || 'Failed to request verification');
      },
    });
  };