import { useEffect, useRef } from 'react';

interface PropertyMapProps {
  latitude: string;
  longitude: string;
  propertyName: string;
  address: string;
}

export function PropertyMap({ latitude, longitude, propertyName, address }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      mapTypeControl: false,
    });

    new google.maps.Marker({
      position: location,
      map: map,
      title: propertyName,
    });
  }, [latitude, longitude, propertyName]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Location</h2>
      <div ref={mapRef} className="w-full h-[300px] rounded-lg border" />
      <p className="mt-2 text-sm text-gray-600">{address}</p>
    </div>
  );
}