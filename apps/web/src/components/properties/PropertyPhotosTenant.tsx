import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  mainImage: string;
  images?: Array<{ url: string; alt?: string }>;
}

export function PropertyGallery({ mainImage, images = [] }: PropertyGalleryProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = [
    { url: mainImage, alt: 'Main Property Image' },
    ...images,
  ].filter((img) => img.url);

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 h-96">
          <div
            className="relative cursor-pointer"
            onClick={() => {
              setCurrentIndex(0);
              setShowGallery(true);
            }}
          >
            <Image
              src={`http://localhost:4700/images/${mainImage}`}
              alt="Main Property Image"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {allImages.slice(1, 3).map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer"
                onClick={() => {
                  setCurrentIndex(index + 1);
                  setShowGallery(true);
                }}
              >
                <Image
                  src={`http://localhost:4700/images/${image.url}`}
                  alt={image.alt || `Property Image ${index + 2}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-4xl">
          <div className="relative h-[60vh]">
            <Image
              src={`http://localhost:4700/images/${allImages[currentIndex]?.url}`}
              alt={allImages[currentIndex]?.alt || "Property"}
              fill
              className="object-contain"
            />
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80"
              onClick={() => setCurrentIndex((prev) => 
                prev === 0 ? allImages.length - 1 : prev - 1
              )}
            >
              <ChevronLeft />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80"
              onClick={() => setCurrentIndex((prev) => 
                prev === allImages.length - 1 ? 0 : prev + 1
              )}
            >
              <ChevronRight />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}