'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import Image from "next/image";
import SearchForm from "@/components/home/SearchForm";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// Type definitions remain the same
type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc";

interface Property {
  id: number;
  name: string;
  price: number;
  area: number;
  mainImage: string;
  category: string;
  address: string;
  city: string;
  checkIn: string;
  checkOut: string
  facilities: string[] | any;
}

interface PropertyCardProps extends Property {
    id: number

}

interface PropertySidebarProps {
  onSortChange: (value: SortOption) => void;
}

function PropertyCard({
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
}: PropertyCardProps) {
  const formattedCheckIn = checkIn.replace(/-/g, '/');
  const formattedCheckOut = checkOut.replace(/-/g, '/');

  return (
    <Card className="w-full rounded-lg shadow-lg overflow-hidden hover:scale-[1.02] transition-transform">
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={`http://localhost:4700/images/${mainImage}`}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-bold text-primary">
          {price !== 0 ? `From ${price.toLocaleString()} per night` : `No room available`}
        </p>
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>{category}</span>
          <span>{address}</span>
          <span>{city}</span>
        </div>
        <div className="mt-4">
          <h4 className="text-md font-medium">Facilities:</h4>
          <ul className="grid grid-cols-2 gap-2 mt-2">
            {facilities.map((facility: any) => (
              <li key={facility.id} className="flex items-center space-x-2">
                <Image
                  src={`http://localhost:4700/images/${facility.icon}`}
                  alt={facility.name}
                  width={20}
                  height={20}
                />
                <span>{facility.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Link
          href={`/property/${id.toLocaleString()}?checkIn=${formattedCheckIn}&checkOut=${formattedCheckOut}`}
        >
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Sidebar for Sorting
function PropertySidebar({ onSortChange }: PropertySidebarProps) {
  return (
    <div className="p-4 bg-background border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Sort Properties</h2>
      <RadioGroup defaultValue="price_asc" onValueChange={onSortChange}>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="price_asc" id="price_asc" />
          <Label htmlFor="price_asc">Price (Low to High)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="price_desc" id="price_desc" />
          <Label htmlFor="price_desc">Price (High to Low)</Label>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="name_asc" id="name_asc" />
          <Label htmlFor="name_asc">Name (A-Z)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="name_desc" id="name_desc" />
          <Label htmlFor="name_desc">Name (Z-A)</Label>
        </div>
      </RadioGroup>
    </div>
  );
}

export const SearchProperty = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Handle URL parameters safely
    const searchQuery = searchParams.get('search') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const guest = searchParams.get('guest') || '';
    const sortBy = searchParams.get('sortBy') || 'price';
    const orderBy = searchParams.get('orderBy') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
  
    const sortOption = `${sortBy}_${orderBy}` as SortOption;
  
    const { data, isLoading, isError, error } = useQuery({
      queryKey: ["properties", searchQuery, checkIn, checkOut, guest, sortOption, page],
      queryFn: async () => {
        const res = await instance.get("/property", {
          params: {
            search: searchQuery || undefined,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
            guest: guest || undefined,
            sortBy: sortOption.split("_")[0],
            sortOrder: sortOption.split("_")[1],
            page,
            limit,
          },
        });
        return res.data.data;
      },
    });

    console.log('data from search page:',data)
  
    // Handle sort change
    const handleSortChange = (newSortOption: SortOption) => {
      const [newSortBy, newOrderBy] = newSortOption.split('_');
      const params = new URLSearchParams(searchParams.toString());
      params.set('sortBy', newSortBy);
      params.set('orderBy', newOrderBy);
      router.push(`?${params.toString()}`);
    };
  
    // Handle pagination
    const handlePageChange = (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`?${params.toString()}`);
    };
  
    return (
        <main>
          <div className="container mx-auto p-4 pt-48">
            <SearchForm />
            <div className="flex flex-col md:flex-row gap-4 pt-10">
              <div className="w-full md:w-1/4">
                <PropertySidebar onSortChange={handleSortChange} />
              </div>
              <div className="w-full md:w-3/4">
                {isLoading ? (
                  <p>Loading...</p>
                ) : isError ? (
                  <p className="text-red-500">Error: {(error as Error)?.message}</p>
                ) : !data || data.length === 0 ? (
                  <p>No properties found.</p>
                ) : (
                  <div className="space-y-4">
                    {data.map((property: Property) => (
                      <PropertyCard 
                      key={property?.id} 
                      {...property} 
                      id = {property?.id}
                      category = {property?.category}
                      address = {property?.address}
                      city = {property?.city}
                      checkIn = {checkIn}
                      checkOut = {checkOut}
                      mainImage = {property?.mainImage}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center mt-6 gap-4">
              <Button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4">Page {page}</span>
              <Button 
                onClick={() => handlePageChange(page + 1)}
                disabled={!data || data.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      );
  };
  
  export default SearchProperty;