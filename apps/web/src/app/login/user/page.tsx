'use client';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { loginUserSchema } from '@/components/schemas/login/user/LoginUserSchema';
import { useMutation } from '@tanstack/react-query'
import instance from '@/utils/axiosInstance'
import { useRouter } from 'next/navigation'
import authStore from '@/zustand/authStore'
import { errorHandler } from '@/utils/errorHandler'
import { FaGoogle, FaGithub } from "react-icons/fa";
import { toast } from 'react-toastify';
import { auth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from '@/utils/firebaseConfig';
import { AuthProvider } from 'firebase/auth';
import Image from 'next/image';
import Wrapper from '@/components/layout/Wrapper';
import Header from '@/components/home/Header';
import Footer from '@/components/common/footer/Footer';
import CopyrightFooter from '@/components/common/footer/CopyrightFooter';
import Link from 'next/link';

export default function LoginForm() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const setAuth = authStore((state) => state.setAuth);

    const {mutate: mutateLoginUser} = useMutation({
        mutationFn: async({emailOrUsername, password}: {emailOrUsername: string, password: string}) => {
            return await instance.post('/auth/login/customer',{
                emailOrUsername,
                password
            })
        },
        onSuccess: (res) => {
            setAuth({
                token: res?.data?.data?.token,
                name: res?.data?.data?.name,
                role: res?.data?.data?.role,
                email: res?.data?.data?.email,
                profileImage: res?.data?.data?.profileImage,
                isVerified: res?.data?.data?.isVerified
            })
            toast.success(res?.data?.message)
            setIsSubmitting(false)
            router.push('/')
        },
        onError: (err) => {
            console.log(err)
            errorHandler(err)
            setIsSubmitting(false)
        }
    })

    const handleSocialLogin = async (provider: AuthProvider) => {
        setIsSubmitting(true)
        try {
          const result = await signInWithPopup(auth, provider)
          const user = result.user
    
          const res = await instance.post('/auth/login/social', {
            email: user.email,
            name: user.displayName,
            profileImage: user.photoURL,
          })
    
          setAuth({
            token: res?.data?.data?.token,
            name: res?.data?.data?.name,
            role: res?.data?.data?.role,
            email: res?.data?.data?.email,
            profileImage: res?.data?.data?.profileImage,
          })
    
          toast.success(res?.data?.message)
          router.push('/')
        } catch (error) {
          console.error('Social login error:', error)
          errorHandler(error)
        } finally {
          setIsSubmitting(false)
        }
      }

      return (
        <Wrapper>


          <div className="min-h-screen relative">
            {/* Mobile background image */}
            <div className="absolute inset-0 lg:hidden">
              <Image
                src="/assets/images/RajaAmpat.jpg"
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
                  src="/assets/images/RajaAmpat.jpg"
                  alt="Login Image"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
      
              {/* Right side - Form (full width on mobile, 2/5 width on desktop) */}
              <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-8">
                {/* Card wrapper */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 space-y-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-900">Login</h1>
                    <p className="mt-2 text-gray-600">Complete the form to log in as user</p>
                  </div>
      
                  <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginUserSchema}
                    onSubmit={(values) => {
                      setIsSubmitting(true);
                      mutateLoginUser({emailOrUsername: values.email, password: values.password});
                    }}
                  >
                    {({ isValid }) => (
                      <Form className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email or Username
                          </label>
                          <Field
                            name="email"
                            type="text"
                            placeholder="Enter your email or username"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>
      
                        <div className="space-y-2">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <Field
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
                          />
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>
                        <p className="text-start text-sm text-gray-600">
                        Forgot your password?{' '}
                        <a href="/forget-password" className="font-medium text-[#f15b5b] hover:text-[#e54949]">
                          Click here
                        </a>
                      </p>
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
                              Signing in...
                            </span>
                          ) : (
                            'Sign In'
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>
      
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>
      
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSocialLogin(new GoogleAuthProvider())}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:bg-gray-50 active:transform active:scale-[0.99]
                        flex items-center gap-3 text-gray-700 font-medium"
                    >
                      <FaGoogle className="text-red-500 text-xl" />
                      <span className="flex-1 text-center">Continue with Google</span>
                    </button>
      
                    <button
                      onClick={() => handleSocialLogin(new GithubAuthProvider())}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:bg-gray-50 active:transform active:scale-[0.99]
                        flex items-center gap-3 text-gray-700 font-medium"
                    >
                      <FaGithub className="text-black text-xl" />
                      <span className="flex-1 text-center">Continue with Github</span>
                    </button>
                  </div>
      
                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register/user" className="font-medium text-[#f15b5b] hover:text-[#e54949]">
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <section className="footer_one">
            <div className="container">
              <div className="row">
                <Footer />
              </div>
            </div>
          </section>

          {/* Footer Bottom Area */}
          <section className="footer_middle_area pt40 pb40">
            <div className="container">
              <CopyrightFooter />
            </div>
          </section>
        </Wrapper>
      );
}