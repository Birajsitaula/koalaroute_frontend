import React, { useState } from "react";
import axios from "axios";
import "./ManualHotelForm.css";

const ManualHotelForm = () => {
  const [activeTab, setActiveTab] = useState("offers");
  const [searchParams, setSearchParams] = useState({
    cityCode: "",
    adults: "1",
    checkInDate: "",
    checkOutDate: "",
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    title: "MR",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [expandedHotel, setExpandedHotel] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchHotels = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let url = "";
      let params = {};

      if (activeTab === "list") {
        if (!searchParams.cityCode) {
          setError("Please enter a city code");
          setLoading(false);
          return;
        }
        url = "/api/hotels/list";
        params = { cityCode: searchParams.cityCode };
      } else {
        if (
          !searchParams.cityCode ||
          !searchParams.checkInDate ||
          !searchParams.checkOutDate
        ) {
          setError("Please fill all required fields");
          setLoading(false);
          return;
        }
        url = "/api/hotels";
        params = {
          cityCode: searchParams.cityCode,
          adults: searchParams.adults,
          checkInDate: searchParams.checkInDate,
          checkOutDate: searchParams.checkOutDate,
        };
      }

      const response = await axios.get(url, { params });

      if (activeTab === "list") {
        setHotels(response.data.data || []);
      } else {
        setHotels(response.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "An error occurred while searching for hotels"
      );
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookOffer = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
    setBookingSuccess(false);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError("");

    try {
      const guests = [
        {
          name: {
            title: bookingData.title,
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
          },
          contact: {
            phone: bookingData.phone,
            email: bookingData.email,
          },
        },
      ];

      const response = await axios.post("/api/hotels/book", {
        offerId: selectedOffer.id,
        guests,
      });

      setBookingSuccess(true);
      // You might want to do something with the booking response
      console.log("Booking successful:", response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price?.currency || "USD",
    }).format(price?.total || 0);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const toggleHotelExpansion = (hotelIndex) => {
    setExpandedHotel(expandedHotel === hotelIndex ? null : hotelIndex);
  };

  const resetSearch = () => {
    setHotels([]);
    setError("");
    setSearchParams({
      cityCode: "",
      adults: "1",
      checkInDate: "",
      checkOutDate: "",
    });
  };

  const popularCities = [
    { code: "NYC", name: "New York" },
    { code: "LON", name: "London" },
    { code: "PAR", name: "Paris" },
    { code: "TYO", name: "Tokyo" },
    { code: "DXB", name: "Dubai" },
    { code: "SYD", name: "Sydney" },
  ];

  return (
    <div className="hotel-search-container">
      <div className="hotel-header">
        <div className="hotel-title">
          <span className="hotel-icon">🏨</span>
          <h3>Hotel Search & Booking</h3>
        </div>
        <p>Find and book your perfect stay</p>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "offers" ? "active" : ""}`}
            onClick={() => setActiveTab("offers")}
          >
            Hotel Offers
          </button>
          <button
            className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Hotel List
          </button>
        </div>
      </div>

      <div className="scrollable-content">
        <div className="quick-search-section">
          <div className="quick-search-title">Popular Cities</div>
          <div className="suggestion-chips">
            {popularCities.map((city) => (
              <button
                key={city.code}
                onClick={() =>
                  setSearchParams((prev) => ({ ...prev, cityCode: city.code }))
                }
              >
                {city.name} ({city.code})
              </button>
            ))}
          </div>
        </div>

        <form className="hotel-search-form" onSubmit={searchHotels}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cityCode">City Code *</label>
              <input
                type="text"
                id="cityCode"
                name="cityCode"
                className="modern-input"
                value={searchParams.cityCode}
                onChange={handleInputChange}
                placeholder="e.g., NYC, LON, PAR"
                required
              />
            </div>

            {activeTab === "offers" && (
              <>
                <div className="form-group">
                  <label htmlFor="adults">Adults</label>
                  <select
                    id="adults"
                    name="adults"
                    className="modern-select"
                    value={searchParams.adults}
                    onChange={handleInputChange}
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="checkInDate">Check-in Date *</label>
                  <input
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    className="modern-input"
                    value={searchParams.checkInDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOutDate">Check-out Date *</label>
                  <input
                    type="date"
                    id="checkOutDate"
                    name="checkOutDate"
                    className="modern-input"
                    value={searchParams.checkOutDate}
                    onChange={handleInputChange}
                    min={searchParams.checkInDate || getTomorrowDate()}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className={`search-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading && <div className="button-spinner"></div>}
            {loading
              ? "Searching..."
              : `Search ${activeTab === "offers" ? "Offers" : "Hotels"}`}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-results">
            <div className="loading-spinner"></div>
            <p>Searching for hotels...</p>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>
                Found {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}
              </h3>
              <button className="reset-button" onClick={resetSearch}>
                New Search
              </button>
            </div>

            <div className="hotels-grid">
              {hotels.map((hotel, index) => (
                <div
                  key={index}
                  className={`hotel-card ${
                    expandedHotel === index ? "expanded" : ""
                  }`}
                >
                  <div
                    className="hotel-card-main"
                    onClick={() => toggleHotelExpansion(index)}
                  >
                    <div className="hotel-info">
                      <div className="hotel-brand">
                        <div className="hotel-logo">🏨</div>
                        <div className="hotel-details">
                          <div className="hotel-name">
                            {hotel.hotel?.name || hotel.name}
                          </div>
                          <div className="hotel-category">
                            {hotel.hotel?.rating &&
                              `⭐ ${hotel.hotel.rating} Star Hotel`}
                          </div>
                          <div className="hotel-address">
                            {hotel.hotel?.address?.lines?.join(", ")}
                            {hotel.hotel?.address?.cityName &&
                              `, ${hotel.hotel.address.cityName}`}
                            {hotel.hotel?.address?.postalCode &&
                              `, ${hotel.hotel.address.postalCode}`}
                          </div>
                          {hotel.hotel?.contact?.phone && (
                            <div className="hotel-contact">
                              📞 {hotel.hotel.contact.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {activeTab === "offers" &&
                        hotel.offers &&
                        hotel.offers[0] && (
                          <div className="hotel-price">
                            <div className="price-amount">
                              {formatPrice(hotel.offers[0].price)}
                            </div>
                            <div className="price-per-night">total stay</div>
                          </div>
                        )}
                    </div>

                    <div className="expand-indicator">
                      {expandedHotel === index
                        ? "▲ Click to collapse"
                        : "▼ Click for details"}
                    </div>
                  </div>

                  {expandedHotel === index &&
                    activeTab === "offers" &&
                    hotel.offers && (
                      <div className="hotel-details-expanded">
                        <div className="amenities-section">
                          <div className="amenities-header">
                            <div className="amenities-title">
                              Available Rooms
                            </div>
                          </div>

                          <div className="room-offers">
                            {hotel.offers.map((offer, offerIndex) => (
                              <div key={offerIndex} className="room-offer">
                                <div className="room-header">
                                  <div className="room-type">
                                    {offer.room?.typeEstimated?.category ||
                                      "Standard Room"}
                                  </div>
                                  <div className="room-price">
                                    {formatPrice(offer.price)}
                                  </div>
                                </div>

                                {offer.room?.description?.text && (
                                  <div className="room-description">
                                    {offer.room.description.text}
                                  </div>
                                )}

                                <div className="room-features">
                                  {offer.room?.typeEstimated?.beds && (
                                    <span className="room-feature">
                                      🛏️ {offer.room.typeEstimated.beds}{" "}
                                      {offer.room.typeEstimated.beds === 1
                                        ? "bed"
                                        : "beds"}
                                    </span>
                                  )}
                                  {offer.room?.typeEstimated?.bedType && (
                                    <span className="room-feature">
                                      🛌 {offer.room.typeEstimated.bedType}
                                    </span>
                                  )}
                                </div>

                                <div className="room-actions">
                                  <button
                                    className="select-room-btn"
                                    onClick={() => handleBookOffer(offer)}
                                  >
                                    Book Now
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {expandedHotel === index && activeTab === "list" && (
                    <div className="hotel-details-expanded">
                      <div className="amenities-section">
                        <div className="amenities-header">
                          <div className="amenities-title">Hotel Details</div>
                        </div>

                        <div className="amenities-grid">
                          <div className="amenity-item">
                            <span className="amenity-icon">🏢</span>
                            Hotel Chain
                          </div>
                          <div className="amenity-item">
                            <span className="amenity-icon">📍</span>
                            {hotel.iataCode || "N/A"}
                          </div>
                          {hotel.hotel?.amenities && (
                            <div className="amenity-item">
                              <span className="amenity-icon">⭐</span>
                              Amenities Available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && hotels.length === 0 && !error && (
          <div className="no-results">
            <p>No hotels found. Try searching with different parameters.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>Complete Your Booking</h3>
              <button
                className="modal-close"
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {!bookingSuccess ? (
                <form className="booking-form" onSubmit={submitBooking}>
                  <h4>Guest Information</h4>

                  <div className="form-grid-modal">
                    <div className="form-group">
                      <label htmlFor="title">Title</label>
                      <select
                        id="title"
                        name="title"
                        className="modern-select"
                        value={bookingData.title}
                        onChange={handleBookingInputChange}
                        required
                      >
                        <option value="MR">Mr</option>
                        <option value="MS">Ms</option>
                        <option value="MRS">Mrs</option>
                        <option value="DR">Dr</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="modern-input"
                        value={bookingData.firstName}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="modern-input"
                        value={bookingData.lastName}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="modern-input"
                        value={bookingData.phone}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="modern-input"
                        value={bookingData.email}
                        onChange={handleBookingInputChange}
                        required
                      />
                    </div>
                  </div>

                  {selectedOffer && (
                    <div className="booking-details">
                      <p>
                        <strong>Hotel:</strong> {selectedOffer.hotel?.name}
                      </p>
                      <p>
                        <strong>Room:</strong>{" "}
                        {selectedOffer.room?.typeEstimated?.category ||
                          "Standard Room"}
                      </p>
                      <p>
                        <strong>Total Price:</strong>{" "}
                        {formatPrice(selectedOffer.price)}
                      </p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setShowBookingModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="confirmation-content">
                  <div className="success-icon">✅</div>
                  <h4>Booking Confirmed!</h4>
                  <p>Your hotel reservation has been successfully completed.</p>

                  {selectedOffer && (
                    <div className="booking-details">
                      <p>
                        <strong>Hotel:</strong> {selectedOffer.hotel?.name}
                      </p>
                      <p>
                        <strong>Room Type:</strong>{" "}
                        {selectedOffer.room?.typeEstimated?.category ||
                          "Standard Room"}
                      </p>
                      <p>
                        <strong>Total Amount:</strong>{" "}
                        {formatPrice(selectedOffer.price)}
                      </p>
                      <p>
                        <strong>Guest:</strong> {bookingData.firstName}{" "}
                        {bookingData.lastName}
                      </p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      className="primary-btn"
                      onClick={() => {
                        setShowBookingModal(false);
                        setBookingSuccess(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualHotelForm;
