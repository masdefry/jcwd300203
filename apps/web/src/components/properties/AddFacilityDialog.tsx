import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePropertyForm } from '@/features/properties/hooks/usePropertyForm';
import { toast } from 'react-toastify';

interface AddFacilityDialogProps {
  type: 'PROPERTY' | 'ROOM';
}

export const AddFacilityDialog: React.FC<AddFacilityDialogProps> = ({ type }) => {
  const [name, setName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [facilityIcon, setFacilityIcon] = useState<File | null>(null);
  const [facilityIconPreview, setFacilityIconPreview] = useState<string | null>(null);
  const { createFacility } = usePropertyForm();

  const handleFacilityIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      createFacility(formData, {
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
        <button type="button" className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !bg-white" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add New {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facility Name</label>
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
                  <Image
                    src={facilityIconPreview}
                    alt="Icon preview"
                    width={48} // Matches the `w-12` class (12 * 4px = 48px)
                    height={48} // Matches the `h-12` class (12 * 4px = 48px)
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityIcon(null);
                      setFacilityIconPreview(null);
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
              disabled={!name || !facilityIcon}
            >
              Add Facility
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};