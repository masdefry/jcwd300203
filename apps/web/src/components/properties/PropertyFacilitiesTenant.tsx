import Image from 'next/image';

interface Facility {
  id: number;
  name: string;
  icon?: string;
}

interface FacilitiesListProps {
  facilities: Facility[];
}

export function FacilitiesList({ facilities }: FacilitiesListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Property Facilities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {facilities?.map((facility) => (
          <div
            key={facility.id}
            className="flex items-center gap-2 p-3 rounded-lg border"
          >
            {facility.icon && (
              <Image
                src={`http://localhost:4700/images/${facility.icon}`}
                alt={facility.name}
                width={24}
                height={24}
                className="w-6 h-6"
              />
            )}
            <span className="text-sm">{facility.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}