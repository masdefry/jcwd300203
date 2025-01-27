import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';

interface AddressComponents {
  street_address?: string;
  city?: string;
  administrative_area_level_1?: string;
  country?: string;
}

export const MapPicker = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const { values, setFieldValue } = useFormikContext<any>();

  const updateAddressFields = useCallback((results: google.maps.GeocoderResult[]) => {
    if (results[0]) {
      let city = '';
      let detailedAddress = '';
  
      results[0].address_components?.forEach(component => {
        if (
          component.types.includes('locality') || 
          component.types.includes('administrative_area_level_2') || 
          component.types.includes('sublocality_level_1') 
        ) {
          city = component.long_name;
        }
      });
  
      if (!city) {
        const adminArea = results[0].address_components?.find(
          component => component.types.includes('administrative_area_level_2')
        );
        if (adminArea) {
          city = adminArea.long_name;
        }
      }
  
      detailedAddress = results[0].formatted_address;
  
      setFieldValue('address', detailedAddress);
      if (city) {
        setFieldValue('city', city);
      }
  
      // Set coordinates
      if (results[0].geometry?.location) {
        setFieldValue('latitude', results[0].geometry.location.lat().toString());
        setFieldValue('longitude', results[0].geometry.location.lng().toString());
      }
    }
  }, [setFieldValue]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const initMap = async () => {
      const defaultLocation = { lat: -8.409518, lng: 115.188919 };
      const initialLocation = values.latitude && values.longitude 
        ? { lat: Number(values.latitude), lng: Number(values.longitude) }
        : defaultLocation;
        if (!mapRef.current) return; 
      const mapInstance = new google.maps.Map(mapRef.current!, {
        zoom: 13,
        center: initialLocation,
      });

      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: initialLocation,
      });

      const geocoder = new google.maps.Geocoder();
      const searchBox = new google.maps.places.SearchBox(
        document.createElement('input')
      );

      // Add search box to map
      const searchInput = document.createElement('input');
      searchInput.className = 'map-search-box';
      searchInput.placeholder = 'Search location';
      mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);

      const searchBoxInstance = new google.maps.places.SearchBox(searchInput);

      // Update marker and fields when marker is dragged
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          setFieldValue('latitude', position.lat().toString());
          setFieldValue('longitude', position.lng().toString());

          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results) {
              updateAddressFields(results);
            }
          });
        }
      });

      // Handle place selection from search box
      searchBoxInstance.addListener('places_changed', () => {
        const places = searchBoxInstance.getPlaces();
        if (places?.length) {
          const place = places[0];
          if (place.geometry?.location) {
            mapInstance.setCenter(place.geometry.location);
            markerInstance.setPosition(place.geometry.location);
            setFieldValue('latitude', place.geometry.location.lat().toString());
            setFieldValue('longitude', place.geometry.location.lng().toString());

            geocoder.geocode({ location: place.geometry.location }, (results, status) => {
              if (status === 'OK' && results) {
                updateAddressFields(results);
              }
            });
          }
        }
      });

      // Initial geocoding if address exists
      if (values.address && (!values.latitude || !values.longitude)) {
        geocoder.geocode({ address: values.address }, (results, status) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            markerInstance.setPosition(location);
            mapInstance.setCenter(location);
            setFieldValue('latitude', location.lat().toString());
            setFieldValue('longitude', location.lng().toString());
            updateAddressFields(results);
          }
        });
      }

      setMap(mapInstance);
      setMarker(markerInstance);
    };

    initMap();
  }, [values.address, values.latitude, values.longitude, setFieldValue, updateAddressFields]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1">Location</label>
      <div 
        ref={mapRef} 
        className="w-full h-[300px] rounded-lg border"
      />
      <style jsx global>{`
        .map-search-box {
          margin: 10px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          width: 300px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};