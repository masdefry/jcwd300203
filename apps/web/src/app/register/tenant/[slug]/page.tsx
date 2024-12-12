'use client';

import { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import Image from 'next/image';
import instance from '@/utils/axiosInstance';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export default function RegisterPage({params}: any) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const idCardImageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (file: File | null) => void,
    setPreview: (url: string | null) => void,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
    };
  }, [profilePreview, idCardPreview]);

  const { mutate: mutateRegisterTenant } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await instance.patch('/auth/register/tenant', formData,
        {
            headers: {
                'Authorization': `Bearer ${params?.slug}`
            }
        });
       
      return res.data;
    },
    onSuccess: (res) => {
      console.log('Registration successful:', res);
      toast.success(res.message);
      setIsSubmitting(false);
      router.push('/login/tenant');
    },
    onError: (err: any) => {
      console.error('Registration failed:', err);
      errorHandler(err);
      setIsSubmitting(false);
    },
  });
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Tenant Registration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{ fullName: '', username: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              if (!profileImage || !idCardImage) {
                toast.error('Both images are required!');
                return;
              }

              setIsSubmitting(true);

              const formData = new FormData();
              formData.append('name', values.fullName);
              formData.append('username', values.username);
              formData.append('password', values.password);
              formData.append('profileImage', profileImage);
              formData.append('idCardImage', idCardImage);

              mutateRegisterTenant(formData);

              console.log([...formData]);
            }}
          >
            <Form className="space-y-6 max-w-md mx-auto">
              <div className="flex space-x-4 mb-6">
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="profileImage">Profile Image</Label>
                  <div className="relative w-full h-40 mb-2 bg-gray-100 rounded-md overflow-hidden">
                    {profilePreview ? (
                      <Image
                        src={profilePreview}
                        alt="Profile Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    ref={profileImageRef}
                    onChange={(e) =>
                      handleImageChange(e, setProfileImage, setProfilePreview)
                    }
                    className="mt-1"
                  />
                </div>
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="idCardImage">ID Card Image</Label>
                  <div className="relative w-full h-40 mb-2 bg-gray-100 rounded-md overflow-hidden">
                    {idCardPreview ? (
                      <Image
                        src={idCardPreview}
                        alt="ID Card Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <Input
                    id="idCardImage"
                    name="idCardImage"
                    type="file"
                    accept="image/*"
                    ref={idCardImageRef}
                    onChange={(e) =>
                      handleImageChange(e, setIdCardImage, setIdCardPreview)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Field
                    as={Input}
                    id="fullName"
                    name="fullName"
                    className="mt-1 w-full"
                  />
                  <ErrorMessage
                    name="fullName"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Field
                    as={Input}
                    id="username"
                    name="username"
                    className="mt-1 w-full"
                  />
                  <ErrorMessage
                    name="username"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    className="mt-1 w-full"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}