import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PropertyGalleryProps {
  mainImage: string;
  images?: Array<{ url: string; alt: string }>;
}

export default function PropertyGallery({ mainImage, images = [] }: PropertyGalleryProps) {
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [
    { url: mainImage, alt: 'Main Property Image' },
    ...(images || [])
  ].filter(img => img.url);

  // Gallery Modal Content
  const GalleryModal = () => (
    <div className="relative w-full h-full">
      {/* Main Image */}
      <div className="relative h-[80vh] w-full">
        <Image
          src={`http://localhost:4700/images/${allImages[currentImageIndex]?.url}`}
          alt={allImages[currentImageIndex]?.alt || "Property"}
          fill
          className="object-contain"
        />

        {/* Navigation Buttons */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(prev => 
              prev === 0 ? allImages.length - 1 : prev - 1
            );
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(prev => 
              prev === allImages.length - 1 ? 0 : prev + 1
            );
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full">
          {currentImageIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              className={`flex-shrink-0 relative w-24 h-16 rounded-md overflow-hidden ${
                currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={`http://localhost:4700/images/${image.url}`}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Main Grid View
  const GridView = () => (
    <div className="space-y-2">
      {/* Top Section - Main Image + 2 Small Images */}
      <div className="flex gap-2 h-[400px]">
        {/* Main Large Image */}
        <div className="relative flex-grow cursor-pointer" onClick={() => {
          setCurrentImageIndex(0);
          setShowFullGallery(true);
        }}>
          <Image
            src={`http://localhost:4700/images/${allImages[0]?.url}`}
            alt={allImages[0]?.alt || "Main Property Image"}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Two Small Images Column */}
        <div className="flex flex-col gap-2 w-[33%]">
          {allImages.slice(1, 3).map((image, index) => (
            <div
              key={index}
              className="relative flex-1 cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setShowFullGallery(true);
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

      {/* Bottom Row - Small Images */}
      <div className="grid grid-cols-5 gap-2">
        {allImages.slice(3, 8).map((image, index) => (
          <div
            key={index}
            className="relative aspect-[4/3] cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(index + 3);
              setShowFullGallery(true);
            }}
          >
            <Image
              src={`http://localhost:4700/images/${image.url}`}
              alt={image.alt || `Property Image ${index + 4}`}
              fill
              className="object-cover rounded-lg"
            />
            {index === 4 && allImages.length > 8 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <span className="text-white text-lg font-semibold">+{allImages.length - 8} photos</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Regular Grid View */}
      <GridView />

      {/* Gallery Dialog */}
      <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle>Property Gallery</DialogTitle>
          </DialogHeader>
          <GalleryModal />
        </DialogContent>
      </Dialog>
    </>
  );
}