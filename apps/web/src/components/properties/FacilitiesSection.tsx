import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePropertyForm } from '@/features/properties/hooks/usePropertyForm';
import { AddFacilityDialog } from './AddFacilityDialog';
import { FacilitiesSectionProps } from '@/features/types/property';

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
  values,
  setFieldValue,
  type,
  errors,
  touched,
}) => {
  const { facilitiesData } = usePropertyForm();

  const filteredFacilities = React.useMemo(() => {
    if (!facilitiesData?.data) return [];
    return type === 'PROPERTY' 
      ? facilitiesData.data.propertiesFacilities
      : facilitiesData.data.roomFacilities;
  }, [facilitiesData, type]);

  const getCurrentFacilities = () => {
    if (type === 'PROPERTY') {
      return values.facilityIds;
    }
    const roomIndex = parseInt(type.split('-')[1]);
    return values.roomTypes[roomIndex].facilities;
  };

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


  const handleFacilityRemove = (facilityId: number) => {
    if (type === 'PROPERTY') {
      setFieldValue(
        'facilityIds',
        values.facilityIds.filter((id: number) => id !== facilityId)
      );
    } else {
      const roomIndex = parseInt(type.split('-')[1]);
      const updatedRoomTypes = [...values.roomTypes];
      updatedRoomTypes[roomIndex].facilities = updatedRoomTypes[
        roomIndex
      ].facilities.filter((id: number) => id !== facilityId);
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
                <Image
                  src={`http://localhost:4700/images/${facility.icon}`}
                  alt={facility.name}
                  width={16} // Matches the `w-4` class (4 * 4px = 16px)
                  height={16} // Matches the `h-4` class (4 * 4px = 16px)
                />
                <span>{facility.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2 mt-2">
        {getCurrentFacilities().map((facilityId: number) => {
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
              <Image
                src={`http://localhost:4700/images/${facility.icon}`}
                alt={facility.name}
                width={16} // Matches the `w-4` class (4 * 4px = 16px)
                height={16} // Matches the `h-4` class (4 * 4px = 16px)
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
        ? touched.facilityIds && errors.facilityIds && (
          <div className="text-red-500 text-sm mt-1">
            {errors.facilityIds}
          </div>
        ) 
        : touched.roomTypes?.[parseInt(type.split('-')[1])]?.facilities && 
          errors.roomTypes?.[parseInt(type.split('-')[1])]?.facilities && (
          <div className="text-red-500 text-sm mt-1">
            {errors.roomTypes[parseInt(type.split('-')[1])].facilities}
          </div>
        )
      }
    </div>
  );
};