import React from 'react';
import { Field } from 'formik';
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
  error?: string;
  touched?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  isLoading,
  name,
  error,
  touched,
}) => {
  return (
    <Field name={name}>
      {({ field, form }:any) => (
        <div>
          <Select
            disabled={isLoading}
            value={field.value?.toString()}
            onValueChange={(value) => form.setFieldValue(name, value)}
          >
            <SelectTrigger>
              {field.value ? (
                <div className="flex items-center gap-2">
                  <img
                    src={`http://localhost:4700/images/${categories?.find(c => c.id.toString() === field.value)?.icon}`}
                    alt="category icon"
                    className="w-4 h-4"
                  />
                  <span>{categories?.find(c => c.id.toString() === field.value)?.name}</span>
                </div>
              ) : (
                <SelectValue placeholder="Select category" />
              )}
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <img
                      src={`http://localhost:4700/images/${category.icon}`}
                      alt={category.name}
                      className="w-4 h-4"
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