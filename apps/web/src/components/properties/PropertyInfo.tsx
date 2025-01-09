interface PropertyInfoProps {
    data: {
      name: string;
      description?: string;
      address: string;
      checkInTime?: string;
      checkOutTime?: string;
      rating?: number;
      facilities: Array<{ name: string; icon?: string }>;
    }
  }
  
export default function PropertyInfo({ data }: PropertyInfoProps) {
    return (
      <div className="space-y-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2">
              {data.rating && (
                <div className="inline-block bg-blue-600 text-white px-2 py-1 rounded-lg text-sm mb-2">
                  {data.rating} / 10
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <p className="text-gray-600">{data.address}</p>
          </div>
        </div>
  
        {data?.description && (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{data.description}</p>
          </div>
        )}
  
        <div>
          <h3 className="font-semibold mb-2">Check-in/Check-out</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Check-in time</p>
              <p>{data.checkInTime || '14:00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-out time</p>
              <p>{data.checkOutTime || '12:00'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }