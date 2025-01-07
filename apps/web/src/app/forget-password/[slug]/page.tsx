'use client';
import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { errorHandler } from '@/utils/errorHandler';
import jwt from 'jsonwebtoken';
import { InvalidLinkError } from '@/components/404/InvalidLink';

export default function ConfirmResetPassword({ params }: any) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const token = params?.slug;
  
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
        throw error;
      }
    };
  
    useEffect(() => {
      if (token) {
        try {
          decodeToken(token);
          setIsTokenValid(true);
        } catch (error) {
          setStatus('error');
          setIsTokenValid(false);
        }
      }
    }, [token]);
  
    const { mutate: mutateResetPassword, isPending } = useMutation({
      mutationFn: async ({ password }: any) => {
        return instance.post(
          '/auth/reset-password',
          { password },
          {
            headers: {
              'Authorization': `Bearer ${params?.slug}`
            }
          }
        );
      },
      onMutate: () => {
        setStatus('loading');
      },
      onSuccess: (res) => {
        setStatus('success');
        toast.success(res.data.message);
        setTimeout(() => router.push('/login/user'), 3000);
      },
      onError: (err) => {
        setStatus('error');
        errorHandler(err);
      }
    });
  
    if (status === 'error' || !isTokenValid) return <InvalidLinkError />;
    
  
    const validationSchema = Yup.object().shape({
      password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
      confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
    });
  
    return (
      <div className="min-h-screen relative">
        {/* Mobile background image */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/assets/images/LabuanBajo.webp"
            alt="Background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
  
        <div className="min-h-screen flex relative">
          {/* Left side - Image */}
          <div className="hidden lg:block lg:w-3/5 relative">
            <Image
              src="/assets/images/LabuanBajo.webp"
              alt="Reset Password Image"
              fill
              className="object-cover"
              priority
            />
          </div>
  
          {/* Right side - Form */}
          <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-semibold text-gray-900">Reset Password</h1>
                <p className="mt-2 text-gray-600">Please enter your new password</p>
                {status === 'loading' && (
                  <p className="text-blue-600">Processing your request...</p>
                )}
                {status === 'success' && (
                  <p className="text-green-600">Password reset successful!</p>
                )}
              </div>
  
              <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  mutateResetPassword({ password: values.password });
                }}
              >
                {({ isValid }) => (
                  <Form className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-sm text-red-500"
                      />
                    </div>
  
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Field
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-sm text-red-500"
                      />
                    </div>
  
                    <button
                      type="submit"
                      disabled={isPending || !isValid}
                      className={`w-full py-3 text-white bg-[#f15b5b] rounded-lg font-medium
                        ${isPending || !isValid 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-[#e54949] active:transform active:scale-[0.99]'} 
                        transition-colors duration-200`}
                    >
                      {isPending ? (
                        <span className="inline-flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting Password...
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    );
  };