import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';

const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Task 4: REST API Consumption in React
 * - In FleetPage, retrieves vehicle information using GET /api/v1/vehicles via Axios.
 * - Uses useEffect() so the request is made when the component mounts.
 * - Maintains 3 states: vehicles, loading, and error.
 * - Displays loading indicator, error message, or a grid of VehicleCard components.
 * - Client-side type filter (All | Hatchback | Sedan | SUV) applied without new API requests.
 */
const FleetPage = ({ onBookSubmit }) => {
  // Task 4: Required 3 states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task 4: Client-side type filter state
  const [selectedType, setSelectedType] = useState('All');

  // Task 2: State management for booking form
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Task 4: Fetch vehicles from GET /api/v1/vehicles on component mount
  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`);
      setVehicles(res.data.data || res.data);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to load vehicle fleet. Please verify backend is running on http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Task 4: Client-side filtering on the already-fetched array (no new network request)
  const filteredVehicles =
    selectedType === 'All'
      ? vehicles
      : vehicles.filter(
          (v) => v.type.toLowerCase() === selectedType.toLowerCase()
        );

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingMessage(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setBookingMessage({ type: 'error', text: 'Please select a vehicle to book.' });
      return;
    }
    if (!pickupDate || !returnDate) {
      setBookingMessage({
        type: 'error',
        text: 'Please select both pickup and return dates.',
      });
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      if (onBookSubmit) {
        await onBookSubmit({
          vehicleId: selectedVehicle._id,
          pickupDate,
          returnDate,
        });
      }
      setBookingMessage({
        type: 'success',
        text: `Vehicle "${selectedVehicle.model}" successfully booked from ${pickupDate} to ${returnDate}!`,
      });
      setSelectedVehicle(null);
      setPickupDate('');
      setReturnDate('');
      // Refresh fleet data to update availability badge
      await fetchVehicles();
    } catch (err) {
      setBookingMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || 'Failed to complete booking',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>DriveEasy Vehicle Fleet</h2>
      <p style={{ color: '#718096' }}>
        Live vehicle inventory fetched from Express REST API (<code>GET /api/v1/vehicles</code>).
      </p>

      {/* Task 4: Client-side Filter Bar */}
      <div className="filters">
        <strong>Filter by Type:</strong>
        {['All', 'Hatchback', 'Sedan', 'SUV'].map((type) => (
          <button
            key={type}
            type="button"
            className={`filter-btn ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Task 2: Booking Form with useState */}
      <div className="form-card" style={{ maxWidth: '600px', margin: '20px 0' }}>
        <h3 style={{ color: '#1c3d5e', marginBottom: '12px' }}>Book a Vehicle</h3>

        {/* Dynamic state display */}
        <p style={{ marginBottom: '10px' }}>
          <strong>Selected Vehicle:</strong>{' '}
          {selectedVehicle ? (
            <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>
              {selectedVehicle.model} ({selectedVehicle.type}) - ₹{selectedVehicle.pricePerDay}/day
            </span>
          ) : (
            <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              None selected (Click "Book Now" below on an available car)
            </span>
          )}
        </p>

        {bookingMessage && (
          <div
            className={`alert ${
              bookingMessage.type === 'error' ? 'alert-error' : 'alert-success'
            }`}
          >
            {bookingMessage.text}
          </div>
        )}

        <form onSubmit={handleBookingSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="pickupDate">Pickup Date</label>
              <input
                id="pickupDate"
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="returnDate">Return Date</label>
              <input
                id="returnDate"
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={!selectedVehicle || bookingLoading}
          >
            {bookingLoading ? 'Processing Reservation...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>

      {/* Task 4: 1) Loading indicator while request is in progress */}
      {loading && (
        <div className="loading-spinner">
          ⏳ Loading vehicle inventory from <code>/api/v1/vehicles</code>...
        </div>
      )}

      {/* Task 4: 2) Friendly error message if request fails */}
      {error && <div className="alert alert-error">❌ {error}</div>}

      {/* Task 4: 3) Render grid of VehicleCard components after successful request */}
      {!loading && !error && (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles (Filtered: {selectedType})
          </p>
          <div className="vehicle-grid">
            {filteredVehicles.length === 0 ? (
              <p>No vehicles found for the selected category.</p>
            ) : (
              filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id || vehicle.model}
                  model={vehicle.model}
                  type={vehicle.type}
                  pricePerDay={vehicle.pricePerDay}
                  available={vehicle.available}
                  onBook={() => handleSelectVehicle(vehicle)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetPage;
