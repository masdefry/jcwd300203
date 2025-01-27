'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Changed from next/router
import { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePropertyFacilities } from '@/features/properties/hooks/queries/queryFacilities';
import { useQueryPropertyCategories } from '@/features/properties/hooks/queries/queryPropertyCategories';
import { PropertySidebarProps, SortOption } from '@/features/types/property';
import {
  X,
  ChevronDown,
  ArrowUpDown,
  CircleDollarSign,
  Building2,
  PocketKnife,
} from 'lucide-react';

export default function PropertySidebar({
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
        {isFilterOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
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
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Price: Low to High</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="price_desc"
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Price: High to Low</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="name_asc"
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Name: A to Z</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="name_desc"
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C]"
                  />
                  <span className="text-sm">Name: Z to A</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="rating_desc"
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
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
                  <span>
                    Rp {priceRange?.[1]?.toLocaleString() ?? '5,000,000'}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Property Type */}
          <AccordionItem
            value="property-type"
            className="border rounded-lg px-2"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Property Type</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                {categories?.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      onCheckedChange={(checked) =>
                        onFilterChange(
                          'category',
                          category.id,
                          checked === true,
                        )
                      }
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
                  <label
                    key={facility.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <Checkbox
                      id={`facility-${facility.id}`}
                      onCheckedChange={(checked) =>
                        onFilterChange(
                          'facility',
                          facility.id,
                          checked === true,
                        )
                      }
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
          <AccordionItem
            value="room-facilities"
            className="border rounded-lg px-2"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <PocketKnife className="h-4 w-4" />
                <span>Room Facility</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                {facilities?.data?.roomFacilities?.map((facility) => (
                  <label
                    key={facility.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <Checkbox
                      id={`facility-${facility.id}`}
                      onCheckedChange={(checked) =>
                        onFilterChange(
                          'facility',
                          facility.id,
                          checked === true,
                        )
                      }
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
