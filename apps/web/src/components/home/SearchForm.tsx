import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faUsers, faSearch } from "@fortawesome/free-solid-svg-icons";
import CheckInCheckOutField from "./CheckInCheckoutForm";
import { useRouter } from "next/navigation";

const SearchForm = () => {
  const [formState, setFormState] = useState({
    destination: "",
    dateRange: [null, null] as [Date | null, Date | null],
    guests: "",
    sortBy: 'name',
    orderBy: 'asc',
    page: 1,
    limit: 10
  });
  const router = useRouter()
  const [guestDropdown, setGuestDropdown] = useState(false);

  // Check if all fields are filled
  const isFormValid =
    formState.destination.trim() !== "" &&
    formState.dateRange[0] !== null &&
    formState.dateRange[1] !== null &&
    formState.guests.trim() !== "";

  // Handle input change
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Construct query parameters
    const queryParams = new URLSearchParams({
      search: formState.destination,
      checkIn: formState.dateRange[0]?.toISOString().split("T")[0] || "",
      checkOut: formState.dateRange[1]?.toISOString().split("T")[0] || "",
      guest: formState.guests,
      sortBy: formState.sortBy,
      orderBy: formState.orderBy,
      page: formState.page.toString(),
      limit: formState.limit.toString(),
    });

      router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <div className="search-bar-container bg-white p-3 rounded shadow-lg parag mt-4">
      <form className="row g-2 align-items-center" onSubmit={handleSubmit}>
        {/* Destination Input */}
        <div className="col-lg-4 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faBed} />
            </span>
            <input
              type="text"
              className="form-control"
              name="destination"
              placeholder="Where to?"
              value={formState.destination}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Check-in & Check-out Dates */}
        <CheckInCheckOutField formState={formState} setFormState={setFormState} />

        {/* Number of Guests */}
        <div className="col-lg-3 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <input
              type="text"
              className="form-control"
              name="guests"
              placeholder="How many?"
              value={formState.guests}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="col-lg-auto col-md-6 col-12 d-flex justify-content-center">
          <button
            type="submit"
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: isFormValid ? "#ff5a5f" : "#ccc",
              border: "none",
              color: "#fff",
            }}
            disabled={!isFormValid}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
