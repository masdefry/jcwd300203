import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Room {
  id: string;
  name: string;
  price: number;
  guestCapacity: number;
  facilities: Array<{ id: number; name: string; icon?: string }>;
  images: Array<{ url: string }>;
  currentBookings?: Array<{
    checkInDate: string;
    checkOutDate: string;
    quantity: number;
    status: string;
  }>;
}

interface RoomsListProps {
  rooms: Room[];
}

export function RoomsList({ rooms }: RoomsListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Room Types</h2>
      {rooms.map((room) => (
        <div key={room.id} className="border rounded-lg p-6">
          <div className="grid md:grid-cols-[1fr,2fr] gap-6">
            <div className="relative h-48 rounded-lg overflow-hidden">
              {room.images?.[0] && (
                <Image
                  src={`http://localhost:4700/images/${room.images[0].url}`}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <p className="text-gray-600">Up to {room.guestCapacity} guests</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    IDR {room.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Facilities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {room.facilities.slice(0, 4).map((facility) => (
                      <div key={facility.id} className="flex items-center gap-2">
                        {facility.icon && (
                          <Image
                            src={`http://localhost:4700/images/${facility.icon}`}
                            alt={facility.name}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-sm">{facility.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
