'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Formik, Form } from 'formik';
import { BasicInformation } from '@/components/properties/BasicInformation';
import { FacilitiesSection } from '@/components/properties/FacilitiesSection';
import { RoomTypeSection } from '@/components/properties/RoomTypesSection';
import { usePropertyForm } from '@/features/properties/hooks/usePropertyForm';
import { propertyValidationSchema } from '@/features/schemas/propertyValidationSchema';
import { ImageUploadSection } from '@/components/properties/ImageUploadSection';

const PropertyListingForm: React.FC = () => {
  const {
    mainImagePreview,
    propertyImagePreviews,
    roomImagePreviews,
    handleImagePreview,
    createProperty,
    isPending,
  } = usePropertyForm();

  const initialValues = {
    name: '',
    address: '',
    description: '',
    city: '',
    categoryId: '',
    roomCapacity: '',
    mainImage: null,
    propertyImages: [],
    newFacility: '',
    facilityIds: [],
    facilities: [],
    roomTypes: [
      {
        name: '',
        price: '',
        description: '',
        qty: '',
        guestCapacity: '',
        facilities: [],
        newFacility: '',
        images: [],
      },
    ],
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFieldValue('mainImage', files[0]);
      handleImagePreview.setMainImage(files[0]);
    }
  };

  const handlePropertyImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    values: any,
  ) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      handleImagePreview.addPropertyImages(filesArray);
      setFieldValue('propertyImages', [
        ...values.propertyImages,
        ...filesArray,
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={propertyValidationSchema}
            onSubmit={(values) => {
              console.log('Form submitted with values:', values);
              createProperty(values);
            }}
          >
            {({ values, setFieldValue, errors, touched, isValid, dirty }) => (
              <Form className="space-y-6">
                <BasicInformation />

                {/* Property Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>

                  <ImageUploadSection
                    title="Main Image"
                    preview={mainImagePreview}
                    onMainImageChange={(e) =>
                      handleMainImageChange(e, setFieldValue)
                    }
                    error={
                      touched.mainImage
                        ? (errors.mainImage as string)
                        : undefined
                    }
                  />

                  <ImageUploadSection
                    title="Additional Property Images"
                    preview={null}
                    previewList={propertyImagePreviews}
                    onMultipleImageChange={(e) =>
                      handlePropertyImagesChange(e, setFieldValue, values)
                    }
                    onRemoveImage={(index) => {
                      handleImagePreview.removePropertyImage(index);
                      setFieldValue(
                        'propertyImages',
                        values.propertyImages.filter((_, i) => i !== index),
                      );
                    }}
                    error={
                      touched.propertyImages
                        ? (errors.propertyImages as string)
                        : undefined
                    }
                    multiple={true}
                  />
                  {/* Property Facilities */}
                  <FacilitiesSection
                    values={values}
                    setFieldValue={setFieldValue}
                    type="PROPERTY"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <RoomTypeSection
                  values={values}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                  roomImagePreviews={roomImagePreviews}
                  handleImagePreview={handleImagePreview}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`px-6 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      isPending
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isPending ? 'Creating Property...' : 'Submit Property'}
                  </button>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-2">Form Debug Info:</h3>
                    <div className="space-y-1 text-sm">
                      <p>Form is Valid: {isValid ? '✅' : '❌'}</p>
                      <p>Form is Dirty: {dirty ? '✅' : '❌'}</p>
                      <p>Form Errors: {Object.keys(errors).length ? '❌' : '✅'}</p>
                      {Object.keys(errors).length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Current Errors:</p>
                          <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-40">
                            {JSON.stringify(errors, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListingForm;
