import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getImageUrl } from '@/utils/getImageUrl';
import { PropertyMap } from './PropertyMapTenant';
import { ReviewsList } from './ReviewListTenant';
import { RoomsList } from './RoomListTenant';
import { PropertyInfo } from './PropertyInfoTenant';
import { PropertyGallery } from './PropertyPhotosTenant';
import { FacilitiesList } from './PropertyFacilitiesTenant';

  
const PropertyDetailsTenant = ({ property }: any) => {
    return(
    <div className="max-w-4xl mx-auto py-6">
    <PropertyInfo data={property} />
    <PropertyGallery mainImage={property.mainImage} images={property.images} />
    <FacilitiesList facilities={property.facilities} />
    
    {property.latitude && property.longitude && (
      <PropertyMap
        latitude={property.latitude}
        longitude={property.longitude}
        propertyName={property.name}
        address={property.address}
      />
    )}

    <RoomsList rooms={property.roomTypes} />

    <Accordion type="single" collapsible className="mt-8">
    <AccordionItem value="bookings">
  <AccordionTrigger>Current Bookings</AccordionTrigger>
  <AccordionContent>
    {property.roomTypes.map((room: any) => (
      <div key={room.id} className="mb-4">
        <h4 className="font-medium mb-2">{room.name}</h4>
        {room.currentBookings?.map((booking: any) => (
          <div key={booking.status[0].bookingId} className="border-b py-2">
            <div className="grid grid-cols-2 gap-2">
              <p>Check In: {new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p>Check Out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
            </div>
            <p>Rooms: {booking.quantity}</p>
            <p>Status: {booking.status[0].Status}</p>
          </div>
        ))}
      </div>
    ))}
  </AccordionContent>
</AccordionItem>

      <AccordionItem value="reviews">
        <AccordionTrigger>Reviews</AccordionTrigger>
        <AccordionContent>
          <ReviewsList reviews={property.reviews} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
  );
};

export default PropertyDetailsTenant;