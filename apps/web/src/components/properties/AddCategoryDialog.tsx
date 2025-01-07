import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';

export const AddCategoryDialog: React.FC = () => {
  const [name, setName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryIcon, setCategoryIcon] = useState<File | null>(null);
  const [categoryIconPreview, setCategoryIconPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: createCategory, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await instance.post('/property/categories', formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category added successfully');
      queryClient.invalidateQueries({ queryKey: ['propertyCategories'] });
      setDialogOpen(false);
      setName('');
      setCategoryIcon(null);
      setCategoryIconPreview(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  const handleCategoryIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setCategoryIcon(file);
      setCategoryIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && categoryIcon) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('icon', categoryIcon);

      createCategory(formData);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !bg-white" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (SVG only)</label>
            <div className="flex items-center gap-4">
              {categoryIconPreview ? (
                <div className="relative">
                  <img src={categoryIconPreview} alt="Icon preview" className="w-12 h-12 object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryIcon(null);
                      setCategoryIconPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-12 h-12 border-2 border-dashed rounded cursor-pointer hover:border-blue-500">
                  <input
                    type="file"
                    accept="image/svg+xml"
                    onChange={handleCategoryIconChange}
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
              disabled={!name || !categoryIcon || isPending}
            >
              {isPending ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};