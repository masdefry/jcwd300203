import React from 'react';
import { Field, FieldArray, ErrorMessage } from 'formik';
import { Card } from '@/components/ui/card';
import { PlusCircle, X } from 'lucide-react';
import { ImageUploadSection } from './ImageUploadSection';
import { FacilitiesSection } from './FacilitiesSection';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PropertyDetailsRoomSectionProps } from '@/features/types/property';

export const PropertyDetailsRoomSection: React.FC<PropertyDetailsRoomSectionProps> = ({
  values,
  setFieldValue,
  errors,
  touched,
  roomImagePreviews,
  handleImagePreview,
}) => {
  const handleRoomImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    roomIndex: number
  ) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      handleImagePreview.addRoomImages(filesArray, roomIndex);
      const updatedRoomTypes = [...values.roomTypes];
      updatedRoomTypes[roomIndex].images = [
        ...(updatedRoomTypes[roomIndex].images || []),
        ...filesArray,
      ];
      setFieldValue('roomTypes', updatedRoomTypes);
    }
  };

  const getErrorMessage = (index: number) => {
    if (touched.roomTypes?.[index]?.images && errors.roomTypes?.[index]) {
      const roomError = errors.roomTypes[index];
      return typeof roomError === 'object' && 'images' in roomError ? String(roomError.images) : undefined;
    }
    return undefined;
  };
  
  const onRemoveImage = (roomIndex: number, imageIndex: number) => {
    handleImagePreview.removeRoomImage(roomIndex, imageIndex);
    const updatedRoomTypes = [...values.roomTypes];
    updatedRoomTypes[roomIndex].images = updatedRoomTypes[roomIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setFieldValue('roomTypes', updatedRoomTypes);
  };
  console.log('values from room section:',values)
  return (
    <FieldArray name="roomTypes">
      {({ push, remove }) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Room Types</h3>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() =>
                push({
                  name: '',
                  price: '',
                  description: '',
                  qty: '',
                  guestCapacity: '',
                  facilities: [],
                  newFacility: '',
                  images: [],
                  specialPrice: []
                })
              }
            >
              <PlusCircle className="w-4 h-4" />
              Add Room Type
            </button>
          </div>

          {values.roomTypes.map((roomType: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                {/* Existing room fields */}
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">Room Type #{index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => remove(index)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Room Name</label>
                    <Field
                      name={`roomTypes.${index}.name`}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      type="text"
                    />
                    <ErrorMessage
                      name={`roomTypes.${index}.name`}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Base Price</label>
                    <Field
                      name={`roomTypes.${index}.price`}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      type="number"
                    />
                    <ErrorMessage
                      name={`roomTypes.${index}.price`}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Field
                      name={`roomTypes.${index}.qty`}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      type="number"
                    />
                    <ErrorMessage
                      name={`roomTypes.${index}.qty`}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Guest Capacity</label>
                    <Field
                      name={`roomTypes.${index}.guestCapacity`}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      type="number"
                    />
                    <ErrorMessage
                      name={`roomTypes.${index}.guestCapacity`}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div>
  <label className="block text-sm font-medium mb-1">Room Description</label>
  <Field
    as="textarea"
    name={`roomTypes.${index}.description`}
    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[100px]"
    placeholder="Describe this room type..."
  />
  <ErrorMessage
    name={`roomTypes.${index}.description`}
    component="div"
    className="text-red-500 text-sm mt-1"
  />
</div>

                <ImageUploadSection
                  title="Room Images"
                  preview={null}
                  previewList={roomImagePreviews[index] || []}
                  onMultipleImageChange={(e) => handleRoomImagesChange(e, index)}
                  onRemoveImage={(imageIndex) => onRemoveImage(index, imageIndex)}
                  error={getErrorMessage(index)}
                  multiple
                />

                <FacilitiesSection
                  values={values}
                  setFieldValue={setFieldValue}
                  type={`ROOM-${index}`}
                  errors={errors}
                  touched={touched}
                />

                {/* Special Pricing Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">Special Pricing</h4>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => {
                        const updatedRoomTypes = [...values.roomTypes];
                        if (!updatedRoomTypes[index].specialPrice) {
                          updatedRoomTypes[index].specialPrice = [];
                        }
                        updatedRoomTypes[index].specialPrice.push({
                          date: new Date(),
                          price: ''
                        });
                        setFieldValue('roomTypes', updatedRoomTypes);
                      }}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Special Price
                    </button>
                  </div>

                  <FieldArray name={`roomTypes.${index}.specialPrice`}>
                    {({ remove: removePrice }) => (
                      <div className="space-y-2">
                        {roomType.specialPrice?.map((specialPrice: any, priceIndex: number) => (
                          <div key={priceIndex} className="flex items-end gap-4 p-3 border rounded">
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">Date</label>
                              <DatePicker
                                selected={specialPrice.date ? new Date(specialPrice.date) : null}
                                onChange={(date) => {
                                  const updatedRoomTypes = [...values.roomTypes];
                                  updatedRoomTypes[index].specialPrice[priceIndex].date = date;
                                  setFieldValue('roomTypes', updatedRoomTypes);
                                }}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dateFormat="MMMM d, yyyy"
                                minDate={new Date()}
                              />
                            </div>

                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">Special Price</label>
                              <Field
                                name={`roomTypes.${index}.specialPrice.${priceIndex}.price`}
                                type="number"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removePrice(priceIndex)}
                              className="text-red-500 hover:text-red-700 mb-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </FieldArray>
  );
};