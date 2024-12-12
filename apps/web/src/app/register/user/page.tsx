'use client';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const registerUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {mutate: mutateVerifyUserEmail} = useMutation({
    mutationFn: async({email}: {email: string}) => {
      return instance.post('/auth/verify/email/customer', {
          email
      })
  },
  onSuccess: (res) => {
      toast.success(res?.data?.message)
      setIsSubmitting(false)
  },
  onError: (err) => {
      errorHandler(err)
      setIsSubmitting(false)
  }  
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border rounded-xl shadow-lg p-8 space-y-7">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Verify Your Email
            </h1>
            <p className="text-gray-500">
              Enter your email to proceed
            </p>
          </div>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              mutateVerifyUserEmail({email: values.email})
              setIsSubmitting(true);
              resetForm()
            }}
          >
            {({ isValid }) => (
              <Form className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                  />
                  <ErrorMessage
                    name="email"
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
                      Sending...
                    </span>
                  ) : (
                    'Send Verification Email'
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

export default registerUserForm;
