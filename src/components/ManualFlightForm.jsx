import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config.js";
import "./ManualFlightForm.css";

export default function ManualFlightForm() {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departure: "",
    returnDate: "",
    passengers: 1,
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedFlight, setExpandedFlight] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (flights.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [flights]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "passengers" ? parseInt(value) : value,
    }));
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setExpandedFlight(null);

    if (!formData.origin || !formData.destination || !formData.departure) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.origin === formData.destination) {
      setError("Origin and destination cannot be the same");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/koalaroute/flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          origin: formData.origin.toUpperCase(),
          destination: formData.destination.toUpperCase(),
          departure_at: formData.departure,
          return_at: formData.returnDate || "",
          passengers: formData.passengers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch flights");
      setFlights(data.offers || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration) => {
    if (!duration) return "";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
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
    setFormData((prev) => ({
      ...prev,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    }));
  };

  return (
    <div className="flight-search-container">
      {/* Header */}
      <div className="flight-header">
        <div className="flight-title">
          <span className="flight-icon">✈️</span>
          <h3>Flight Search</h3>
        </div>
        <p>Find the best flights for your journey</p>
      </div>

      {/* Quick Search Chips */}
      <div className="quick-search-section">
        <div className="suggestion-chips">
          <button onClick={() => quickSearch("NYC-LAX")}>NYC → LAX</button>
          <button onClick={() => quickSearch("LON-PAR")}>LON → PAR</button>
          <button onClick={() => quickSearch("SYD-MEL")}>SYD → MEL</button>
          <button onClick={() => quickSearch("TOK-SEO")}>TOK → SEO</button>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flight-search-form">
        <div className="form-grid">
          <div className="form-group">
            <label>From</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">📍</span> */}
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
          </div>

          <div className="form-group">
            <label>To</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">🏁</span> */}
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
          </div>

          <div className="form-group">
            <label>Departure</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">📅</span> */}
              <input
                type="date"
                value={formData.departure}
                onChange={(e) => handleChange("departure", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Return <span className="optional">(Optional)</span>
            </label>
            <div className="input-wrapper">
              {/* <span className="input-icon">🔄</span> */}
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleChange("returnDate", e.target.value)}
                min={
                  formData.departure || new Date().toISOString().split("T")[0]
                }
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Passengers</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">👥</span> */}
              <select
                value={formData.passengers}
                onChange={(e) => handleChange("passengers", e.target.value)}
                className="modern-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Passenger" : "Passengers"}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Results Section */}
      {flights.length > 0 && (
        <div ref={resultsRef} className="results-section">
          <div className="results-header">
            <h3>
              Found {flights.length} Flight{flights.length !== 1 ? "s" : ""}
            </h3>
            <div className="results-sort">
              <span>Sorted by: Price (Lowest)</span>
            </div>
          </div>

          <div className="flights-grid">
            {flights.map((flight, index) => (
              <div
                key={index}
                className={`flight-card ${
                  expandedFlight === index ? "expanded" : ""
                }`}
                onClick={() => toggleFlightDetails(index)}
              >
                <div className="flight-card-main">
                  <div className="flight-info">
                    <div className="airline-brand">
                      <span className="airline-logo">✈️</span>
                      <div className="airline-details">
                        <div className="airline-name">
                          {flight.airline || "Multiple Airlines"}
                        </div>
                        <div className="flight-numbers">
                          {flight.slices?.[0]?.segments?.[0]?.flight_number ||
                            "—"}
                        </div>
                      </div>
                    </div>

                    <div className="route-times">
                      <div className="time-block">
                        <div className="time">
                          {
                            formatDateTime(
                              flight.slices?.[0]?.segments?.[0]?.origin
                                ?.departure_time
                            ).time
                          }
                        </div>
                        <div className="airport">
                          {flight.slices?.[0]?.segments?.[0]?.origin?.iata}
                        </div>
                      </div>

                      <div className="duration-route">
                        <div className="duration">
                          {formatDuration(flight.slices?.[0]?.duration)}
                        </div>
                        <div className="route-line">
                          <div className="route-dot start"></div>
                          <div className="route-line-middle"></div>
                          <div className="route-dot end"></div>
                        </div>
                        <div className="route-type">
                          {flight.slices?.length > 1 ? "Round trip" : "One way"}
                        </div>
                      </div>

                      <div className="time-block">
                        <div className="time">
                          {
                            formatDateTime(
                              flight.slices?.[0]?.segments?.[0]?.destination
                                ?.arrival_time
                            ).time
                          }
                        </div>
                        <div className="airport">
                          {flight.slices?.[0]?.segments?.[0]?.destination?.iata}
                        </div>
                      </div>
                    </div>

                    <div className="flight-price">
                      <div className="price-amount">
                        {formatCurrency(
                          flight.price?.amount,
                          flight.price?.currency
                        )}
                      </div>
                      <div className="price-per-person">per person</div>
                      <div className="expand-indicator">
                        {expandedFlight === index ? "▲" : "▼"} Details
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedFlight === index && (
                  <div className="flight-details">
                    {flight.slices?.map((slice, sliceIndex) => (
                      <div key={sliceIndex} className="slice-details">
                        <div className="slice-header">
                          <span className="slice-title">
                            {sliceIndex === 0 ? "Outbound" : "Return"} •{" "}
                            {
                              formatDateTime(
                                slice.segments?.[0]?.origin?.departure_time
                              ).date
                            }
                          </span>
                          <span className="slice-duration">
                            Duration: {formatDuration(slice.duration)}
                          </span>
                        </div>

                        {slice.segments?.map((segment, segIndex) => (
                          <div key={segIndex} className="segment-detail">
                            <div className="segment-route">
                              <div className="segment-airports">
                                <span className="airport-code">
                                  {segment.origin?.iata}
                                </span>
                                <span className="airport-name">
                                  {segment.origin?.city}
                                </span>
                              </div>
                              <div className="segment-times">
                                <span className="departure-time">
                                  {
                                    formatDateTime(
                                      segment.origin?.departure_time
                                    ).time
                                  }
                                </span>
                                <span className="arrival-time">
                                  {
                                    formatDateTime(
                                      segment.destination?.arrival_time
                                    ).time
                                  }
                                </span>
                              </div>
                              <div className="segment-airports">
                                <span className="airport-code">
                                  {segment.destination?.iata}
                                </span>
                                <span className="airport-name">
                                  {segment.destination?.city}
                                </span>
                              </div>
                            </div>
                            <div className="segment-info">
                              <span>Flight {segment.flight_number}</span>
                              <span>•</span>
                              <span>{segment.aircraft || "Aircraft"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="flight-actions">
                      <button className="select-flight-btn">
                        Select Flight
                      </button>
                      <button className="save-flight-btn">💾 Save</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-results">
          <div className="loading-spinner"></div>
          <p>Searching for the best flights...</p>
        </div>
      )}
    </div>
  );
}
