import { IChangePasswordInput } from "@/features/types/profile";
import instance from "@/utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";


export const useChangePassword = () => {
    return useMutation({
      mutationFn: async (data: IChangePasswordInput) => {
        const response = await instance.patch('/auth/password/customer', data);
        return response.data;
      },
      onSuccess: (res) => {
        toast.success(res?.message);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to change password');
      },
    });
  };