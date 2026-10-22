import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import FleetPage from './pages/FleetPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Task 2: Lazy-loaded route for Admin Panel
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const API_BASE_URL = 'http://localhost:5000/api/v1';

function App() {
  const { customer, token, login, logout } = useAuth();
  const navigate = useNavigate();

  // Task 4: API Consumption states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bookings state for MyBookingsPage
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  // Task 4: Fetch vehicles using useEffect on mount
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
        'Failed to connect to the backend server. Ensure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Fetch customer bookings
  const fetchMyBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyBookings(res.data.data || res.data);
    } catch (err) {
      setBookingsError(
        err?.response?.data?.error || err?.message || 'Failed to fetch your bookings'
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const { customer: loggedCustomer, token: authToken } = res.data;
    login(loggedCustomer, authToken);
    navigate('/fleet');
  };

  // Handle Booking submission
  const handleBookSubmit = async ({ vehicleId, pickupDate, returnDate }) => {
    await axios.post(
      `${API_BASE_URL}/bookings`,
      { vehicleId, pickupDate, returnDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh vehicle availability and customer bookings
    await fetchVehicles();
    await fetchMyBookings();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar customer={customer} token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        
        {/* Protected Routes */}
        <Route
          path="/fleet"
          element={
            <ProtectedRoute>
              <FleetPage onBookSubmit={handleBookSubmit} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Lazy-loaded Admin Route */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="loading-spinner">⏳ Loading Admin Dashboard...</div>}>
              <AdminPanel />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
