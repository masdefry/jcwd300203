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
import { usePathname, useRouter } from 'next/navigation';
import { isTokenValid } from '@/utils/decodeToken';
import NotFound from '@/components/404';

const validationSchemas = {
  step1: Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    username: Yup.string().required('Username is required'),
  }),
  step2: Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  }),
};

// register page
export default function RegisterPage({ params }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const idCardImageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const token = pathname.split('/')[3];
  const valid = isTokenValid(token);

  const { mutate: mutateRegisterTenant } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await instance.patch('/auth/register/tenant', formData, {
        headers: {
          Authorization: `Bearer ${params?.slug}`,
        },
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      setIsSubmitting(false);
      clearStepData();
      router.push('/login/tenant');
    },
    onError: (err: any) => {
      errorHandler(err);
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    clearStepData();

    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
      clearStepData();
    };
  }, [profilePreview, idCardPreview]);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
    };
  }, [profilePreview, idCardPreview]);

  const saveStepData = (step: number, data: any) => {
    try {
      const key = `register_tenant_step${step}`; 
      console.log(`Saving step ${step} data:`, data);
      sessionStorage.setItem(key, JSON.stringify(data));
   
      const saved = sessionStorage.getItem(key);
      console.log(`Verified save for step ${step}:`, JSON.parse(saved || '{}'));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  if (!valid) return <NotFound />;

  const getStepData = (step: number) => {
    try {
      const key = `register_tenant_step${step}`;
      const data = sessionStorage.getItem(key);
      console.log(`Getting step ${step} data:`, data);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting data:', error);
      return {};
    }
  };

  const clearStepData = () => {
    sessionStorage.removeItem('registerStep1');
    sessionStorage.removeItem('registerStep2');
  };


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

  


  const steps = {
    1: (
      <Formik
        initialValues={{
          fullName: '',
          username: '',
        }}
        validationSchema={validationSchemas.step1}
        onSubmit={(values) => {
          console.log('Saving Step 1:', values); // Debug log
          saveStepData(1, values);
          const savedData = getStepData(1);
          console.log('Verified Step 1 Save:', savedData); // Verify save
          setCurrentStep(2);
        }}
      >
        {({ isValid }) => (
          <Form className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Field
                as={Input}
                id="fullName"
                name="fullName"
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
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
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
              />
              <ErrorMessage
                name="username"
                component="p"
                className="text-red-500 text-sm mt-1"
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
          confirmPassword: '',
        }}
        validationSchema={validationSchemas.step2}
        onSubmit={(values) => {
          console.log('Saving Step 2:', values); // Debug log
          saveStepData(2, values);
          const savedData = getStepData(2);
          console.log('Verified Step 2 Save:', savedData); // Verify save
          setCurrentStep(3);
        }}
      >
        {({ isValid, handleChange, handleBlur, values }) => (
          <Form className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <input // Changed from Field to input
                key="password-field"
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password || ''}
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <input // Changed from Field to input
                key="confirm-password-field"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.confirmPassword || ''}
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f15b5b] focus:border-[#f15b5b] outline-none"
              />
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-1/2 py-3 text-[#f15b5b] border border-[#f15b5b] rounded-lg font-medium hover:bg-[#fff8f8]"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className={`w-1/2 py-3 text-white bg-[#f15b5b] rounded-lg font-medium
                  ${!isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e54949]'}`}
              >
                Next
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    3: (
      <div className="space-y-6">
        <div>
          <Label htmlFor="profileImage">Profile Image</Label>
          <div className="relative w-full h-40 mb-2 bg-gray-100 rounded-lg overflow-hidden">
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="Profile Preview"
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Click to upload profile image
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

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-1/2 py-3 text-[#f15b5b] border border-[#f15b5b] rounded-lg font-medium hover:bg-[#fff8f8]"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() =>
              profileImage
                ? setCurrentStep(4)
                : toast.error('Please upload a profile image')
            }
            className="w-1/2 py-3 text-white bg-[#f15b5b] rounded-lg font-medium hover:bg-[#e54949]"
          >
            Next
          </Button>
        </div>
      </div>
    ),
    4: (
      <div className="space-y-6">
        <div>
          <Label htmlFor="idCardImage">ID Card Image</Label>
          <div className="relative w-full h-40 mb-2 bg-gray-100 rounded-lg overflow-hidden">
            {idCardPreview ? (
              <Image
                src={idCardPreview}
                alt="ID Card Preview"
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Click to upload ID card image
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

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="w-1/2 py-3 text-[#f15b5b] border border-[#f15b5b] rounded-lg font-medium hover:bg-[#fff8f8]"
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              const step1Data = getStepData(1);
              const step2Data = getStepData(2);

              if (!idCardImage) {
                toast.error('Please upload an ID card image');
                return;
              }
              // Validate all required data is present
              if (!step1Data.fullName || !step1Data.username) {
                toast.error(
                  'Missing personal information. Please go back and fill all fields.',
                );
                return;
              }

              if (!step2Data.password) {
                toast.error(
                  'Missing password information. Please go back and fill all fields.',
                );
                return;
              }

              if (!profileImage || !idCardImage) {
                toast.error(
                  'Both profile image and ID card image are required.',
                );
                return;
              }

              
              setIsSubmitting(true);

              const submitFormData = new FormData();
              submitFormData.append('name', step1Data.fullName);
              submitFormData.append('username', step1Data.username);
              submitFormData.append('password', step2Data.password);
              submitFormData.append('profileImage', profileImage);
              submitFormData.append('idCardImage', idCardImage);

              // Log FormData entries
              for (let pair of submitFormData.entries()) {
                console.log(pair[0], pair[1]);
              }

              mutateRegisterTenant(submitFormData);
            }}
            className={`w-1/2 py-3 text-white bg-[#f15b5b] rounded-lg font-medium
    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e54949]'}`}
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </Button>
        </div>
      </div>
    ),
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
              <h1 className="text-3xl font-semibold text-gray-900">
                Complete Registration
              </h1>
              <p className="mt-2 text-gray-600">Step {currentStep} of 4</p>
            </div>

            {steps[currentStep as keyof typeof steps]}
          </div>
        </div>
      </div>
    </div>
  );
}
