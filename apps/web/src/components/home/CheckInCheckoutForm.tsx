import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const CheckInCheckOutField = ({ formState, setFormState }: any) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
  
    // Handle date changes
    const handleDateChange = (update: any) => {
      setFormState((prev: any) => ({
        ...prev,
        dateRange: update,
      }));
    };
  
    return (
      <div className="col-lg-4 col-md-6 position-relative">
        <div
          className="input-group"
          onClick={() => setShowDatePicker((prev) => !prev)} // Toggle DatePicker on click
        >
          <span className="input-group-text bg-light">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="When is it best?"
            value={
              formState.dateRange[0] && formState.dateRange[1]
                ? `${formState.dateRange[0].toLocaleDateString()} - ${formState.dateRange[1].toLocaleDateString()}`
                : ""
            }
            readOnly // Prevent user typing
          />
        </div>
  
        {/* Render DatePicker as a dropdown */}
        {showDatePicker && (
          <div
            className="position-absolute bg-white p-3 rounded shadow"
            style={{ zIndex: 1000, marginTop: "5px" }}
          >
            <DatePicker
              selected={formState.dateRange[0]}
              onChange={(update) => handleDateChange(update)}
              startDate={formState.dateRange[0]}
              endDate={formState.dateRange[1]}
              selectsRange
              inline
            />
          </div>
        )}
      </div>
    );
};

export default CheckInCheckOutField;