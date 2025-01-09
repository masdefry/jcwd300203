'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';
import authStore from '@/zustand/authStore';
import { isTokenValid } from '@/utils/decodeToken';
import NotFound from "@/components/404";

const ConfirmVerifyAccountPage = () => {
  const pathname = usePathname();
  const token = pathname.split('/')[2]; 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const router = useRouter();
  const name = authStore((state) => state.name);
  const valid = isTokenValid(token)
  if(!valid) return <NotFound/>
  const decodeToken = (token: string) => {
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.data || !decoded.data.id || !decoded.data.role) {
        throw new Error('Invalid token data');
      }
      return {
        id: decoded.data.id,
        role: decoded.data.role,
      };
    } catch (error) {
    }
  };

  useEffect(() => {
    if (token) {
      try {
        decodeToken(token); 
      } catch (error) {
        setStatus('error');
      }
    }
  }, [token]);

  const { mutate: mutateVerifyAccount } = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }
      const response = await instance.patch(
        '/auth/verify/customer',
        {},
        {
          headers: {
            'X-Verify-Token': token, 
          },
        }
      );
      return response.data;
    },
    onMutate: () => {
      setStatus('loading');
      setIsSubmitting(true);
    },
    onSuccess: (data) => {
      setStatus('success');
      toast.success(data.message || 'Your account has been successfully verified!');
      setTimeout(() => router.push('/profile'), 3000); 
    },
    onError: (err: any) => {
      setStatus('error');
      errorHandler(err)
    },
  });

  const handleVerifyAccount = () => {
    mutateVerifyAccount();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border rounded-xl shadow-lg p-8 space-y-7">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Verify your account
            </h1>
            <p className="text-gray-500">
              Hello {name}, You are about to verify your account.
            </p>
            {status === 'loading' && (
              <p className="text-blue-600">Processing your request...</p>
            )}
            {status === 'error' && (
              <p className="text-red-600">There was an error processing your request.</p>
            )}
            {status === 'success' && (
              <p className="text-green-600">Your account has been successfully verified!</p>
            )}
          </div>

          <div className="space-y-4 text-center">
            <button
              onClick={handleVerifyAccount}
              disabled={isSubmitting}
              className={`w-full py-3 bg-blue-600 text-white rounded-lg font-medium 
                transition-all duration-200 ease-in-out
                ${isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700 hover:shadow-md active:transform active:scale-[0.99]'
                } 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Confirming...
                </span>
              ) : (
                'Confirm Email Change'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmVerifyAccountPage;