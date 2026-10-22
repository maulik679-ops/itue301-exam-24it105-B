import React, { useState } from 'react';
import VehicleCard from '../components/VehicleCard';

const FleetPage = ({ vehicles = [], loading = false, error = '', onBookSubmit }) => {
  // Task 2: State management for booking form
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Client-side filter (Task 4)
  const [selectedType, setSelectedType] = useState('All');

  const filteredVehicles = selectedType === 'All'
    ? vehicles
    : vehicles.filter((v) => v.type.toLowerCase() === selectedType.toLowerCase());

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
      setBookingMessage({ type: 'error', text: 'Please select both pickup and return dates.' });
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
      <p style={{ color: '#718096' }}>Browse and book available self-drive vehicles in real-time.</p>

      {/* Client-side Type Filter (Task 4) */}
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
        
        {/* Dynamic display of selected state */}
        <p style={{ marginBottom: '10px' }}>
          <strong>Selected Vehicle:</strong>{' '}
          {selectedVehicle ? (
            <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>
              {selectedVehicle.model} ({selectedVehicle.type}) - ₹{selectedVehicle.pricePerDay}/day
            </span>
          ) : (
            <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>None selected (Click "Book Now" below)</span>
          )}
        </p>

        {bookingMessage && (
          <div className={`alert ${bookingMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
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
            {bookingLoading ? 'Confirming Reservation...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>

      {/* Task 4: Loading & Error states */}
      {loading && <div className="loading-spinner">⏳ Loading vehicles from server...</div>}
      {error && <div className="alert alert-error">❌ {error}</div>}

      {/* Task 1 & 4: Render Grid of VehicleCard Components */}
      {!loading && !error && (
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
      )}
    </div>
  );
};

export default FleetPage;
