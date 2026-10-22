import React from 'react';

/**
 * Task 1: Reusable VehicleCard Component
 * Accepts props: model, type, pricePerDay, available, and optional onBook
 * Renders a "Not Available" badge if available is false, or "Book Now" button if true.
 */
const VehicleCard = ({ model, type, pricePerDay, available, onBook }) => {
  return (
    <div className="vehicle-card">
      <div>
        <h3>{model}</h3>
        <div className="vehicle-details">
          <p><strong>Type:</strong> {type}</p>
          <p className="vehicle-price">₹{pricePerDay} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#718096' }}>/ day</span></p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`badge ${available ? 'badge-available' : 'badge-unavailable'}`}>
              {available ? 'Available' : 'Not Available'}
            </span>
          </p>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        {available ? (
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => onBook && onBook({ model, type, pricePerDay, available })}
          >
            Book Now
          </button>
        ) : (
          <span className="badge badge-unavailable" style={{ display: 'block', textAlign: 'center', padding: '10px' }}>
            Not Available
          </span>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
