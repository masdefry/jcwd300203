import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

export default function HeroCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])
    
    return (
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'].map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative" key={index}>
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                width={600}
                height={400}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Discover Amazing Places
                  </h2>
                  <p className="text-xl text-white mb-6">
                    Book your next adventure with us
                  </p>
                  <button className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-100">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }