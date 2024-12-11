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
import { AuthProvider } from 'firebase/auth'

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
                profileImage: res?.data?.data?.profileImage
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border rounded-xl shadow-lg p-8 space-y-7">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Login</h1>
            <p className="text-gray-500">Complete the form to log in as user</p>
          </div>

          <Formik 
            initialValues={{ email: '', password: '' }}
            validationSchema={loginUserSchema}
            onSubmit={(values) => {
                setIsSubmitting(true)
                mutateLoginUser({emailOrUsername: values.email , password: values.password})
            }}
          >
            {({ isValid }) => (
              <Form className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email or Username</label>
                  <Field
                    name="email"
                    type="text"
                    placeholder="Enter your email or username"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full py-3 bg-blue-600 text-white rounded-lg font-medium 
                    transition-all duration-200 ease-in-out
                    ${isSubmitting || !isValid 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-700 hover:shadow-md active:transform active:scale-[0.99]'} 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
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

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleSocialLogin(new GoogleAuthProvider())}  
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-gray-50 hover:shadow-md active:transform active:scale-[0.99]
                flex items-center gap-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <FaGoogle className="text-red-500 text-xl" />
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleSocialLogin(new GithubAuthProvider())} 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-gray-50 hover:shadow-md active:transform active:scale-[0.99]
                flex items-center gap-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <FaGithub className="text-black text-xl" />
              <span className="flex-1 text-center">Continue with Github</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}