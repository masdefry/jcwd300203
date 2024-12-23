import { toast } from 'react-toastify';

interface CustomAxiosError {
  response?: {
    data: {
      message: string;
    };
    status?: number; 
  };
}

export const errorHandler = (err: unknown) => {
  const axiosErr = err as CustomAxiosError;

  if (axiosErr.response) {
    toast.error(axiosErr.response.data.message || 'Something went wrong');
    console.log(axiosErr);
  } else {
    toast.error('An unknown error occurred.');
  }
};