import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { useQueryPropertyCategories } from '@/features/properties/hooks/queries/queryPropertyCategories';
import { AddCategoryDialog } from './AddCategoryDialog';
import { CategorySelect } from './CategoriesSection';
import { useFormikContext } from 'formik';
import { MapPicker } from './MapPicker';

export const BasicInformation: React.FC = () => {
  const { data: categories, isLoading } = useQueryPropertyCategories();
  const { touched } = useFormikContext();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Property Name</label>
        <Field
          name="name"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          type="text"
        />
        <ErrorMessage
          name="name"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">Property Category</label>
          <AddCategoryDialog />
        </div>
        <CategorySelect
          categories={categories}
          isLoading={isLoading}
          name="categoryId"
          error={<ErrorMessage name="categoryId" component="div" />}
          touched={touched.categoryId}
        />
        <ErrorMessage
          name="categoryId"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div>
        <MapPicker />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Field
          name="address"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
          type="text"
          readOnly
        />
        <ErrorMessage
          name="address"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <Field
            name="city"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
            type="text"
            readOnly
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
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            type="number"
          />
          <ErrorMessage
            name="roomCapacity"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Field
          as="textarea"
          name="description"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Describe your property..."
        />
        <ErrorMessage
          name="description"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>
    </div>
  );
};
