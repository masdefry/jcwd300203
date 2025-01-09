import * as Yup from 'yup';

const FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const propertyValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Property name is required')
      .min(3, 'Property name must be at least 3 characters'),
    categoryId: Yup.string()
      .required('Property Category is Required'),
    address: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters'),
    description: Yup.string()
      .required('Property description is required')
      .min(20, 'Description must be at least 20 characters'),
    city: Yup.string()
      .required('City is required'),
    roomCapacity: Yup.number()
      .required('Room capacity is required')
      .positive('Must be a positive number')
      .integer('Must be a whole number'),
    mainImage: Yup.mixed<File>()
      .required('Main image is required')
      .test(
        'fileSize',
        'File is too large',
        file => !file || (file && file.size <= FILE_SIZE),
      )
      .test(
        'fileFormat',
        'Unsupported file type',
        file => !file || (file && SUPPORTED_FORMATS.includes(file.type)),
      ),
    propertyImages: Yup.array()
      .of(Yup.mixed<File>())
      .min(3, 'At least three property images is required'),
    facilityIds: Yup.array()
      .of(Yup.number())
      .min(1, 'At least one property facility must be selected'),
    roomTypes: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string()
            .required('Room name is required')
            .min(3, 'Room name must be at least 3 characters'),
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
          facilities: Yup.array()
            .of(Yup.number())
            .min(1, 'At least one room facility must be selected'),
          images: Yup.array()
            .of(Yup.mixed<File>())
            .min(1, 'At least one room image is required')
            .required('Room images are required'),
        })
      )
      .min(1, 'At least one room type is required'),
  });

  export const editPropertyValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Property name is required')
      .min(3, 'Property name must be at least 3 characters'),
    categoryId: Yup.string()
      .required('Property Category is required'),
    address: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters'),
    description: Yup.string()
      .required('Property description is required')
      .min(20, 'Description must be at least 20 characters'),
    city: Yup.string()
      .required('City is required'),
    roomCapacity: Yup.number()
      .required('Room capacity is required')
      .positive('Must be a positive number')
      .integer('Must be a whole number'),
    mainImage: Yup.mixed<File | string>()
      .required('Main image is required')
      .test(
        'fileSize',
        'File is too large',
        value => typeof value === 'string' || !value || (value && value.size <= FILE_SIZE),
      )
      .test(
        'fileFormat',
        'Unsupported file type',
        value => typeof value === 'string' || !value || (value && SUPPORTED_FORMATS.includes(value.type)),
      ),
    propertyImages: Yup.array()
      .of(
        Yup.mixed<File | { id: number; url: string }>()
          .test(
            'fileSize',
            'File is too large',
            value => 
              typeof value === 'string' || 
              !value || 
              'url' in value ||
              (value && value.size <= FILE_SIZE),
          )
          .test(
            'fileFormat',
            'Unsupported file type',
            value => 
              typeof value === 'string' || 
              !value || 
              'url' in value ||
              (value && SUPPORTED_FORMATS.includes(value.type)),
          )
      )
      .min(3, 'At least three property images are required'),
    facilityIds: Yup.array()
      .of(Yup.number())
      .min(1, 'At least one property facility must be selected'),
    roomTypes: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number().nullable(),
          name: Yup.string()
            .required('Room name is required')
            .min(3, 'Room name must be at least 3 characters'),
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
          facilities: Yup.array()
            .of(Yup.number())
            .min(1, 'At least one room facility must be selected'),
          images: Yup.array()
            .of(
              Yup.mixed<File | { id: number; url: string }>()
                .test(
                  'fileSize',
                  'File is too large',
                  value => 
                    typeof value === 'string' || 
                    !value || 
                    'url' in value ||
                    (value && value.size <= FILE_SIZE),
                )
                .test(
                  'fileFormat',
                  'Unsupported file type',
                  value => 
                    typeof value === 'string' || 
                    !value || 
                    'url' in value ||
                    (value && SUPPORTED_FORMATS.includes(value.type)),
                )
            )
            .min(1, 'At least one room image is required'),
          specialPrice: Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.number().nullable(),
                date: Yup.date().required('Special price date is required'),
                price: Yup.number()
                  .required('Special price is required')
                  .positive('Special price must be greater than 0'),
              })
            )
            .nullable(),
        })
      )
      .min(1, 'At least one room type is required'),
    newFacility: Yup.string().nullable(),
  });