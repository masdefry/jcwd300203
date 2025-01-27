'use client';
import { PropertyCardProps } from "@/features/types/property";
import { Card, CardHeader, CardTitle,CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

export default function PropertyCard({
    name,
    price,
    category,
    address,
    city,
    mainImage,
    id,
    checkIn,
    checkOut,
    facilities,
    rating,
  }: PropertyCardProps) {
    const formattedCheckIn = checkIn.replace(/-/g, '/');
    const formattedCheckOut = checkOut.replace(/-/g, '/');
  
    return (
      <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative w-full md:w-1/3 h-64 md:h-auto">
          <Image
            src={`http://localhost:4700/images/${mainImage}`}
            alt={name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold mb-2">{name}</CardTitle>
                <div className="text-sm text-gray-600">
                  <p>{category} • {city}</p>
                  <p>{address}</p>
                </div>
              </div>
              {rating && (
                <div className="bg-blue-600 text-white px-2 py-1 rounded">
                  {rating}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Facilities:</h4>
              <div className="flex flex-wrap gap-2">
                {facilities?.map((facility) => (
                  <span key={facility.id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-sm">
                    <Image
                      src={`http://localhost:4700/images/${facility.icon}`}
                      alt={facility.name}
                      width={16}
                      height={16}
                    />
                    <span>{facility.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-[#FF385C]">
                {price !== 0 ? `Rp ${price.toLocaleString()}` : 'No rooms available'}
              </p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
            <Link
              href={`/property/${id}?checkIn=${formattedCheckIn}&checkOut=${formattedCheckOut}`}
            >
              <Button className="bg-[#FF385C] hover:bg-[#FF385C]/90 text-white">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </div>
      </Card>
    );
  }