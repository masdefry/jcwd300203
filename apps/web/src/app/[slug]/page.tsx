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
import Wrapper from "@/components/layout/Wrapper";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";
import { usePropertyFacilities } from "@/features/properties/hooks/queries/queryFacilities";
import { useQueryPropertyCategories } from "@/features/properties/hooks/queries/queryPropertyCategories";
import { Slider } from "@/components/ui/slider";
import { ArrowUpDown, Building2, ChevronDown, CircleDollarSign, PocketKnife, X } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FacilitiesResponse } from "@/features/types/property";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import Script from "next/script";



// Define more specific types
type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "rating_desc";

type FilterType = 'category' | 'facility' | 'roomFacility';

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
  checkOut: string;
  facilities: any[];
  rating?: number;
}

interface PropertyCardProps extends Property {
  id: number;
}


interface SelectedFilters {
  categories: number[];
  facilities: number[];
  roomFacilities: number[]; // Added room facilities
}

interface PropertySidebarProps {
  onSortChange: (option: string) => void;
  onFilterChange: (type: 'category' | 'facility' | 'roomFacility', id: number, checked: string|boolean) => void;
  selectedFilters: SelectedFilters;
  onPriceRangeChange: (range: [number, number]) => void;
  priceRange: [number, number];
}

function PropertySidebar({
  onSortChange,
  onFilterChange,
  selectedFilters,
  onPriceRangeChange,
  priceRange = [0, 5000000], 
}: PropertySidebarProps) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: facilities } = usePropertyFacilities();
  const { data: categories } = useQueryPropertyCategories();
  const router = useRouter();

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {/* Mobile Filter Button */}
      <button
        className="lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 rounded-t-lg"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <span className="font-medium">Filters</span>
        {isFilterOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block p-4`}>
        <Accordion type="multiple" className="w-full space-y-2">
          {/* Sort Section */}
          <AccordionItem value="sort" className="border rounded-lg px-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort By</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="price_asc"
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Price: Low to High</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="price_desc"
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Price: High to Low</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="name_asc"
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Name: A to Z</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="name_desc"
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Name: Z to A</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="rating_desc"
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Rating: High to Low</span>
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price" className="border rounded-lg px-2">
  <AccordionTrigger className="hover:no-underline">
    <div className="flex items-center gap-2">
      <CircleDollarSign className="h-4 w-4" />
      <span>Price Range</span>
    </div>
  </AccordionTrigger>
  <AccordionContent>
    <div className="px-2 py-4">
      <Slider
        defaultValue={priceRange ?? [0, 5000000]} // Ensure default
        max={5000000}
        step={100000}
        onValueChange={onPriceRangeChange}
        className="w-full"
      />
      <div className="flex justify-between mt-4 text-sm text-gray-600">
      <span>Rp {priceRange?.[0]?.toLocaleString() ?? '0'}</span>
      <span>Rp {priceRange?.[1]?.toLocaleString() ?? '5,000,000'}</span>
      </div>
    </div>
  </AccordionContent>
</AccordionItem>

          {/* Property Type */}
          <AccordionItem value="property-type" className="border rounded-lg px-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Property Type</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                {categories?.map((category) => (
                  <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`category-${category.id}`}
                      onCheckedChange={(checked) => onFilterChange('category', category.id, checked)}
                      className="text-[#FF385C] data-[state=checked]:bg-[#FF385C] data-[state=checked]:border-[#FF385C]"
                    />
                    <div className="flex items-center space-x-2">
                      {category.icon && (
                        <Image
                          src={`http://localhost:4700/images/${category.icon}`}
                          alt={category.name}
                          width={20}
                          height={20}
                          className="opacity-75"
                        />
                      )}
                      <span className="text-sm">{category.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Facilities */}
          <AccordionItem value="facilities" className="border rounded-lg px-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <PocketKnife className="h-4 w-4" />
                <span>Facilities</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                {facilities?.data?.propertiesFacilities?.map((facility) => (
                  <label key={facility.id} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`facility-${facility.id}`}
                      onCheckedChange={(checked) => onFilterChange('facility', facility.id, checked)}
                      className="text-[#FF385C] data-[state=checked]:bg-[#FF385C] data-[state=checked]:border-[#FF385C]"
                    />
                    <div className="flex items-center space-x-2">
                      <Image
                        src={`http://localhost:4700/images/${facility.icon}`}
                        alt={facility.name}
                        width={20}
                        height={20}
                        className="opacity-75"
                      />
                      <span className="text-sm">{facility.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Room Facilities */}
          <AccordionItem value="room-facilities" className="border rounded-lg px-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <PocketKnife className="h-4 w-4" />
                <span>Room Facility</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                {facilities?.data?.roomFacilities?.map((facility) => (
                  <label key={facility.id} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      id={`facility-${facility.id}`}
                      onCheckedChange={(checked) => onFilterChange('facility', facility.id, checked)}
                      className="text-[#FF385C] data-[state=checked]:bg-[#FF385C] data-[state=checked]:border-[#FF385C]"
                    />
                    <div className="flex items-center space-x-2">
                      <Image
                        src={`http://localhost:4700/images/${facility.icon}`}
                        alt={facility.name}
                        width={20}
                        height={20}
                        className="opacity-75"
                      />
                      <span className="text-sm">{facility.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Apply Filters Button */}
        <Button 
  className="w-full bg-[#FF385C] hover:bg-[#FF385C]/90 text-white mt-6"
  onClick={() => {
    const params = new URLSearchParams(window.location.search);
    
    // Handle categories
    if (selectedFilters.categories.length > 0) {
      selectedFilters.categories.forEach((id: number) => {
        params.append('categories', id.toString());
      });
    } else {
      params.delete('categories');
    }
    
    // Handle facilities
    if (selectedFilters.facilities.length > 0) {
      selectedFilters.facilities.forEach((id: number) => {
        params.append('facilities', id.toString());
      });
    } else {
      params.delete('facilities');
    }
    
    // Handle room facilities
    if (selectedFilters.roomFacilities.length > 0) {
      selectedFilters.roomFacilities.forEach((id: number) => {
        params.append('roomFacilities', id.toString());
      });
    } else {
      params.delete('roomFacilities');
    }
    
    // Handle price range
    params.set('priceMin', priceRange[0].toString());
    params.set('priceMax', priceRange[1].toString());
    
    router.push(`?${params.toString()}`, { scroll: false });
  }}
>
  Show Results
</Button>
      </div>
    </div>
  );
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

export const SearchProperty = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    categories: [],
    facilities: [],
    roomFacilities: []
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guest = searchParams.get('guest') || '';
  const sortBy = searchParams.get('sortBy') || 'price';
  const orderBy = searchParams.get('orderBy') || 'asc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Ensure type safety for sortOption
  const sortOption = `${sortBy}_${orderBy}` as SortOption;

  // Type-safe handlers
  const handleSortChange = (newSortOption: SortOption) => {
    const [newSortBy, newOrderBy] = newSortOption.split('_');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.set('orderBy', newOrderBy);
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (
    type: FilterType,
    id: number,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      const key = type === 'category' ? 'categories' :
                 type === 'facility' ? 'facilities' : 'roomFacilities';
      
      return {
        ...prev,
        [key]: checked 
          ? [...prev[key], id]
          : prev[key].filter(item => item !== id)
      };
    });
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };

  // Query with proper type handling
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "properties",
      searchQuery,
      checkIn,
      checkOut,
      guest,
      sortOption,
      page,
      selectedFilters,
      priceRange
    ],
    queryFn: async () => {
      const queryParams = {
        search: searchQuery || undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guest: guest || undefined,
        sortBy: sortOption.split("_")[0],
        sortOrder: sortOption.split("_")[1],
        page,
        limit,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        ...(selectedFilters.categories.length > 0 && { categories: selectedFilters.categories }),
        ...(selectedFilters.facilities.length > 0 && { facilities: selectedFilters.facilities }),
        ...(selectedFilters.roomFacilities.length > 0 && { roomFacilities: selectedFilters.roomFacilities })
      };

      // Clean undefined values
      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      );

      const res = await instance.get("/property", { params: queryParams });
      return res.data.data as Property[];
    },
  });
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Wrapper>
     
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 pt-32">
          <SearchForm />
          <div className="flex flex-col lg:flex-row gap-6 mt-8">
            <aside className="w-full lg:w-1/4">
              <PropertySidebar 
                 onSortChange={handleSortChange}
                 onFilterChange={handleFilterChange}
                 selectedFilters={selectedFilters}
                 onPriceRangeChange={handlePriceRangeChange}
                 priceRange={priceRange}
              />
            </aside>
            <div className="flex-1 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
                </div>
              ) : isError ? (
                <div className="text-red-500 text-center p-4 bg-white rounded-lg shadow">
                  <p>Error: {(error as Error)?.message}</p>
                </div>
              ) : !data || data.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-600">No properties found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.map((property: Property) => (
                    <PropertyCard 
                      key={property.id}
                      {...property}
                      checkIn={checkIn}
                      checkOut={checkOut}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {data && data.length > 0 && (
                <div className="flex justify-center gap-4 mt-8">
                  <Button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 bg-white rounded-md border border-gray-200">
                    Page {page}
                  </span>
                  <Button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!data || data.length < limit}
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer sections */}
      <section className="footer_one">
        <div className="container">
          <div className="row">
            <Footer />
          </div>
        </div>
      </section>

      <section className="footer_middle_area pt40 pb40">
        <div className="container">
          <CopyrightFooter />
        </div>
      </section>
    </Wrapper>
  );
};

export default SearchProperty;