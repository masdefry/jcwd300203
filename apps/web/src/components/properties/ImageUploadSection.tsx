import React from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadSectionProps {
  title: string;
  preview: string | null;
  previewList?: string[];
  onMainImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultipleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  error?: string;
  multiple?: boolean;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  title,
  preview,
  previewList,
  onMainImageChange,
  onMultipleImageChange,
  onRemoveImage,
  error,
  multiple = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{title}</label>
      <div className="mt-2">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            {preview && !multiple ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  Click to upload {multiple ? 'images' : 'image'}
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={multiple}
              onChange={multiple ? onMultipleImageChange : onMainImageChange}
            />
          </label>
        </div>

        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}

        {multiple && previewList && previewList.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {previewList.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                  onClick={() => onRemoveImage?.(index)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};