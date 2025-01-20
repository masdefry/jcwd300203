import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RoomDetailsDialog } from './RoomDetailsDialog';
import { useState } from 'react';
import Image from 'next/image';
import authStore from '@/zustand/authStore';

interface RoomsListProps {
  rooms: any[]; // Type this based on your API response
  checkIn: Date;
  checkOut: Date;
  guests: number;
}



export default function RoomsList({ rooms, checkIn, checkOut, guests }: RoomsListProps) {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [showAllFacilities, setShowAllFacilities] = useState<Record<string | number, boolean>>({});
    
    const verified = authStore((state) => state.isVerified)
    console.log('verified from roomlist:', verified)

    const handleReserve = (roomId: string, price: number) => {
      router.push(
        `/checkout?roomId=${roomId}&checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}&price=${price}&guests=${guests}`
      );
    };
  
    const toggleFacilities = (roomId: string | number) => {
      setShowAllFacilities(prev => ({
        ...prev,
        [roomId]: !prev[roomId]
      }));
    };
  
    return (
      <div className="space-y-6">
        {rooms.map((room) => {
          const isAvailable = room.priceComparison.some(
            (p: any) => p.availableRooms > 0
          );
  
          const displayedFacilities = showAllFacilities[room.id] 
            ? room.facilities 
            : room.facilities.slice(0, 5);
  
          return (
            <Card
              key={room.id} 
              className="p-6"
            >
              <div className="grid md:grid-cols-[1fr,2fr,1fr] gap-6">
                {/* Room Image */}
                <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer"
                     onClick={() => setSelectedRoom(room)}>
                  {room.images && room.images[0] ? (
                    <Image
                      src={`http://localhost:4700/images/${room.images[0].url}`}
                      alt={room.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
  
                {/* Room Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      Up to {room.guestCapacity} guests
                    </p>
                  </div>
  
                  {/* Room Features */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {displayedFacilities.map((facility: any) => (
                        <div key={facility.id} className="flex items-center gap-2">
                          <Image
                            className="w-4 h-4"
                            src={`http://localhost:4700/images/${facility?.icon}`}
                            width={20}
                            height={20}
                            alt='facility icon'
                          />
                          <span className="text-sm">{facility.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    {room.facilities.length > 5 && (
                      <button
                        onClick={() => toggleFacilities(room.id)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {showAllFacilities[room.id] ? 'Show less' : `Show all ${room.facilities.length} facilities`}
                      </button>
                    )}
                  </div>
                </div>
  
                {/* Pricing & Booking */}
                <div className="space-y-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      IDR {room?.currentPrice?.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                  
                  <Button
                    className="w-full bg-[#f15b5b] hover:bg-[#e54949]"
                    onClick={() => handleReserve(room.id, room.price)}
                    disabled={!isAvailable || !verified}
                  >
                    {isAvailable ? 'Reserve' : 'Not Available'}
                  </Button>
  
                  {room.priceComparison[0]?.availableRooms < 3 && (
                    <div className="text-sm text-red-500 text-right">
                      Only {room.priceComparison[0].availableRooms} room(s) left!
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        
        {selectedRoom && (
          <RoomDetailsDialog
            room={selectedRoom}
            isOpen={!!selectedRoom}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </div>
    );
  }