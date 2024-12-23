'use client';
import React, { useState, ChangeEvent } from 'react';
import {
  Formik,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  FormikErrors,
  FormikTouched,
} from 'formik';
import { PlusCircle, X, Upload, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import instance from '@/utils/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { errorHandler } from '@/utils/errorHandler';
import * as Yup from 'yup';

const FILE_SIZE = 2 * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Property name is required')
    .min(3, 'Property name must be at least 3 characters'),
  category: Yup.string()
    .required('Property Category is Required')
    .min(3, 'Property Category must be at least 3 characters'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters'),

  description: Yup.string()
    .required('Property description is required')
    .min(20, 'Description must be at least 20 characters'),
    

  city: Yup.string().required('City is required'),

  roomCapacity: Yup.number()
    .required('Room capacity is required')
    .positive('Must be a positive number')
    .integer('Must be a whole number'),

  mainImage: Yup.mixed()
    .required('Main image is required')
    .test(
      'fileSize',
      'File is too large',
      (value) => !value || (value && value.size <= FILE_SIZE),
    )
    .test(
      'fileFormat',
      'Unsupported file type',
      (value) => !value || (value && SUPPORTED_FORMATS.includes(value.type)),
    ),

  propertyImages: Yup.array().min(
    3,
    'At least three property images is required',
  ),

  facilityIds: Yup.array().min(
    1,
    'At least one property facility must be selected',
  ),

  roomTypes: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
        .required('Room name is required')
        .min(3, 'Room name must be at least 3 characters')
        .test(
          'unique',
          'Room names must be unique',
          function(value) {
            const formValues = this.from?.[1]?.value;
            if (!formValues?.roomTypes) return true;
            
            const nameCount = formValues.roomTypes.filter(
              (room: { name: string }) => room.name === value
            ).length;
            
            return !value || nameCount <= 1;
          }
        ),

        price: Yup.number()
          .required('Price is required')
          .positive('Price must be greater than 0'),

        qty: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0')
          .integer('Quantity must be a whole number'),

        description: Yup.string()
          .required('Room description is required')
          .min(10, 'Description must be at least 10 characters'),

        guestCapacity: Yup.number()
          .required('Guest capacity is required')
          .positive('Guest capacity must be greater than 0')
          .integer('Guest capacity must be a whole number'),

        facilities: Yup.array().min(
          1,
          'At least one room facility must be selected',
        ),

        images: Yup.array()
        .min(1, 'At least one room image is required')
        .required('Room images are required'),
      }),
    )
    .min(1, 'At least one room type is required'),
});

interface FacilitiesResponse {
  error: boolean;
  message: string;
  data: {
    propertiesFacilities: Facility[];
    roomFacilities: Facility[];
  };
}

interface RoomType {
  name: string;
  price: string;
  description: string;
  qty: string;
  guestCapacity: string;
  facilities: number[];
  newFacility: string;
  images: File[];
}

interface FormValues {
  name: string;
  address: string;
  description: string;
  city: string;
  category: string;
  roomCapacity: string;
  mainImage: File | null;
  propertyImages: File[];
  newFacility: string;
  facilityIds: number[];
  facilities: any[]; 
  roomTypes: RoomType[];
}

interface Facility {
  id: number;
  name: string;
  icon: string;
  type: 'PROPERTY' | 'ROOM';
}

interface ImagePreviews {
  [key: number]: string[];
}

interface FacilitiesSectionProps {
  values: FormValues;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => Promise<void | FormikErrors<FormValues>>;
  type: 'PROPERTY' | `ROOM-${number}`;
  errors: FormikErrors<FormValues>;
  touched: FormikTouched<FormValues>;
}

// API functions
const fetchFacilities = async (): Promise<FacilitiesResponse> => {
  const response = await instance.get('/property/facilites');
  return response.data;
};

const dialogConfig = {
  defaultProps: {
    className: '!bg-transparent',
  },
};

const PropertyListingForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState<string[]>(
    [],
  );
  const [roomImagePreviews, setRoomImagePreviews] = useState<ImagePreviews>({});
  const [newFacilityIcon, setNewFacilityIcon] = useState<File | null>(null);
  const [newFacilityIconPreview, setNewFacilityIconPreview] = useState<
    string | null
  >(null);
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [newFacilityType, setNewFacilityType] = useState<'PROPERTY' | 'ROOM'>(
    'PROPERTY',
  );

  // Fetch facilities
  const { data: facilitiesData, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: fetchFacilities,
  });

  console.log(facilitiesData);
  // Add this function to handle new facility icon upload
  const handleFacilityIconChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewFacilityIcon(file);
      setNewFacilityIconPreview(URL.createObjectURL(file));
    }
  };

  // Create facility mutation
  const createFacilityMutation = useMutation({
    mutationFn: async (formData: FormData): Promise<any> => {
      const res = await instance.post('/property/facilities/create', formData);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setIsAddingFacility(false);
      setNewFacilityIcon(null);
      setNewFacilityIconPreview(null);
      toast.success(res?.message);
    },
    onError: (err) => {
      errorHandler(err);
    },
  });

  const { mutate: mutateCreateProperty, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const formData = new FormData();
      
      // Add basic fields
      formData.append("name", values.name);
      formData.append("address", values.address);
      formData.append("city", values.city);
      formData.append("category", values.category);
      formData.append("description", values.description);
      formData.append("roomCapacity", values.roomCapacity);
      formData.append("facilityIds", JSON.stringify(values.facilityIds));
  
      // Add main image
      if (values.mainImage) {
        formData.append("mainImage", values.mainImage);
      }
  
      // Add property images
      values.propertyImages.forEach((image) => {
        formData.append("propertyImages", image);
      });
  
      // Process room types
      const roomTypesData = values.roomTypes.map((room) => ({
        name: room.name,
        price: room.price,
        description: room.description,
        qty: room.qty,
        guestCapacity: room.guestCapacity,
        facilities: room.facilities,
      }));
      formData.append("roomTypes", JSON.stringify(roomTypesData));
  
      // Add room type images
      values.roomTypes.forEach((roomType, index) => {
        if (roomType.images && roomType.images.length > 15) {
          throw new Error(`Too many images for room type ${index}. Maximum allowed is 15.`);
        }
        roomType.images?.forEach((image) => {
          formData.append(`roomTypeImages${index}`, image);
        });
      });
  
      // Debugging FormData
      for (let [key, value] of formData.entries()) {
        console.log("FormData field:", key, value);
      }
  
      const response = await instance.post("/property", formData);
  
      return response.data;
    },
    onError: (err) => {
     errorHandler(err)
    },
    onSuccess: (res) => {
      toast.success(res.message);
      console.log("Property created successfully:", res);
    },
  });

  // Combine property and room facilities
  const facilities = React.useMemo(() => {
    if (!facilitiesData) return [];
    return [
      ...facilitiesData.data.propertiesFacilities.map((f) => ({
        ...f,
        type: 'PROPERTY' as const,
      })),
      ...facilitiesData.data.roomFacilities.map((f) => ({
        ...f,
        type: 'ROOM' as const,
      })),
    ];
  }, [facilitiesData]);

  // Add this component for the new facility dialog
  const AddFacilityDialog: React.FC<{
    type: 'PROPERTY' | 'ROOM';
  }> = ({ type }) => {
    const [name, setName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [facilityIcon, setFacilityIcon] = useState<File | null>(null);
    const [facilityIconPreview, setFacilityIconPreview] = useState<
      string | null
    >(null);

    const handleFacilityIconChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.type !== 'image/svg+xml') {
          toast.error('Only SVG files are allowed.');
          return;
        }
        if (file.size > 1048576) {
          toast.error('File size must not exceed 1 MB.');
          return;
        }
        setFacilityIcon(file);
        setFacilityIconPreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (name && facilityIcon) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type === 'PROPERTY' ? 'property' : 'room');
        formData.append('icon', facilityIcon);

        createFacilityMutation.mutate(formData, {
          onSuccess: () => {
            setDialogOpen(false);
            setName('');
            setFacilityIcon(null);
            setFacilityIconPreview(null);
          },
        });
      }
    };

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md !bg-white"
          onClick={(e) => e.stopPropagation()} // Prevent dialog close on content click
        >
          <DialogHeader>
            <DialogTitle>
              Add New{' '}
              {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}{' '}
              Facility
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Facility Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex items-center gap-4">
                {facilityIconPreview ? (
                  <div className="relative">
                    <img
                      src={facilityIconPreview}
                      alt="Icon preview"
                      className="w-12 h-12 object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFacilityIcon(null);
                        setFacilityIconPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex items-center justify-center w-12 h-12 border-2 border-dashed rounded cursor-pointer hover:border-blue-500"
                    onClick={(e) => e.stopPropagation()} // Prevent dialog close on input click
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFacilityIconChange}
                      className="hidden"
                    />
                    <Plus className="w-6 h-6 text-gray-400" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={
                  !name || !facilityIcon || createFacilityMutation.isPending
                }
              >
                {createFacilityMutation.isPending
                  ? 'Adding...'
                  : 'Add Facility'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
    values,
    setFieldValue,
    type,
    errors,
    touched,
  }) => {
    // Filter facilities based on type
    const filteredFacilities = React.useMemo(() => {
      if (!facilitiesData) return [];

      const isProperty = type === 'PROPERTY';
      return isProperty
        ? facilitiesData.data.propertiesFacilities
        : facilitiesData.data.roomFacilities;
    }, [facilitiesData, type]);

    // Get the current facilities array based on type
    const getCurrentFacilities = () => {
      if (type === 'PROPERTY') {
        return values.facilityIds;
      } else {
        const roomIndex = parseInt(type.split('-')[1]);
        return values.roomTypes[roomIndex].facilities;
      }
    };

    // Handle facility selection
    const handleFacilitySelect = (facilityId: string) => {
      const id = parseInt(facilityId);
      const currentFacilities = getCurrentFacilities();

      if (!currentFacilities.includes(id)) {
        if (type === 'PROPERTY') {
          setFieldValue('facilityIds', [...values.facilityIds, id]);
        } else {
          const roomIndex = parseInt(type.split('-')[1]);
          const updatedRoomTypes = [...values.roomTypes];
          updatedRoomTypes[roomIndex].facilities = [
            ...updatedRoomTypes[roomIndex].facilities,
            id,
          ];
          setFieldValue('roomTypes', updatedRoomTypes);
        }
      }
    };

    // Handle facility removal
    const handleFacilityRemove = (facilityId: number) => {
      if (type === 'PROPERTY') {
        setFieldValue(
          'facilityIds',
          values.facilityIds.filter((id) => id !== facilityId),
        );
      } else {
        const roomIndex = parseInt(type.split('-')[1]);
        const updatedRoomTypes = [...values.roomTypes];
        updatedRoomTypes[roomIndex].facilities = updatedRoomTypes[
          roomIndex
        ].facilities.filter((id) => id !== facilityId);
        setFieldValue('roomTypes', updatedRoomTypes);
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            {type === 'PROPERTY' ? 'Property' : 'Room'} Facilities
          </label>
          <AddFacilityDialog type={type === 'PROPERTY' ? 'PROPERTY' : 'ROOM'} />
        </div>
        <Select onValueChange={handleFacilitySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select facility" />
          </SelectTrigger>
          <SelectContent>
            {filteredFacilities.map((facility) => (
              <SelectItem key={facility.id} value={facility.id.toString()}>
                <div className="flex items-center gap-2">
                  <img
                    src={`http://localhost:4700/images/${facility.icon}`}
                    alt={facility.name}
                    className="w-4 h-4"
                  />
                  <span>{facility.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 mt-2">
          {getCurrentFacilities().map((facilityId) => {
            // Filter facilities based on the current type
            const facilityList =
              type === 'PROPERTY'
                ? facilitiesData?.data.propertiesFacilities
                : facilitiesData?.data.roomFacilities;

            const facility = facilityList?.find((f) => f.id === facilityId);
            if (!facility) return null;

            return (
              <div
                key={facility.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <img
                  src={`http://localhost:4700/images/${facility.icon}`}
                  alt={facility.name}
                  className="w-4 h-4"
                />
                <span>{facility.name}</span>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleFacilityRemove(facility.id)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
        {type === 'PROPERTY'
          ? touched.facilityIds &&
            errors.facilityIds && (
              <div className="text-red-500 text-sm mt-1">
                {errors.facilityIds as string}
              </div>
            )
          : touched.roomTypes?.[parseInt(type.split('-')[1])]?.facilities &&
            errors.roomTypes?.[parseInt(type.split('-')[1])]?.facilities && (
              <div className="text-red-500 text-sm mt-1">
                {
                  errors.roomTypes?.[parseInt(type.split('-')[1])]
                    ?.facilities as string
                }
              </div>
            )}
      </div>
    );
  };

  const initialValues: FormValues = {
    name: '',
    address: '',
    description: '',
    city: '',
    category: '',
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
    event: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFieldValue('mainImage', files[0]);
      setMainImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handlePropertyImagesChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    values: FormValues,
  ) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPropertyImagePreviews([...propertyImagePreviews, ...newPreviews]);
      setFieldValue('propertyImages', [
        ...values.propertyImages,
        ...filesArray,
      ]);
    }
  };

  const handleRoomImagesChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    values: FormValues,
    index: number,
  ) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setRoomImagePreviews({
        ...roomImagePreviews,
        [index]: [...(roomImagePreviews[index] || []), ...newPreviews],
      });
      const updatedRoomTypes = [...values.roomTypes];
      updatedRoomTypes[index].images = [
        ...(updatedRoomTypes[index].images || []),
        ...filesArray,
      ];
      setFieldValue('roomTypes', updatedRoomTypes);
    }
  };

  const handleSubmit = (values: FormValues) => {
    console.log(values);
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('roomCapacity', values.roomCapacity);
    formData.append('facilityIds', JSON.stringify(values.facilityIds));
  

    if (values.mainImage) {
      formData.append('mainImage', values.mainImage);
    }
  
    values.propertyImages.forEach(image => {
      formData.append('propertyImages', image);
    });
  
    const roomTypesData = values.roomTypes.map(room => ({
      name: room.name,
      price: room.price,
      description: room.description,
      qty: room.qty,
      guestCapacity: room.guestCapacity,
      facilities: room.facilities
    }));
  
    formData.append('roomTypes', JSON.stringify(roomTypesData));
  
    values.roomTypes.forEach((roomType, index) => {
      if (roomType.images && roomType.images.length > 0) {
        roomType.images.forEach(image => {
          formData.append(`roomTypeImages${index}`, image);
        });
      }
    });
  
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
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
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="space-y-6">
                {/* Basic Property Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Property Name
                    </label>
                    <Field
                      name="name"
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                        touched.name && errors.name ? 'border-red-500' : ''
                      }`}
                      type="text"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Property Category
                    </label>
                    <Field
                      name="category"
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                        touched.category && errors.category ? 'border-red-500' : ''
                      }`}
                      type="text"
                    />
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <Field
                      name="address"
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                        touched.name && errors.name ? 'border-red-500' : ''
                      }`}
                      type="text"
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Field
                        name="city"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                          touched.name && errors.name ? 'border-red-500' : ''
                        }`}
                        type="text"
                      />
                      <ErrorMessage
                        name="city"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Room Capacity
                      </label>
                      <Field
                        name="roomCapacity"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                          touched.name && errors.name ? 'border-red-500' : ''
                        }`}
                        type="number"
                      />
                      <ErrorMessage
                        name="roomCapacity"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Property Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[100px] ${
                      touched.description && errors.description
                        ? 'border-red-500'
                        : ''
                    }`}
                    placeholder="Describe your property..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Property Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>

                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Main Image
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {mainImagePreview ? (
                            <img
                              src={mainImagePreview}
                              alt="Preview"
                              className="h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                Click to upload main image
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleMainImageChange(e, setFieldValue)
                            }
                          />
                        </label>
                      </div>
                    </div>
                    {touched.mainImage && errors.mainImage && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.mainImage as string}
                      </div>
                    )}
                  </div>

                  {/* Additional Property Images */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Additional Property Images
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              Click to upload property images
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handlePropertyImagesChange(
                                e,
                                setFieldValue,
                                values,
                              )
                            }
                          />
                        </label>
                      </div>
                      {touched.propertyImages && errors.propertyImages && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.propertyImages as string}
                        </div>
                      )}
                      {propertyImagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          {propertyImagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                                onClick={() => {
                                  const newPreviews =
                                    propertyImagePreviews.filter(
                                      (_, i) => i !== index,
                                    );
                                  setPropertyImagePreviews(newPreviews);
                                  setFieldValue(
                                    'propertyImages',
                                    values.propertyImages.filter(
                                      (_, i) => i !== index,
                                    ),
                                  );
                                }}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Facilities */}
                  <FacilitiesSection
                    values={values}
                    setFieldValue={setFieldValue}
                    type="PROPERTY"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                {/* Room Types Section */}
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
                            })
                          }
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Room Type
                        </button>
                      </div>

                      {values.roomTypes.map((roomType, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-md font-medium">
                                Room Type #{index + 1}
                              </h4>
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
                                <label className="block text-sm font-medium mb-1">
                                  Room Name
                                </label>
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
                                <label className="block text-sm font-medium mb-1">
                                  Price
                                </label>
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
                                <label className="block text-sm font-medium mb-1">
                                  Quantity
                                </label>
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
                                <label className="block text-sm font-medium mb-1">
                                  Guest Capacity
                                </label>
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

                            {/* Room Description - Now outside the grid */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Room Description
                              </label>
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

                            {/* Room Images */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Room Images
                              </label>
                              <div className="mt-2">
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                      <p className="mb-2 text-sm text-gray-500">
                                        Click to upload room images
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) =>
                                        handleRoomImagesChange(
                                          e,
                                          setFieldValue,
                                          values,
                                          index,
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                                {roomImagePreviews[index]?.length > 0 && (
                                  <div className="grid grid-cols-4 gap-4 mt-4">
                                    {roomImagePreviews[index].map(
                                      (preview, imgIndex) => (
                                        <div
                                          key={imgIndex}
                                          className="relative"
                                        >
                                          <img
                                            src={preview}
                                            alt={`Room ${index + 1} Preview ${imgIndex + 1}`}
                                            className="w-full h-24 object-cover rounded"
                                          />
                                          <button
                                            type="button"
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                                            onClick={() => {
                                              const newPreviews = {
                                                ...roomImagePreviews,
                                              };
                                              newPreviews[index] = newPreviews[
                                                index
                                              ].filter(
                                                (_, i) => i !== imgIndex,
                                              );
                                              setRoomImagePreviews(newPreviews);

                                              const updatedRoomTypes = [
                                                ...values.roomTypes,
                                              ];
                                              updatedRoomTypes[index].images =
                                                updatedRoomTypes[
                                                  index
                                                ].images.filter(
                                                  (_, i) => i !== imgIndex,
                                                );
                                              setFieldValue(
                                                'roomTypes',
                                                updatedRoomTypes,
                                              );
                                            }}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                                {touched.roomTypes?.[index]?.images && 
                                  typeof errors.roomTypes?.[index] === 'object' && 
                                    'images' in errors.roomTypes[index] && (
                                       <div className="text-red-500 text-sm mt-1">
                                      {(errors.roomTypes[index] as FormikErrors<RoomType>).images as string}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Room Facilities */}
                            <FacilitiesSection
                              values={values}
                              setFieldValue={setFieldValue}
                              type={`ROOM-${index}`}
                              errors={errors}
                              touched={touched}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </FieldArray>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    onClick={() => mutateCreateProperty(values)}
                    disabled={isPending}
                    className={`px-6 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${isPending 
                        ? 'bg-blue-300 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                  >
                    {isPending ? 'Creating Property...' : 'Submit Property'}
                  </button>
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
