'use client';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import SearchForm from "@/components/home/SearchForm";
import { useSearchParams, useRouter } from "next/navigation";
import Wrapper from "@/components/layout/Wrapper";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";
import { useState } from "react";
import { FilterType, Property, SelectedFilters, SortOption } from "@/features/types/property";
import PropertySidebar from "@/components/properties/PropertySidebar";
import PropertyCard from "@/components/properties/PropertyCard";

export default function SearchPropertyPage () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    categories: [],
    facilities: [],
    roomFacilities: []
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  const searchQuery = searchParams.get('search') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guest = searchParams.get('guest') || '';
  const sortBy = searchParams.get('sortBy') || 'price';
  const orderBy = searchParams.get('orderBy') || 'asc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const sortOption = `${sortBy}_${orderBy}` as SortOption;

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

      Object.keys(queryParams).forEach(key => 
        (queryParams as any)[key] === undefined && delete (queryParams as any)[key]
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

