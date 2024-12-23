"use client"
import Image from "next/image"
import { addDays, format, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ExpandIcon, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import instance from "@/utils/axiosInstance"
import { usePathname, useSearchParams } from "next/navigation"





function PropertyGallery({ mainImage, images = [] }: any) {
    // Combine mainImage with other images
    const allImages = [
      { url: mainImage, alt: "Main Property Image" },
      ...images
    ].filter(img => img.url); // Filter out any undefined/null images
  
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // If no images available, show placeholder
    if (allImages.length === 0) {
      allImages.push({ 
        url: "/api/placeholder/800/600", 
        alt: "Property Image Placeholder" 
      });
    }
  
    const showNext = () => {
      setCurrentIndex((current) => 
        current + 1 === allImages.length ? 0 : current + 1
      );
    };
  
    const showPrevious = () => {
      setCurrentIndex((current) => 
        current - 1 < 0 ? allImages.length - 1 : current - 1
      );
    };
  
    return (
      <div className="relative w-full">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Image
            src={`http:localhost:4700/images/${allImages[currentIndex]?.url}`|| '/placeholder.svg'}
            alt={allImages[currentIndex]?.alt || allImages[currentIndex]?.url || '/placeholder.svg'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm"
              >
                <ExpandIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl">
              <div className="relative aspect-[16/9]">
                <Image
                  src={`http:localhost:4700/images/${allImages[currentIndex]?.url}`|| '/placeholder.svg'}
                  alt={allImages[currentIndex]?.alt || allImages[currentIndex]?.url || '/placeholder.svg'}
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
          {allImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                onClick={showPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                onClick={showNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {allImages.length > 1 && (
          <div className="mt-4 hidden grid-cols-4 gap-4 px-1 md:grid">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg ${
                  currentIndex === index ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

function CustomCalendar({
    selectedDates,
    onDateSelect,
    isDateDisabled,
    priceComparison = [],
  }: any) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
  
    const generateMonthDays = (month: any) => {
      const days = [];
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      let day = start;
      while (day <= end) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
      }
      return days;
    };
  
    const getPriceForDate = (date: any) => {
      const dateStr = format(date, "EEE MMM dd yyyy");
      const priceData = priceComparison.find((p: any) => p.date === dateStr);
      return priceData?.price;
    };
  
    const getAvailabilityForDate = (date: any) => {
      const dateStr = format(date, "EEE MMM dd yyyy");
      const priceData = priceComparison.find((p: any) => p.date === dateStr);
      return priceData?.availableRooms ?? 0;
    };
  
    const monthDays = generateMonthDays(currentMonth);
  
    const changeMonth = (direction: "prev" | "next") => {
      setCurrentMonth((prevMonth) => {
        const newMonth = new Date(prevMonth);
        newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
        return newMonth;
      });
    };
  
    return (
      <div className="w-full mx-auto border rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
          <button
            className="text-blue-500"
            onClick={() => changeMonth("prev")}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-bold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            className="text-blue-500"
            onClick={() => changeMonth("next")}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
  
        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1">
              {day}
            </div>
          ))}
        </div>
  
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 p-2 sm:p-4">
          {monthDays.map((day) => {
            const price = getPriceForDate(day);
            const available = getAvailabilityForDate(day);
            const isSelected =
              selectedDates.from &&
              day.toDateString() === selectedDates.from.toDateString();
            const isInRange =
              selectedDates.from &&
              selectedDates.to &&
              day > selectedDates.from &&
              day < selectedDates.to;
  
            return (
              <button
                key={day.toString()}
                className={`
                  flex flex-col items-center p-2 rounded-lg text-xs sm:text-sm relative
                  ${
                    isDateDisabled(day)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }
                  ${isSelected ? "bg-blue-500 text-white" : ""}
                  ${isInRange ? "bg-blue-100" : ""}
                `}
                onClick={() => !isDateDisabled(day) && onDateSelect(day)}
                disabled={isDateDisabled(day)}
              >
                <span>{format(day, "d")}</span>
                {price && available > 0 && (
                  <div className="text-xs mt-1 text-gray-600">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      notation: "compact",
                    }).format(price)}
                  </div>
                )}
                {available === 0 && (
                  <div className="text-xs mt-1 text-red-500">Sold out</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  
  
export interface AvailabilitySectionProps {
  roomTypes: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    maxGuests: number;
    size: number;
    amenities: string[];
    available: boolean;
    images: { url: string; alt: string }[];
  }[];
}

export function AvailabilitySection({ roomType }: any) {
    const [dateRange, setDateRange] = useState<{
      from: Date | undefined;
      to: Date | undefined;
    }>({
      from: new Date(),
      to: addDays(new Date(), 3),
    });
  
    const [guests, setGuests] = useState({
      adults: 2,
      children: 0,
      rooms: 1,
    });
  
    const today = startOfDay(new Date());
  
    const [searchParams, setSearchParams] = useState<string | null>(null);
  
    const formatIDR = (price: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(price);
  
    const formatDateRange = () => {
      if (!dateRange.from) return "Select dates";
      if (!dateRange.to) return format(dateRange.from, "EEE, MMM d");
      return `${format(dateRange.from, "EEE, MMM d")} — ${format(
        dateRange.to,
        "EEE, MMM d"
      )}`;
    };
  
    const handleSelect = (date: Date) => {
      if (!dateRange.from || (dateRange.from && dateRange.to)) {
        setDateRange({ from: date, to: undefined });
      } else if (dateRange.from && !dateRange.to && !isBefore(date, dateRange.from)) {
        setDateRange({ ...dateRange, to: date });
      }
    };
  
    const isDateDisabled = (date: Date) => {
      return isBefore(date, today);
    };
  
    const handleCheckAvailability = () => {
      const url = new URL(window.location.href);
  
      if (dateRange.from) {
        url.searchParams.set("checkIn", format(dateRange.from, "yyyy/MM/dd"));
      }
      if (dateRange.to) {
        url.searchParams.set("checkOut", format(dateRange.to, "yyyy/MM/dd"));
      }
      setSearchParams(url.toString()); // Store URL (optional)
  
      window.history.replaceState({}, "", url.toString());
    };
  
    return (
      <div className="rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-4">Check availability</h2>
        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CustomCalendar
                    selectedDates={dateRange}
                    onDateSelect={handleSelect}
                    isDateDisabled={isDateDisabled}
                    priceComparison={roomType?.priceComparison}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              className="bg-[#0071c2] hover:bg-[#005999] text-white"
              onClick={handleCheckAvailability}
            >
              Check availability
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  interface RoomTypeCarouselProps {
    images: {
      url: string
      alt: string
    }[]
  }
  
 function RoomTypeCarousel({ images }: RoomTypeCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
  
    const showNext = () => {
      setCurrentIndex((current) => 
        current + 1 === images.length ? 0 : current + 1
      )
    }
  
    const showPrevious = () => {
      setCurrentIndex((current) => 
        current - 1 < 0 ? images.length - 1 : current - 1
      )
    }
  
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
        <Image
          src={`http://localhost:4700/images/${images[currentIndex]?.url}` || '/placeholder.svg'}
          alt={images[currentIndex]?.alt }
          fill
          className="object-cover"
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
          onClick={showPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
          onClick={showNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${
                currentIndex === index ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    )
  }

  interface RoomTypeProps {
    name: string
    price: number
    capacity: number
    size: number
    amenities: string[]
    available: boolean
    images: {
      url: string
      alt: string
    }[]
  }
  
  export function RoomType({ name, price, guestCapacity, facilities, images, availability }: any) {
    return (
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[2fr,1fr]">
          <RoomTypeCarousel images={images} />
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {guestCapacity} guests 
            </div>
          </CardHeader>
        </div>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/night</span>
              </div>
              <Button className="w-auto" disabled={!availability}>
                {availability ? "Reserve" : "Not Available"}
              </Button>
            </div>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              {facilities.map((facilities: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{facilities}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  export default function PropertyDetails() {
    const pathname = usePathname()
    const id = pathname.split('/')[2]
    console.log(id)
    const searchParams = useSearchParams()
    const checkIn = searchParams.get('checkIn') || new Date();
    const checkOut = searchParams.get('checkOut') || addDays(new Date(), 1);
    const {data, isLoading, isError} = useQuery({
        queryKey: ['queryPropertyDetails'],
        queryFn: async () => {
            const res = await instance.get(`/property/details/${id}`,{
                params: {
                    checkIn,
                    checkOut
                }
            })
            return res?.data?.data
        }
    })
    console.log('data: ', data)
    return (
      <div className="container mx-auto py-6">
        <div className="grid gap-6">
          <div>
            <h1 className="text-2xl font-bold">{data?.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* <span>★ {propertyData.rating}</span> */}
              <span>•</span>
              <span>{data?.reviews?.length} reviews</span>
              <span>•</span>
              <span>{data?.address}</span>
              <span>•</span>
              <span>{data?.city}</span>
            </div>
          </div>
          <PropertyGallery mainImage={data?.mainImage} images={data?.mainImage}/>
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rooms">Rooms & Rates</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="rooms" className="mt-6">
              <div className="grid gap-6">
                <AvailabilitySection 
                 roomType={data?.roomTypes?.[0]} 
                />
                {data?.roomTypes?.map((roomType: any, index: any) => (
                  <RoomType key={index} {...roomType} 
                  availability = {data?.roomTypes[0]?.priceComparison[0]?.availableRooms}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="amenities">
              {data?.facilities?.length > 0 ? data?.facilities?.map((item: any, index: any) => (
            <Card>
            <CardContent>
                {item.name}
            </CardContent>
            </Card>
            )): 'No facilities Provided'}
                
            </TabsContent>
            <TabsContent value="reviews">
            {data?.review?.length > 0 ? data?.review?.map((item: any, index: any) => (
            <Card>
            <CardHeader>
                {item?.customer?.name}
            </CardHeader>
            <CardContent>
                {item.name}
            </CardContent>
            </Card>
            )): 'No review Provided'}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
}
