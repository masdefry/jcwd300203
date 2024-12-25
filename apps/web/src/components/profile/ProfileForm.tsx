'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { FileUploadButton } from './SharedComponents';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const profileValidationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    username: Yup.string().required('Username is required'),
    profileImage: Yup.mixed()
      .test('fileSize', 'File size must be less than 1MB', function(value: any) {
        if (!value) return true;
        if (!(value instanceof File)) return true;
        return value.size <= 1024 * 1024;
      })
      .test('fileType', 'Only image files are allowed', function(value: any) {
        if (!value) return true;
        if (!(value instanceof File)) return true;
        return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
      }),
  });
  
interface ProfileFormProps {
  initialValues: {
    name: string;
    username: string;
    profileImage?: File;
  };
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({initialValues, onSubmit, isSubmitting}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
  
    const toggleEditing = () => {
      setIsEditing((prev) => !prev);
    };
   
    const handleSubmit = async (values: any) => {
      await onSubmit(values);
      setIsEditing(false); // Exit editing mode after successful submission
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              ...initialValues,
              profileImage: undefined,
            }}
            validationSchema={profileValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize // This ensures form resets when canceling
          >
            {({ values, handleChange, setFieldValue, errors, touched, resetForm }) => {
            const handleCancel = () => {
                setIsEditing(false);
                resetForm();
              };
            return(
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                  />
                  {touched.name && errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
  
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                  />
                  {touched.username && errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>
  
                {isEditing && (<div className="space-y-2">
                  <label className="text-sm font-medium">Profile Image</label>
                  <FileUploadButton
                    onFileSelect={(file) => setFieldValue('profileImage', file)}
                    accept="image/*"
                    label="Choose Profile Image"
                    disabled={!isEditing || isSubmitting}
                  />
                  {values.profileImage && (
                    <p className="text-sm text-gray-600">
                      Selected: {typeof values.profileImage === 'object' && 
                      ((values.profileImage as unknown) as File)?.name || ''}
                    </p>
                  )}
                  {touched.profileImage && errors.profileImage && (
                    <p className="text-sm text-red-500">{errors.profileImage as string}</p>
                  )}
                </div>)}
  
                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={toggleEditing}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Form>
            )}}
          </Formik>
        </CardContent>
      </Card>
    );
  };