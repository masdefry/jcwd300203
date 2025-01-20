import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface PropertyMapProps {
  latitude: string;
  longitude: string;
  propertyName: string;
  address: string;
}

const PropertyMap = ({ latitude, longitude, propertyName, address }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Add marker for the property
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: propertyName,
      animation: google.maps.Animation.DROP,
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold">${propertyName}</h3>
          <p class="text-sm text-gray-600">${address}</p>
        </div>
      `,
    });

    // Show info window on marker click
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

  }, [latitude, longitude, propertyName, address]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Location</h2>
      <div 
        ref={mapRef} 
        className="w-full h-[300px] rounded-lg"
        style={{ border: '1px solid #e2e8f0' }}
      />
      <div className="mt-4">
        <p className="text-sm text-gray-600">{address}</p>
        <button 
          onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          View on Google Maps
        </button>
      </div>
    </Card>
  );
};

export default PropertyMap;