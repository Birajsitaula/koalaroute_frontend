import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config.js";
import "./ManualFlightForm.css";

export default function FlightSearch() {
  const [activeTab, setActiveTab] = useState("search");
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: 1,
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [bookingFlow, setBookingFlow] = useState(null);
  const [travelerInfo, setTravelerInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    passportCountry: "",
  });
  const [inspirationResults, setInspirationResults] = useState([]);
  const [cheapestDates, setCheapestDates] = useState([]);
  const [flightStatus, setFlightStatus] = useState(null);
  const [airportResults, setAirportResults] = useState([]);
  const [airlineInfo, setAirlineInfo] = useState(null);

  const resultsRef = useRef(null);

  useEffect(() => {
    if (flights.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [flights]);

  // ========== FLIGHT BOOKING FUNCTIONS ==========

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "adults" ? parseInt(value) : value,
    }));
    setError("");
  };

  const handleTravelerChange = (field, value) => {
    setTravelerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFlightSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setExpandedFlight(null);
    setBookingFlow(null);

    if (!formData.origin || !formData.destination || !formData.departureDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.origin === formData.destination) {
      setError("Origin and destination cannot be the same");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/flight-offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: formData.origin.toUpperCase(),
          destination: formData.destination.toUpperCase(),
          departureDate: formData.departureDate,
          returnDate: formData.returnDate || undefined,
          adults: formData.adults,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.msg || data.error?.message || "Failed to fetch flights"
        );
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
      } else {
        throw new Error("No flights found for your search criteria");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceCheck = async (flightOffer) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/flight-offers/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightOffers: [flightOffer],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Price check failed");
      }

      return data.data.flightOffers[0];
    } catch (err) {
      console.error("Price check error:", err);
      setError(err.message || "Price check failed");
      return flightOffer; // Return original if pricing fails
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = async (flightOffer) => {
    try {
      setLoading(true);

      // Validate traveler info
      const requiredFields = [
        "firstName",
        "lastName",
        "dateOfBirth",
        "gender",
        "email",
        "phone",
        "passportNumber",
        "passportExpiry",
        "passportCountry",
      ];
      const missingFields = requiredFields.filter(
        (field) => !travelerInfo[field]
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
      }

      const res = await fetch(`${API_BASE_URL}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightOffer: flightOffer,
          travelerInfo: travelerInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || data.error?.message || "Booking failed");
      }

      setBookingFlow({ step: "confirmation", booking: data.data });
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ========== FLIGHT INSPIRATION FUNCTIONS ==========

  const handleFlightInspiration = async () => {
    if (!formData.origin) {
      setError("Please enter an origin city/airport");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/flight-inspiration?origin=${formData.origin.toUpperCase()}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Inspiration search failed");
      }

      setInspirationResults(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheapestDates = async () => {
    if (!formData.origin || !formData.destination) {
      setError("Please enter both origin and destination");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/flight-cheapest?origin=${formData.origin.toUpperCase()}&destination=${formData.destination.toUpperCase()}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Cheapest dates search failed");
      }

      setCheapestDates(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FLIGHT STATUS FUNCTION ==========

  const handleFlightStatus = async () => {
    const carrierCode = prompt("Enter airline code (e.g., AA):");
    const flightNumber = prompt("Enter flight number:");
    const date = prompt("Enter departure date (YYYY-MM-DD):");

    if (!carrierCode || !flightNumber || !date) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/flight-status?carrierCode=${carrierCode}&flightNumber=${flightNumber}&scheduledDepartureDate=${date}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Flight status check failed");
      }

      setFlightStatus(data.data[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== AIRPORT SEARCH FUNCTION ==========

  const handleAirportSearch = async (keyword) => {
    if (!keyword) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/airport-search?keyword=${keyword}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Airport search failed");
      }

      setAirportResults(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== AIRLINE LOOKUP FUNCTION ==========

  const handleAirlineLookup = async (airlineCode) => {
    if (!airlineCode) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/airline?airlineCode=${airlineCode}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Airline lookup failed");
      }

      setAirlineInfo(data.data[0] || null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== HELPER FUNCTIONS ==========

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDuration = (duration) => {
    if (!duration) return "";
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "", time: "", weekday: "" };
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const toggleFlightDetails = (index) => {
    setExpandedFlight(expandedFlight === index ? null : index);
  };

  const quickSearch = (route) => {
    const [origin, destination] = route.split("-");
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setFormData((prev) => ({
      ...prev,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate: nextWeek.toISOString().split("T")[0],
    }));
  };

  const startBookingProcess = async (flight) => {
    setBookingFlow({ step: "passenger_details", selectedFlight: flight });

    // Get updated pricing
    const pricedFlight = await handlePriceCheck(flight);
    if (pricedFlight) {
      setBookingFlow({
        step: "passenger_details",
        selectedFlight: pricedFlight,
      });
    }
  };

  const getAirlineName = (airlineCode) => {
    const airlines = {
      AA: "American Airlines",
      DL: "Delta Air Lines",
      UA: "United Airlines",
      LH: "Lufthansa",
      BA: "British Airways",
      AF: "Air France",
      EK: "Emirates",
      SQ: "Singapore Airlines",
      WN: "Southwest Airlines",
      AS: "Alaska Airlines",
      B6: "JetBlue",
    };
    return airlines[airlineCode] || airlineCode;
  };

  const resetForm = () => {
    setFormData({
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      adults: 1,
    });
    setFlights([]);
    setError("");
    setBookingFlow(null);
    setInspirationResults([]);
    setCheapestDates([]);
    setFlightStatus(null);
    setAirportResults([]);
    setAirlineInfo(null);
    setTravelerInfo({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      phone: "",
      passportNumber: "",
      passportExpiry: "",
      passportCountry: "",
    });
  };

  return (
    <div className="flight-search-container">
      {/* Header with Tabs */}
      <div className="flight-header">
        <div className="flight-title">
          <span className="flight-icon">✈️</span>
          <h3>Flight Search & Booking</h3>
        </div>
        <p>Find and book flights with real-time pricing</p>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            🔍 Flight Search
          </button>
          <button
            className={`tab-btn ${activeTab === "inspiration" ? "active" : ""}`}
            onClick={() => setActiveTab("inspiration")}
          >
            💡 Travel Inspiration
          </button>
          <button
            className={`tab-btn ${activeTab === "status" ? "active" : ""}`}
            onClick={() => setActiveTab("status")}
          >
            🕒 Flight Status
          </button>
          <button
            className={`tab-btn ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            🛠️ Travel Tools
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="scrollable-content">
        {/* Quick Search Chips */}
        <div className="quick-search-section">
          <p className="quick-search-title">Popular Routes:</p>
          <div className="suggestion-chips">
            <button onClick={() => quickSearch("NYC-LAX")}>NYC → LAX</button>
            <button onClick={() => quickSearch("LON-PAR")}>LON → PAR</button>
            <button onClick={() => quickSearch("SYD-MEL")}>SYD → MEL</button>
            <button onClick={() => quickSearch("TOK-SEO")}>TOK → SEO</button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* FLIGHT SEARCH TAB */}
        {activeTab === "search" && (
          <>
            <form onSubmit={handleFlightSearch} className="flight-search-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>From *</label>
                  <input
                    type="text"
                    placeholder="City or Airport (e.g., NYC)"
                    value={formData.origin}
                    onChange={(e) =>
                      handleChange("origin", e.target.value.toUpperCase())
                    }
                    maxLength={3}
                    required
                    className="modern-input"
                  />
                </div>

                <div className="form-group">
                  <label>To *</label>
                  <input
                    type="text"
                    placeholder="City or Airport (e.g., LAX)"
                    value={formData.destination}
                    onChange={(e) =>
                      handleChange("destination", e.target.value.toUpperCase())
                    }
                    maxLength={3}
                    required
                    className="modern-input"
                  />
                </div>

                <div className="form-group">
                  <label>Departure Date *</label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) =>
                      handleChange("departureDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="modern-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Return Date <span className="optional">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleChange("returnDate", e.target.value)}
                    min={
                      formData.departureDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="modern-input"
                  />
                </div>

                <div className="form-group">
                  <label>Passengers *</label>
                  <select
                    value={formData.adults}
                    onChange={(e) => handleChange("adults", e.target.value)}
                    className="modern-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className={`search-button ${loading ? "loading" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="button-spinner"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">🔍</span>
                        Search Flights
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Results Section */}
            {flights.length > 0 && (
              <div ref={resultsRef} className="results-section">
                <div className="results-header">
                  <h3>
                    Found {flights.length} Flight
                    {flights.length !== 1 ? "s" : ""}
                  </h3>
                  <button className="reset-button" onClick={resetForm}>
                    New Search
                  </button>
                </div>

                <div className="flights-grid">
                  {flights.map((flight, index) => (
                    <div
                      key={flight.id || index}
                      className={`flight-card ${
                        expandedFlight === index ? "expanded" : ""
                      }`}
                    >
                      <div
                        className="flight-card-main"
                        onClick={() => toggleFlightDetails(index)}
                      >
                        <div className="flight-info">
                          <div className="airline-brand">
                            <div className="airline-logo">✈️</div>
                            <div className="airline-details">
                              <div className="airline-name">
                                {getAirlineName(
                                  flight.validatingAirlineCodes?.[0]
                                ) || "Multiple Airlines"}
                              </div>
                              <div className="flight-type">
                                {flight.itineraries?.length > 1
                                  ? "Round Trip"
                                  : "One Way"}
                              </div>
                            </div>
                          </div>

                          <div className="route-times">
                            <div className="time-block">
                              <div className="time">
                                {
                                  formatDateTime(
                                    flight.itineraries?.[0]?.segments?.[0]
                                      ?.departure?.at
                                  ).time
                                }
                              </div>
                              <div className="airport">
                                {
                                  flight.itineraries?.[0]?.segments?.[0]
                                    ?.departure?.iataCode
                                }
                              </div>
                            </div>

                            <div className="duration-route">
                              <div className="duration">
                                {formatDuration(
                                  flight.itineraries?.[0]?.duration
                                )}
                              </div>
                              <div className="route-line">
                                <div className="route-dot start"></div>
                                <div className="route-line-middle"></div>
                                <div className="route-dot end"></div>
                              </div>
                              <div className="stops">
                                {flight.itineraries?.[0]?.segments?.length -
                                  1 ===
                                0
                                  ? "Non-stop"
                                  : `${
                                      flight.itineraries?.[0]?.segments
                                        ?.length - 1
                                    } stop${
                                      flight.itineraries?.[0]?.segments
                                        ?.length -
                                        1 !==
                                      1
                                        ? "s"
                                        : ""
                                    }`}
                              </div>
                            </div>

                            <div className="time-block">
                              <div className="time">
                                {
                                  formatDateTime(
                                    flight.itineraries?.[0]?.segments?.[
                                      flight.itineraries?.[0]?.segments
                                        ?.length - 1
                                    ]?.arrival?.at
                                  ).time
                                }
                              </div>
                              <div className="airport">
                                {
                                  flight.itineraries?.[0]?.segments?.[
                                    flight.itineraries?.[0]?.segments?.length -
                                      1
                                  ]?.arrival?.iataCode
                                }
                              </div>
                            </div>
                          </div>

                          <div className="flight-price">
                            <div className="price-amount">
                              {formatCurrency(flight.price?.total)}
                            </div>
                            <div className="price-per-person">total</div>
                            <div className="expand-indicator">
                              {expandedFlight === index ? "▲" : "▼"} Details
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedFlight === index && (
                        <div className="flight-details">
                          {flight.itineraries?.map(
                            (itinerary, itineraryIndex) => (
                              <div
                                key={itineraryIndex}
                                className="itinerary-details"
                              >
                                <div className="itinerary-header">
                                  <span className="itinerary-title">
                                    {itineraryIndex === 0
                                      ? "Outbound"
                                      : "Return"}{" "}
                                    •{" "}
                                    {
                                      formatDateTime(
                                        itinerary.segments?.[0]?.departure?.at
                                      ).date
                                    }
                                  </span>
                                  <span className="itinerary-duration">
                                    Duration:{" "}
                                    {formatDuration(itinerary.duration)}
                                  </span>
                                </div>

                                {itinerary.segments?.map(
                                  (segment, segmentIndex) => (
                                    <div
                                      key={segmentIndex}
                                      className="segment-detail"
                                    >
                                      <div className="segment-route">
                                        <div className="segment-airports">
                                          <span className="airport-code">
                                            {segment.departure?.iataCode}
                                          </span>
                                          <span className="city-name">
                                            {segment.departure?.iataCode}
                                          </span>
                                        </div>

                                        <div className="segment-times">
                                          <span className="departure-time">
                                            {
                                              formatDateTime(
                                                segment.departure?.at
                                              ).time
                                            }
                                          </span>
                                          <div className="flight-duration">
                                            {formatDuration(segment.duration)}
                                          </div>
                                          <span className="arrival-time">
                                            {
                                              formatDateTime(
                                                segment.arrival?.at
                                              ).time
                                            }
                                          </span>
                                        </div>

                                        <div className="segment-airports">
                                          <span className="airport-code">
                                            {segment.arrival?.iataCode}
                                          </span>
                                          <span className="city-name">
                                            {segment.arrival?.iataCode}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="segment-info">
                                        <span>
                                          {getAirlineName(segment.carrierCode)}{" "}
                                          • Flight {segment.number}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          )}

                          <div className="flight-actions">
                            <button
                              className="select-flight-btn"
                              onClick={() => startBookingProcess(flight)}
                            >
                              Book This Flight
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !flights.length && (
              <div className="loading-results">
                <div className="loading-spinner"></div>
                <p>Searching for the best flights...</p>
              </div>
            )}
          </>
        )}

        {/* TRAVEL INSPIRATION TAB */}
        {activeTab === "inspiration" && (
          <div className="inspiration-tab">
            <div className="inspiration-actions">
              <div className="action-group">
                <h4>Find Flight Inspiration</h4>
                <p>Discover cheapest destinations from your departure city</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter origin (e.g., NYC)"
                    value={formData.origin}
                    onChange={(e) =>
                      handleChange("origin", e.target.value.toUpperCase())
                    }
                    className="modern-input"
                  />
                  <button onClick={handleFlightInspiration} disabled={loading}>
                    {loading ? "Searching..." : "Get Inspiration"}
                  </button>
                </div>
              </div>

              <div className="action-group">
                <h4>Find Cheapest Dates</h4>
                <p>Get best travel dates for a specific route</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="From (e.g., NYC)"
                    value={formData.origin}
                    onChange={(e) =>
                      handleChange("origin", e.target.value.toUpperCase())
                    }
                    className="modern-input"
                  />
                  <input
                    type="text"
                    placeholder="To (e.g., LON)"
                    value={formData.destination}
                    onChange={(e) =>
                      handleChange("destination", e.target.value.toUpperCase())
                    }
                    className="modern-input"
                  />
                  <button onClick={handleCheapestDates} disabled={loading}>
                    {loading ? "Searching..." : "Find Dates"}
                  </button>
                </div>
              </div>
            </div>

            {/* Inspiration Results */}
            {inspirationResults.length > 0 && (
              <div className="inspiration-results">
                <h4>Cheapest Destinations from {formData.origin}</h4>
                <div className="destination-grid">
                  {inspirationResults.slice(0, 12).map((dest, index) => (
                    <div key={index} className="destination-card">
                      <div className="destination-code">{dest.destination}</div>
                      <div className="destination-price">
                        {formatCurrency(dest.price?.total || 0)}
                      </div>
                      <div className="destination-dates">
                        {new Date(dest.departureDate).toLocaleDateString()} -{" "}
                        {new Date(dest.returnDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cheapest Dates Results */}
            {cheapestDates.length > 0 && (
              <div className="cheapest-dates-results">
                <h4>
                  Cheapest Dates for {formData.origin} → {formData.destination}
                </h4>
                <div className="dates-grid">
                  {cheapestDates.slice(0, 10).map((date, index) => (
                    <div key={index} className="date-card">
                      <div className="date-range">
                        {new Date(date.departureDate).toLocaleDateString()} -{" "}
                        {new Date(date.returnDate).toLocaleDateString()}
                      </div>
                      <div className="date-price">
                        {formatCurrency(date.price?.total || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLIGHT STATUS TAB */}
        {activeTab === "status" && (
          <div className="status-tab">
            <div className="status-actions">
              <h4>Check Flight Status</h4>
              <p>Get real-time flight information</p>
              <button onClick={handleFlightStatus} className="status-check-btn">
                Check Flight Status
              </button>
            </div>

            {flightStatus && (
              <div className="status-results">
                <h4>Flight Status</h4>
                <div className="status-card">
                  <div className="flight-route">
                    <span className="airline">
                      {getAirlineName(flightStatus.carrierCode)}
                    </span>
                    <span className="flight-number">
                      Flight {flightStatus.carrierCode} {flightStatus.number}
                    </span>
                  </div>
                  <div className="flight-times">
                    <div className="time-block">
                      <div className="time-label">Scheduled</div>
                      <div className="time">
                        {formatDateTime(flightStatus.scheduledDeparture).time}
                      </div>
                    </div>
                    <div className="time-block">
                      <div className="time-label">Estimated</div>
                      <div className="time">
                        {formatDateTime(flightStatus.estimatedDeparture).time}
                      </div>
                    </div>
                  </div>
                  <div className="flight-airports">
                    {flightStatus.departure?.iataCode} →{" "}
                    {flightStatus.arrival?.iataCode}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRAVEL TOOLS TAB */}
        {activeTab === "tools" && (
          <div className="tools-tab">
            <div className="tool-actions">
              <div className="tool-group">
                <h4>Airport & City Search</h4>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search airports or cities..."
                    onChange={(e) => handleAirportSearch(e.target.value)}
                    className="modern-input"
                  />
                </div>
                {airportResults.length > 0 && (
                  <div className="airport-results">
                    {airportResults.slice(0, 8).map((airport, index) => (
                      <div key={index} className="airport-card">
                        <div className="airport-code">{airport.iataCode}</div>
                        <div className="airport-name">{airport.name}</div>
                        <div className="airport-location">
                          {airport.address.cityName},{" "}
                          {airport.address.countryName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="tool-group">
                <h4>Airline Lookup</h4>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter airline code (e.g., AA)"
                    onChange={(e) => handleAirlineLookup(e.target.value)}
                    className="modern-input"
                  />
                </div>
                {airlineInfo && (
                  <div className="airline-results">
                    <div className="airline-card">
                      <div className="airline-code">{airlineInfo.iataCode}</div>
                      <div className="airline-name">
                        {airlineInfo.businessName}
                      </div>
                      <div className="airline-type">{airlineInfo.type}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Flow Modal */}
      {bookingFlow && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>
                {bookingFlow.step === "passenger_details" &&
                  "Passenger Details"}
                {bookingFlow.step === "confirmation" && "Booking Confirmed!"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setBookingFlow(null)}
                disabled={loading}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {bookingFlow.step === "passenger_details" && (
                <div className="passenger-form">
                  <h4>Traveler Information</h4>
                  <div className="form-grid-modal">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={travelerInfo.firstName}
                        onChange={(e) =>
                          handleTravelerChange("firstName", e.target.value)
                        }
                        required
                        className="modern-input"
                        placeholder="John"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={travelerInfo.lastName}
                        onChange={(e) =>
                          handleTravelerChange("lastName", e.target.value)
                        }
                        required
                        className="modern-input"
                        placeholder="Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        value={travelerInfo.dateOfBirth}
                        onChange={(e) =>
                          handleTravelerChange("dateOfBirth", e.target.value)
                        }
                        required
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={travelerInfo.gender}
                        onChange={(e) =>
                          handleTravelerChange("gender", e.target.value)
                        }
                        required
                        className="modern-select"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={travelerInfo.email}
                        onChange={(e) =>
                          handleTravelerChange("email", e.target.value)
                        }
                        required
                        className="modern-input"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        value={travelerInfo.phone}
                        onChange={(e) =>
                          handleTravelerChange("phone", e.target.value)
                        }
                        required
                        className="modern-input"
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Number *</label>
                      <input
                        type="text"
                        value={travelerInfo.passportNumber}
                        onChange={(e) =>
                          handleTravelerChange("passportNumber", e.target.value)
                        }
                        required
                        className="modern-input"
                        placeholder="A12345678"
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Expiry *</label>
                      <input
                        type="date"
                        value={travelerInfo.passportExpiry}
                        onChange={(e) =>
                          handleTravelerChange("passportExpiry", e.target.value)
                        }
                        required
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Country *</label>
                      <input
                        type="text"
                        value={travelerInfo.passportCountry}
                        onChange={(e) =>
                          handleTravelerChange(
                            "passportCountry",
                            e.target.value
                          )
                        }
                        required
                        className="modern-input"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => setBookingFlow(null)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="primary-btn"
                      onClick={() =>
                        handleBookFlight(bookingFlow.selectedFlight)
                      }
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="button-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {bookingFlow.step === "confirmation" && (
                <div className="confirmation-content">
                  <div className="success-icon">✅</div>
                  <h4>Your flight has been booked successfully!</h4>
                  <div className="booking-details">
                    <p>
                      <strong>Booking Reference:</strong>{" "}
                      {bookingFlow.booking?.id}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {bookingFlow.booking?.type || "Confirmed"}
                    </p>
                    {bookingFlow.booking?.flightOffers?.[0]?.price && (
                      <p>
                        <strong>Total Paid:</strong>{" "}
                        {formatCurrency(
                          bookingFlow.booking.flightOffers[0].price.total
                        )}
                      </p>
                    )}
                  </div>
                  <div className="modal-actions">
                    <button className="primary-btn" onClick={resetForm}>
                      Search New Flight
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
}
