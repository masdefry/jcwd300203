'use client';
import React, { useState } from 'react';
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
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

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
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    console.log('Submit Values:', values);

    const propertyData = {
      name: values.name,
      address: values.address,
      city: values.city,
      categoryId: values.categoryId,
      description: values.description,
      roomCapacity: values.roomCapacity,
      facilityIds: values.facilityIds,
      ...(!(values.mainImage instanceof File) && { mainImage: values.mainImage }),
      roomTypesToUpdate: values.roomTypes
      .filter((room: any) => room.id)
      .map((room: any) => ({
        ...room,
        images: room.images?.filter((img: any) => !(img instanceof File)) || [],
        specialPrice: room.specialPrice?.map((sp: any) => ({
          startDate: sp.startDate,
          endDate: sp.endDate,
          price: sp.price,
        })),
        unavailableDates: room.unavailableDates?.map((period: any) => ({
          startDate: period.startDate,
          endDate: period.endDate,
          reason: period.reason,
        })),
        specialPricesToDelete: room.specialPricesToDelete || [],
        unavailabilityToDelete: room.unavailabilityToDelete || [],
      })),
    roomTypesToAdd: values.roomTypes
      .filter((room: any) => !room.id)
      .map((room: any) => ({
        ...room,
        images: room.images?.filter((img: any) => !(img instanceof File)) || [],
        specialPrice: room.specialPrice?.map((sp: any) => ({
          startDate: sp.startDate,
          endDate: sp.endDate,
          price: sp.price,
        })),
        unavailableDates: room.unavailableDates?.map((period: any) => ({
          startDate: period.startDate,
          endDate: period.endDate,
          reason: period.reason,
        })),
      })),
    };

    // Add the property data
    formData.append('data', JSON.stringify(propertyData));
    console.log('Property Data before JSON:', propertyData);
  
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
  const initialPreviewsSet = useRef(false);

 useEffect(() => {
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
    categoryId: property.category?.id?.toString() || '', // Changed from property.categoryId
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
        room.flexiblePrices?.map((sp) => ({  // Changed from flexiblePrice to flexiblePrices
          id: sp.id,
          startDate: new Date(sp.startDate),
          endDate: new Date(sp.endDate),
          price: sp.price,
        })) || [],
      unavailableDates:
        room.unavailability?.map((u) => ({  // You might need to adjust this based on the new structure
          id: u.id,
          startDate: new Date(u.startDate),
          endDate: new Date(u.endDate),
          reason: u.reason || '',
        })) || [],
      specialPricesToDelete: [], 
      unavailabilityToDelete: [], 
    })) || [],
});

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
        <CardTitle>{isEditing ? 'Edit Property' : property.name}</CardTitle>
        <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="ml-4"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Property'}
         </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
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
              </Form>
            )}
          </Formik>
          ): (
            <div className="space-y-8">
            {/* Property Details View Mode */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Property Category</h3>
                  <p>{property.category?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Room Capacity</h3>
                  <p>{property.roomCapacity}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>{property.address}</p>
              </div>
              <div>
                <h3 className="font-semibold">City</h3>
                <p>{property.city}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{property.description}</p>
              </div>

              {/* Property Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Images</h3>
                <div className="grid grid-cols-4 gap-4">
                  {property.images.map((img) => (
                    <img
                      key={img.id}
                      src={getImageUrl(img.url)}
                      alt="Property"
                      className="rounded-lg w-full h-32 object-cover"
                    />
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.facilities.map((facility) => (
                    <span
                      key={facility.id}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {facility.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Room Types</h3>
                <div className="space-y-4">
                  {property.roomTypes.map((room) => (
                    <Card key={room.id}>
                      <CardHeader>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Price</p>
                            <p>Rp {room.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Capacity</p>
                            <p>{room.guestCapacity} guests</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bookings Section - Only visible when not editing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Bookings</h3>
                <div className="space-y-4">
                  {property.roomTypes.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{room.name}</h4>
                      <div className="space-y-2">
                        {room.currentBookings.map((booking, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <p>Check In: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                            <p>Check Out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                            <p>Rooms Booked: {booking.quantity}</p>
                            <p>Status: {booking.status}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section - Only visible when not editing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                <div className="space-y-4">
                  {property.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0">
                            {review.customer.profileImage ? (
                              <img
                                src={getImageUrl(review.customer.profileImage)}
                                alt={review.customer.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span>{review.customer.name[0]}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{review.customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                        <p>{review.comment}</p>
                        {review.reply && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-600">Reply:</p>
                            <p>{review.reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailsPage;

{/* <div className="p-4 bg-gray-100 rounded-lg">
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
</div> */}