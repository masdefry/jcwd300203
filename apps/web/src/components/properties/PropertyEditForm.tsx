import { Formik, Form } from 'formik';
import { BasicInformation } from '@/components/properties/BasicInformation';
import { FacilitiesSection } from '@/components/properties/FacilitiesSection';
import { PropertyDetailsRoomSection } from '@/components/properties/PropertyDetailsRoomSection';
import { ImageUploadSection } from '@/components/properties/ImageUploadSection';
import { usePropertyForm } from '@/features/properties/hooks/usePropertyForm';
import { editPropertyValidationSchema } from '@/features/schemas/propertyValidationSchema';
import { useEditProperty } from '@/features/properties/hooks/mutations/mutateEditProperty';
import { getImageUrl } from '@/utils/getImageUrl';
import { useEffect, useRef } from 'react';

interface PropertyEditFormProps {
  property: any; // Type this based on your property type
  onEditComplete?: () => void;
}

export function PropertyEditForm({ property, onEditComplete }: PropertyEditFormProps) {
  const {
    mainImagePreview,
    propertyImagePreviews,
    roomImagePreviews,
    handleImagePreview,
    isPending,
  } = usePropertyForm();
  
  const { mutateAsync: mutateEditProperty, isSubmitting } = useEditProperty();

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    console.log('Submit Values:', values);

    const propertyData = {
      name: values.name,
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
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
            id: sp.id,
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

    formData.append('data', JSON.stringify(propertyData));

    if (values.mainImage instanceof File) formData.append('mainImage', values.mainImage);

    const newPropertyImages = values.propertyImages.filter(
      (img: any) => img instanceof File,
    );
    newPropertyImages.forEach((image: File) => {
      formData.append('propertyImages', image);
    });

    values.roomTypes.forEach((room: any, index: number) => {
      if (room.id) {
        const newRoomImages = room.images?.filter((img: any) => img instanceof File) || [];
        newRoomImages.forEach((image: File) => {
          formData.append(`roomTypeImages${index}`, image);
        });
      } else {
        const newRoomImages = room.images?.filter((img: any) => img instanceof File) || [];
        newRoomImages.forEach((image: File) => {
          formData.append(`roomTypeImages${10000 + index}`, image);
        });
      }
    });

    try {
      await mutateEditProperty({
        id: property.id,
        formData,
      });
      onEditComplete?.();
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const initialPreviewsSet = useRef(false);

  useEffect(() => {
    if (property && !initialPreviewsSet.current) {
      if (property.mainImage) {
        handleImagePreview.setMainImage(getImageUrl(property.mainImage));
      }

      if (property.images?.length) {
        const propertyImagesWithUrls = property.images.map((img: any) => ({
          ...img,
          url: getImageUrl(img.url),
        }));
        handleImagePreview.setPropertyImages(propertyImagesWithUrls);
      }

      if (property.roomTypes?.length) {
        property.roomTypes.forEach((room: any, index: number) => {
          if (room.images?.length) {
            const roomImagesWithUrls = room.images.map((img: any) => ({
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

  const getInitialValues = () => ({
    name: property.name || '',
    address: property.address || '',
    description: property.description || '',
    city: property.city || '',
    categoryId: property.category?.id?.toString() || '',
    roomCapacity: property.roomCapacity || '',
    mainImage: property.mainImage || '',
    propertyImages: property.images || [],
    newFacility: '',
    facilityIds: property.facilities?.map((f: any) => f.id) || [],
    facilities: property.facilities || [],
    roomTypes: property.roomTypes.map((room: any) => ({
      id: room.id,
      name: room.name || '',
      price: room.price || '',
      description: room.description || '',
      qty: room.quantity || 0,
      guestCapacity: room.guestCapacity || 0,
      facilities: room.facilities?.map((f: any) => f.id) || [],
      images: room.images || [],
      specialPrice: room.flexiblePrices
        ?.filter((sp: any) => {
          return sp.id || (sp.startDate && sp.endDate && sp.price);
        })
        .map((sp: any) => ({
          id: sp.id,
          startDate: sp.startDate,
          endDate: sp.endDate,
          price: sp.price,
        })),
      unavailableDates: room.unavailableDates
        ?.filter((period: any) => {
          return period.id || (period.startDate && period.endDate);
        })
        .map((period: any) => ({
          id: period.id,
          startDate: period.startDate,
          endDate: period.endDate,
          reason: period.reason,
          type: period.type || 'BLOCKED',
        })),
      specialPricesToDelete: [],
      unavailabilityToDelete: [],
    })) || [],
  });

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={editPropertyValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={false}
    >
      {({ values, setFieldValue, errors, touched, isValid, dirty }) => (
        <Form className="space-y-6">
          <BasicInformation />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            <ImageUploadSection
              title="Main Image"
              preview={mainImagePreview || getImageUrl(property.mainImage)}
              onMainImageChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFieldValue('mainImage', file);
                  handleImagePreview.setMainImage(file);
                }
              }}
              error={touched.mainImage ? (errors.mainImage as string) : undefined}
            />

            <ImageUploadSection
              title="Additional Property Images"
              preview={null}
              previewList={
                propertyImagePreviews?.length
                  ? propertyImagePreviews
                  : property.images?.map((img: any) => getImageUrl(img.url))
              }
              onMultipleImageChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleImagePreview.addPropertyImages(files);
                setFieldValue('propertyImages', [...(values.propertyImages || []), ...files]);
              }}
              onRemoveImage={(index) => {
                handleImagePreview.removePropertyImage(index);
                const newImages = values.propertyImages?.filter((_: any, i: number) => i !== index) || [];
                setFieldValue('propertyImages', newImages);
              }}
              error={touched.propertyImages ? (errors.propertyImages as string) : undefined}
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
              disabled={isPending || isSubmitting}
              className={`px-6 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isPending || isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isSubmitting ? 'Updating Property...' : 'Update Property'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}