import { Star } from 'lucide-react';

interface PropertyInfoProps {
  data: {
    name: string;
    description?: string;
    address: string;
    rating?: number;
    category?: {
      name: string;
    };
    roomCapacity?: number;
  };
}

export function PropertyInfo({ data }: PropertyInfoProps) {
  const renderStars = (rating?: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          rating && index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          {renderStars(data.rating)}
          {data.rating && (
            <span className="text-sm text-gray-600">({data.rating}/5)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-1">Property Category</h3>
          <p className="text-gray-600">{data.category?.name}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Room Capacity</h3>
          <p className="text-gray-600">{data.roomCapacity} rooms</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Address</h3>
        <p className="text-gray-600">{data.address}</p>
      </div>

      {data.description && (
        <div>
          <h3 className="font-semibold mb-1">Description</h3>
          <p className="text-gray-600">{data.description}</p>
        </div>
      )}
    </div>
  );
}