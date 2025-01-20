import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '@/utils/getImageUrl';

interface RoomDetailsDialogProps {
  room: {
    name: string;
    guestCapacity: number;
    size?: number;
    description: string;
    images: { url: string; alt?: string }[];
    facilities: { name: string; icon?: string }[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function RoomDetailsDialog({
  room,
  isOpen,
  onClose,
}: RoomDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev + 1 === room.images.length ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev - 1 < 0 ? room.images.length - 1 : prev - 1,
    );
  };
console.log('room:',room)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room.name}</DialogTitle>
        </DialogHeader>

        {/* Room Images */}
        <div className="relative aspect-video w-full mb-6">
          {room.images.length > 0 ? (
            <>
              <Image
                src={`http://localhost:4700/images/${room.images[currentImageIndex]?.url}`}
                alt={room.images[currentImageIndex]?.alt || room.name}
                fill
                className="object-cover rounded-lg"
              />
              {room.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          currentImageIndex === index
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              No images available
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Room Description First */}
          {room.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{room.description}</p>
            </div>
          )}

          {/* Room Details and Facilities Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Room Details</h3>
              <div className="space-y-2">
                <p>Room size: {room.size} m²</p>
                <p>Max guests: {room.guestCapacity}</p>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <h3 className="font-semibold mb-2">Room Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Image
                      className="h-4 w-4"
                      src={`http://localhost:4700/images/${facility?.icon}`}
                      alt="Facility icon"
                      width={20}
                      height={20}
                    />
                    <span>{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
