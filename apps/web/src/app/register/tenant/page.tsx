'use client';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';
import Image from 'next/image';
import Footer from '@/components/common/footer/Footer';
import CopyrightFooter from '@/components/common/footer/CopyrightFooter';
import Wrapper from '@/components/layout/Wrapper';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const registerUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {mutate: mutateVerifyUserEmail} = useMutation({
    mutationFn: async({email}: {email: string}) => {
      return instance.post('/auth/verify/email/tenant', {
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
    <Wrapper>
      <div className="min-h-screen relative">
        {/* Mobile background image */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/assets/images/BaliBeach.webp"
            alt="Background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        <div className="min-h-screen flex relative">
          {/* Left side - Image (hidden on mobile, 3/5 width on desktop) */}
          <div className="hidden lg:block lg:w-3/5 relative">
            <Image
              src="/assets/images/BaliBeach.webp"
              alt="Register Tenant Image"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right side - Form (full width on mobile, 2/5 width on desktop) */}
          <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-8">
            {/* Card wrapper */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 space-y-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Register as Tenant</h1>
                <p className="mt-2 text-gray-600">Enter your email to proceed</p>
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
                  <Form className="space-y-4">
                    <div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      className={`w-full py-3 text-white bg-[#f15b5b] rounded-lg font-medium
                        ${isSubmitting || !isValid 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-[#e54949] active:transform active:scale-[0.99]'} 
                        transition-colors duration-200`}
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login/tenant" className="font-medium text-[#f15b5b] hover:text-[#e54949]">
                  Log In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Our Footer --> */}
      <section className="footer_one">
        <div className="container">
          <div className="row">
            <Footer />
          </div>
        </div>
      </section>

      {/* <!-- Our Footer Bottom Area --> */}
      <section className="footer_middle_area pt40 pb40">
        <div className="container">
          <CopyrightFooter />
        </div>
      </section>
      
    </Wrapper>
  );
};

export default registerUserForm;
