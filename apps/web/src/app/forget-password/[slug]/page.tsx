'use client';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ChangePasswordForm = ({params}: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: mutateResetPassword } = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      return instance.patch('/auth/reset/password', {
        password
      },
      {
          headers: {
              'Authorization': `Bearer ${params?.slug}`
          }
      }
    );
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message);
      setIsSubmitting(false);
    },
    onError: (err) => {
      errorHandler(err);
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border rounded-xl shadow-lg p-8 space-y-7">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Change Password
            </h1>
            <p className="text-gray-500">
              Please enter your new password
            </p>
          </div>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              mutateResetPassword({ password: values.password });
              setIsSubmitting(true);
              resetForm();
            }}
          >
            {({ isValid }) => (
              <Form className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Enter your new password"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full py-3 bg-blue-600 text-white rounded-lg font-medium 
                    transition-all duration-200 ease-in-out
                    ${
                      isSubmitting || !isValid
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
                      Changing Password...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;