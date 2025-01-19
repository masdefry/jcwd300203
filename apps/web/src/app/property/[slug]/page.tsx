'use client';
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Heart, Share } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import BookingCard from '@/components/properties/BookingCard';
import RoomsList from '@/components/properties/RoomsList';
import { getDefaultDates } from '@/utils/dateHelper';
import LoadingWithSpinner from '@/components/Loading';
import ReviewsList from '@/components/properties/ReviewList';
import PropertyGallery from '@/components/properties/PropertyGallery';
import PropertyInfo from '@/components/properties/PropertyInfo';
import FacilitiesList from '@/components/properties/FacilitiesList';
import { Card } from '@/components/ui/card';
import authStore from '@/zustand/authStore';
import PropertyMap from '@/components/properties/PropertyMap';

export default function PropertyDetails() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = pathname.split('/')[2];
  const verified = authStore((state) => state.isVerified);
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests') || '2';
  const rooms = searchParams.get('rooms') || '1';

  // Parse dates
  const { checkIn: defaultCheckIn, checkOut: defaultCheckOut } = getDefaultDates();
  const parsedCheckIn = checkIn ? new Date(checkIn) : defaultCheckIn;
  const parsedCheckOut = checkOut ? new Date(checkOut) : defaultCheckOut;

  useEffect(() => {
    if (!checkIn || !checkOut) {
      const params = new URLSearchParams(searchParams);
      params.set('checkIn', format(parsedCheckIn, 'yyyy-MM-dd'));
      params.set('checkOut', format(parsedCheckOut, 'yyyy-MM-dd'));
      params.set('guests', guests);
      params.set('rooms', rooms);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [checkIn, checkOut]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['propertyDetails', id, parsedCheckIn, parsedCheckOut],
    queryFn: async () => {
      const res = await instance.get(`/property/details/${id}`, {
        params: {
          checkIn: format(parsedCheckIn, 'yyyy/MM/dd'),
          checkOut: format(parsedCheckOut, 'yyyy/MM/dd'),
        },
      });
      return res?.data?.data;
    },
  });

  if (isLoading || isFetching) return <LoadingWithSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
  {/* Header Section */}
  <div className="space-y-4 mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{data?.name}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>⭐ {data?.rating}</span>
          <span>•</span>
          <span>{data?.reviews?.length} reviews</span>
          <span>•</span>
          <span className="text-blue-600 hover:underline cursor-pointer">
            {data?.address}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Heart className="w-6 h-6" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Share className="w-6 h-6" />
        </button>
      </div>
    </div>

    <PropertyGallery mainImage={data?.mainImage} images={data?.images} />
  </div>

  {/* Main Content */}
  <div className="grid grid-cols-1 gap-8">
    <div className="space-y-8 w-full">
      <PropertyInfo data={data} />

      {/* Price Calendar */}
      <BookingCard
        checkIn={parsedCheckIn}
        checkOut={parsedCheckOut}
        guests={Number(guests)}
        rooms={Number(rooms)}
        priceComparison={data?.roomTypes?.[0]?.priceComparison}
        onSearch={(params) => {
          if (!params.checkIn || !params.checkOut) return;
          const queryString = new URLSearchParams({
            checkIn: format(params.checkIn, 'yyyy-MM-dd'),
            checkOut: format(params.checkOut, 'yyyy-MM-dd'),
            guests: params.guests.toString(),
            rooms: params.rooms.toString(),
          }).toString();

          // Refetch data with new dates
          router.replace(`${pathname}?${queryString}`, { scroll: false });
        }}
      />
      {data?.latitude && data?.longitude && (
            <PropertyMap
              latitude={data.latitude}
              longitude={data.longitude}
              propertyName={data.name}
              address={data.address}
            />
      )}

      {/* Rooms List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
        <RoomsList
          rooms={data?.roomTypes}
          checkIn={parsedCheckIn}
          checkOut={parsedCheckOut}
          guests={Number(guests)}
        />
      </Card>

      {/* Facilities */}
      <FacilitiesList facilities={data?.facilities} />

      {/* Reviews */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Guest Reviews</h2>
        <ReviewsList reviews={data?.reviews} />
      </Card>
    </div>
  </div>
</div>
  );
}
