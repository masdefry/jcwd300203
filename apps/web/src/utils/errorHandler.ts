import { toast } from 'react-toastify';

interface CustomAxiosError {
  response?: {
    data: {
      msg: string;
    };
    status?: number; 
  };
}

export const errorHandler = (err: unknown) => {
  const axiosErr = err as CustomAxiosError;

  if (axiosErr.response) {
    toast.error(axiosErr.response.data.msg || 'Something went wrong');
    console.log(axiosErr);
  } else {
    toast.error('An unknown error occurred.');
  }
};