'use client';
import { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { errorHandler } from '@/utils/errorHandler';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { isTokenValid } from '@/utils/decodeToken';
import NotFound from "@/components/404";

const validationSchemas = {
  step1: Yup.object().shape({
    name: Yup.string()
      .min(3, 'Name must be at least 2 characters')
      .required('Name is required'),
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
      .required('Username is required'),
  }),
  step2: Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
};

export default function RegistrationForm({ params }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const token = pathname.split('/')[3]
  
  const { mutate: mutateVerifyUserEmail } = useMutation({
    mutationFn: async ({ username, name, password }: any) => {
      return instance.patch(
        '/auth/register/customer',
        {
          username,
          name,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${params?.slug}`,
          },
        },
      );
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message);
      setIsSubmitting(false);
      router.push('/login/user');
    },
    onError: (err) => {
      errorHandler(err);
      setIsSubmitting(false);
    },
  });
  
  const valid = isTokenValid(token);
  if(!valid) return <NotFound/>
  
  const getStepData = (step: number) => {
    try {
      const key = `register_user_step${step}`;
      const data = sessionStorage.getItem(key);
    
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting data:', error);
      return {};
    }
  };

  const saveStepData = (step: number, data: any) => {
    try {
      const key = `register_user_step${step}`; 
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const clearStepData = () => {
    sessionStorage.removeItem('registerUserStep1');
    sessionStorage.removeItem('registerUserStep2');
  };

  const steps = {
    1: (
      <Formik
        initialValues={{
          name: '',
          username: '',
        }}
        validationSchema={validationSchemas.step1}
        onSubmit={(values) => {
          saveStepData(1, values);
          setCurrentStep(2);
        }}
      >
        {({ isValid, handleChange, handleBlur, values }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className="w-full mt-2 px-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#f15b5b] transition-colors"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-[#f15b5b] text-sm mt-1"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Choose a username"
                className="w-full mt-2 px-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#f15b5b] transition-colors"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-[#f15b5b] text-sm mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3 text-white bg-[#f15b5b] rounded-lg font-medium
                ${!isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e54949]'}`}
            >
              Next
            </Button>
          </Form>
        )}
      </Formik>
    ),
    2: (
      <Formik
        initialValues={{
          password: '',
          confirmPassword: ''
        }}
        validationSchema={validationSchemas.step2}
        onSubmit={(values) => {
          const step1Data = getStepData(1);
          setIsSubmitting(true);
          mutateVerifyUserEmail({
            username: step1Data.username,
            name: step1Data.name,
            password: values.password,
          });
          clearStepData();
        }}
      >
        {({ isValid, handleChange, handleBlur, values }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="password" className="text-gray-600">Password</label>
              <div className="relative mt-2">
                <input
                  key="password-field" // Add this
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password || ''} // Force empty string
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-[#F8FAFC] rounded-lg border border-gray-200 focus:outline-none focus:border-[#f15b5b] transition-colors"
                  placeholder="Create a strong password"
                />
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-[#f15b5b] text-sm mt-1"
              />
            </div>
    
            <div>
              <label htmlFor="confirmPassword" className="text-gray-600">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  key="confirm-password-field" // Add this
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.confirmPassword || ''} // Force empty string
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-[#F8FAFC] rounded-lg border border-gray-200 focus:outline-none focus:border-[#f15b5b] transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-[#f15b5b] text-sm mt-1"
              />
            </div>
    
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-1/2 py-3 text-[#f15b5b] bg-white border border-[#f15b5b] rounded-lg font-medium hover:bg-[#fff8f8]"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 text-white bg-[#f15b5b] rounded-lg font-medium hover:bg-[#e54949]"
              >
                Create Account
              </button>
            </div>
          </Form>
        )}
      </Formik>
    )
  };

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
            alt="Register Image"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-gray-900">Create Account</h1>
              <p className="mt-2 text-gray-600">Step {currentStep} of 2</p>
            </div>

            {steps[currentStep as keyof typeof steps]}
          </div>
        </div>
      </div>
    </div>
  );
}