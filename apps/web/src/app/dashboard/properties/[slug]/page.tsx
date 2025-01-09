'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Formik, Form } from 'formik';
import { BasicInformation } from '@/components/properties/BasicInformation';
import { FacilitiesSection } from '@/components/properties/FacilitiesSection';
import { PropertyDetailsRoomSection } from '@/components/properties/PropertyDetailsRoomSection';
import { ImageUploadSection } from '@/components/properties/ImageUploadSection';
import { usePropertyForm } from '@/features/properties/hooks/usePropertyForm';
import { editPropertyValidationSchema, propertyValidationSchema } from '@/features/schemas/propertyValidationSchema';
import { usePropertyDetailsTenant } from '@/features/properties/hooks/queries/queryPropertyDetailsTenant';
import { getImageUrl } from '@/utils/getImageUrl';
import { useEditProperty } from '@/features/properties/hooks/mutations/mutateEditProperty';
import LoadingWithSpinner from '@/components/Loading';
import NotFound from '@/components/404';

const PropertyDetailsPage = () => {
  const { property, isLoading, propertyId } = usePropertyDetailsTenant();
  const {
    mainImagePreview,
    propertyImagePreviews,
    roomImagePreviews,
    handleImagePreview,
    isPending,
  } = usePropertyForm();
  const mutateEditProperty = useEditProperty();
  const {mutateAsync, isSubmitting} = useEditProperty();

  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    // Prepare the property data
    const propertyData = {
      name: values.name,
      address: values.address,
      city: values.city,
      categoryId: values.categoryId,
      description: values.description,
      roomCapacity: values.roomCapacity,
      facilityIds: values.facilityIds,
      // Include mainImage in propertyData only if it's not a new file
      ...(!(values.mainImage instanceof File) && { mainImage: values.mainImage }),
      roomTypesToUpdate: values.roomTypes
        .filter((room: any) => room.id)
        .map((room: any) => ({
          ...room,
          images:
            room.images?.filter((img: any) => !(img instanceof File)) || [],
        })),
      roomTypesToAdd: values.roomTypes
        .filter((room: any) => !room.id)
        .map((room: any) => ({
          ...room,
          images:
            room.images?.filter((img: any) => !(img instanceof File)) || [],
        })),
    };

    // Add the property data
    formData.append('data', JSON.stringify(propertyData));

    // Handle main image
    if (values.mainImage instanceof File) formData.append('mainImage', values.mainImage);

    // Handle property images
    const newPropertyImages = values.propertyImages.filter(
      (img: any) => img instanceof File,
    );
    newPropertyImages.forEach((image: File) => {
      formData.append('propertyImages', image);
    });

    // Handle room images for existing rooms
    values.roomTypes.forEach((room: any, index: number) => {
      if (room.id) {
        // Handle existing room images
        const newRoomImages =
          room.images?.filter((img: any) => img instanceof File) || [];
        newRoomImages.forEach((image: File) => {
          formData.append(`roomTypeImages${index}`, image);
        });
      } else {
        // Handle new room images
        const newRoomImages =
          room.images?.filter((img: any) => img instanceof File) || [];
        newRoomImages.forEach((image: File) => {
          formData.append(`roomTypeImages${10000 + index}`, image);
        });
      }
    });

    try {
      await mutateEditProperty.mutateAsync({
        id: propertyId,
        formData,
      });
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  // Use a ref to track if initial previews have been set
  const initialPreviewsSet = React.useRef(false);

  React.useEffect(() => {
    if (property && !initialPreviewsSet.current) {
      if (property.mainImage) {
        handleImagePreview.setMainImage(getImageUrl(property.mainImage));
      }

      if (property.images?.length) {
        const propertyImagesWithUrls = property.images.map((img) => ({
          ...img,
          url: getImageUrl(img.url),
        }));
        handleImagePreview.setPropertyImages(propertyImagesWithUrls);
      }

      if (property.roomTypes?.length) {
        property.roomTypes.forEach((room, index) => {
          if (room.images?.length) {
            const roomImagesWithUrls = room.images.map((img) => ({
              ...img,
              url: getImageUrl(img.url),
            }));
            handleImagePreview.setRoomImages(roomImagesWithUrls, index);
          }
        });
      }

      initialPreviewsSet.current = true;
    }
  }, [property]);

  if (isLoading) return <LoadingWithSpinner />;

  if (!property) return <NotFound />;

  const getInitialValues = () => ({
    name: property.name || '',
    address: property.address || '',
    description: property.description || '',
    city: property.city || '',
    categoryId: property.categoryId || '',
    roomCapacity: property.roomCapacity || '',
    mainImage: property.mainImage || '',
    propertyImages: property.images || [],
    newFacility: '',
    facilityIds: property.facilities?.map((f) => f.id) || [],
    facilities: property.facilities || [],
    roomTypes:
      property.roomTypes.map((room) => ({
        id: room.id,
        name: room.name || '',
        price: room.price || '',
        description: room.description || '',
        qty: room.quantity || 0,
        guestCapacity: room.guestCapacity || 0,
        facilities: room.facilities?.map((f) => f.id) || [],
        images: room.images || [],
        specialPrice:
          room.specialPrice?.map((sp) => ({
            id: sp.id,
            date: new Date(sp.date),
            price: sp.price,
          })) || [],
      })) || [],
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={getInitialValues()}
            validationSchema={editPropertyValidationSchema}
            onSubmit={(values) => {
                console.log('Submitting Values:', values);
                handleSubmit(values);
              }}
            enableReinitialize={false}
          >
            {({ values, setFieldValue, errors, touched, isValid, dirty, isSubmitting }) => (
              <Form className="space-y-6">
                <BasicInformation />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>
                  <ImageUploadSection
                    title="Main Image"
                    preview={
                      mainImagePreview || getImageUrl(property.mainImage)
                    }
                    onMainImageChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFieldValue('mainImage', file);
                        handleImagePreview.setMainImage(file);
                      }
                    }}
                    error={
                      touched.mainImage
                        ? (errors.mainImage as string)
                        : undefined
                    }
                  />

                  <ImageUploadSection
                    title="Additional Property Images"
                    preview={null}
                    previewList={
                      propertyImagePreviews?.length
                        ? propertyImagePreviews
                        : property.images?.map((img) => getImageUrl(img.url))
                    }
                    onMultipleImageChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleImagePreview.addPropertyImages(files);
                      setFieldValue('propertyImages', [
                        ...(values.propertyImages || []),
                        ...files,
                      ]);
                    }}
                    onRemoveImage={(index) => {
                      handleImagePreview.removePropertyImage(index);
                      const newImages =
                        values.propertyImages?.filter((_, i) => i !== index) ||
                        [];
                      setFieldValue('propertyImages', newImages);
                    }}
                    error={
                      touched.propertyImages
                        ? (errors.propertyImages as string)
                        : undefined
                    }
                    multiple
                  />

                  <FacilitiesSection
                    values={values}
                    setFieldValue={setFieldValue}
                    type="PROPERTY"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <PropertyDetailsRoomSection
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
                    disabled={isPending || isSubmitting || isLoading}
                    className={`px-6 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isPending || isLoading || isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {isSubmitting ? 'Updating Property...' : 'Update Property'}
                  </button>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-semibold mb-2">Form Debug Info:</h3>
                  <div className="space-y-1 text-sm">
                    <p>Form is Valid: {isValid ? '✅' : '❌'}</p>
                    <p>Form is Dirty: {dirty ? '✅' : '❌'}</p>
                    <p>
                      Form Errors: {Object.keys(errors).length ? '❌' : '✅'}
                    </p>

                    {Object.keys(errors).length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Current Errors:</p>
                        <ul className="bg-white p-2 rounded mt-1 overflow-auto max-h-40">
                          {Object.entries(errors).map(([field, error]) => (
                            <li key={field} className="text-red-600">
                              <strong>{field}:</strong>{' '}
                              {typeof error === 'string'
                                ? error
                                : JSON.stringify(error)}
                            </li>
                          ))}
                        </ul>
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

export default PropertyDetailsPage;
