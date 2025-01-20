import { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faUsers, faSearch } from "@fortawesome/free-solid-svg-icons";
import CheckInCheckOutField from "./CheckInCheckoutForm";
import { useRouter } from "next/navigation";

interface FormState {
  destination: string;
  dateRange: [Date | null, Date | null];
  guests: string;
}

interface Prediction {
  description: string;
  place_id: string;
}

interface LocationData {
  description: string;
  place_id: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  cityName?: string;
}

const SearchForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<FormState>({
    destination: "",
    dateRange: [null, null],
    guests: "",
  });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.AutocompleteService | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const checkGoogleMapsLoaded = setInterval(() => {
      if (window.google?.maps?.places) {
        try {
          const service = new google.maps.places.AutocompleteService();
          const geocoderService = new google.maps.Geocoder();
          setPlacesService(service);
          setGeocoder(geocoderService);
          setIsLoading(false);
          clearInterval(checkGoogleMapsLoaded);
          console.log('Services initialized successfully');
        } catch (error) {
          console.error('Error initializing services:', error);
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkGoogleMapsLoaded);
      if (!window.google?.maps?.places) {
        console.error('Google Maps failed to load after 5 seconds');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      clearInterval(checkGoogleMapsLoaded);
      clearTimeout(timeout);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, destination: value }));

    if (!placesService || value.length < 2) return;

    try {
      console.log('Fetching predictions for:', value);
      const request = {
        input: value,
        componentRestrictions: { country: 'id' },
        types: ['(cities)']
      };

      const response = await placesService.getPlacePredictions(request);
      console.log('Predictions:', response.predictions);
      setPredictions(response.predictions || []);
    } catch (error) {
      console.error('Error getting predictions:', error);
    }
  };


  const handlePredictionClick = (prediction: Prediction) => {
    setFormState(prev => ({ ...prev, destination: prediction.description }));
    setPredictions([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove the early return and make it work without coordinates if needed
    const queryParams = new URLSearchParams({
      search: formState.destination,
      checkIn: formState.dateRange[0]?.toISOString().split("T")[0] || "",
      checkOut: formState.dateRange[1]?.toISOString().split("T")[0] || "",
      guest: formState.guests,
    });
  
    // Add coordinates if available
    if (selectedLocation?.coordinates) {
      queryParams.append('latitude', selectedLocation.coordinates.lat.toString());
      queryParams.append('longitude', selectedLocation.coordinates.lng.toString());
      queryParams.append('radius', searchRadius.toString());
    }
  
    if (selectedLocation?.cityName) {
      queryParams.append('city', selectedLocation.cityName);
    }
  
    console.log('Redirecting to:', `/search?${queryParams.toString()}`);
    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <div className="search-bar-container bg-white p-3 rounded shadow-lg mt-4">
    <form className="row g-2 align-items-center" onSubmit={handleSearch}>
      <div className="col-lg-4 col-md-6">
        <div className="relative"> {/* Changed from position-relative for better compatibility */}
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faBed} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Where to?"
              value={formState.destination}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
          
          {/* Modified dropdown to ensure content appears */}
          {predictions.length > 0 && (
  <div 
    className="absolute w-full bg-white border rounded-lg shadow-lg"
    style={{ 
      top: 'calc(100% + 5px)',
      left: 0,
      right: 0,
      zIndex: 9999
    }}
  >
    {predictions.map((prediction) => (
      <div
        key={prediction.place_id}
        onClick={() => handlePredictionClick(prediction)}
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors text-black" // Added text-black here
      >
        {prediction.description}
      </div>
    ))}
  </div>
)}
        </div>
      </div>
       

        {/* Rest of your form */}
        <CheckInCheckOutField formState={formState} setFormState={setFormState} />

        <div className="col-lg-3 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <input 
              type="text"
              className="form-control"
              placeholder="How many?"
              value={formState.guests}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                guests: e.target.value.replace(/\D/g, '')
              }))}
            />
          </div>
        </div>

        <div className="col-lg-auto col-md-6 col-12 d-flex justify-content-center">
          <button
            type="submit"
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: "#ff5a5f",
              border: "none",
              color: "#fff",
            }}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;