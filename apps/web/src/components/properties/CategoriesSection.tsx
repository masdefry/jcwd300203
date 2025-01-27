import React from 'react';
import { Field } from 'formik';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategorySelectProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  name: string;
  error?: string;  // Only accept string for error
  touched?: boolean | undefined;  // Make touched optional and accept undefined
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  isLoading,
  name,
  error,
  touched,
}) => {
  
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (!categories?.length) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No categories available" />
        </SelectTrigger>
      </Select>
    );
  }
  console.log('categories data: ', categories)
  return (
    <Field name={name}>
      {({ field, form }: any) => (
        <div>
          <Select
            value={field.value?.toString()}
            onValueChange={(value) => form.setFieldValue(name, Number(value))}
          >
            <SelectTrigger>
              {field.value ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={`http://localhost:4700/images/${categories?.find(c => c.id === Number(field.value))?.icon}`}
                    alt="category icon"
                    width={16} 
                    height={16} 
                    className=""
                  />
                  <span>{categories?.find(c => c.id === Number(field.value))?.name}</span>
                </div>
              ) : (
                <SelectValue placeholder="Select category" />
              )}
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={`http://localhost:4700/images/${category.icon}`}
                      alt={category.name}
                      width={16} // Matches the `w-4` class (4 * 4px = 16px)
                      height={16} // Matches the `h-4` class (4 * 4px = 16px)
                    /> 
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched && error && (
            <div className="text-red-500 text-sm mt-1">{error}</div>
          )}
        </div>
      )}
    </Field>
  );
};