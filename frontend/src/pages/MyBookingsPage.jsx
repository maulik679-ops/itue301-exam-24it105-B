import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const MyBookingsPage = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data || res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>My Car Bookings</h2>
          <p style={{ color: '#718096' }}>Track the status of your vehicle reservations.</p>
        </div>
        <button
          type="button"
          className="filter-btn"
          style={{ background: '#1c3d5e', color: '#fff' }}
          onClick={fetchBookings}
        >
          🔄 Refresh Bookings
        </button>
      </div>

      {loading && <div className="loading-spinner">⏳ Loading your bookings...</div>}
      {error && <div className="alert alert-error">❌ {error}</div>}

      {!loading && !error && (
        <div style={{ marginTop: '20px' }}>
          {bookings.length === 0 ? (
            <p>You have no bookings yet. Go to the Fleet page to reserve a car!</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  style={{
                    background: '#fff',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 style={{ color: '#1c3d5e', margin: 0 }}>
                      {booking.vehicleId?.model || 'Vehicle'} ({booking.vehicleId?.type || 'Type'})
                    </h3>
                    <p style={{ color: '#4a5568', margin: '6px 0', fontSize: '0.9rem' }}>
                      <strong>Dates:</strong> {new Date(booking.pickupDate).toLocaleDateString()} &rarr;{' '}
                      {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#718096', margin: 0, fontSize: '0.85rem' }}>
                      Customer: {booking.customerId?.name} ({booking.customerId?.email})
                    </p>
                  </div>
                  <span
                    className="badge"
                    style={{
                      textTransform: 'uppercase',
                      background:
                        booking.status === 'reserved'
                          ? '#bee3f8'
                          : booking.status === 'ongoing'
                          ? '#feebc8'
                          : booking.status === 'completed'
                          ? '#c6f6d5'
                          : '#fed7d7',
                      color:
                        booking.status === 'reserved'
                          ? '#2b6cb0'
                          : booking.status === 'ongoing'
                          ? '#c05621'
                          : booking.status === 'completed'
                          ? '#22543d'
                          : '#9b2c2c',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
