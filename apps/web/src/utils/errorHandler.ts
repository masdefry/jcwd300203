import { toast } from "react-toastify";

interface CustomAxiosError {
  response?: {
    data: {
      error?: boolean;
      message: string; // This will contain the err.msg from backend
      stack?: string;
    };
    status?: number; 
  };
  message?: string;
}

export const errorHandler = (err: unknown) => {
  const axiosErr = err as CustomAxiosError;

  if (axiosErr.response) {
    const errorMessage = axiosErr.response.data.message || 'Something went wrong';
    toast.error(errorMessage);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: axiosErr.response.status,
        message: errorMessage,
        fullError: axiosErr.response.data
      });
    }
  } else if (axiosErr.message) {
    // Handle network errors
    toast.error(axiosErr.message);
    console.error('Network Error:', axiosErr.message);
  } else {
    // Fallback for unknown errors
    toast.error('An unknown error occurred.');
    console.error('Unknown Error:', axiosErr);
  }
};