const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const authGuard = require('../middleware/authGuard');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_driveeasy_jwt_key_2026';

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate customer and issue JWT token (Public)
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    let customer = await Customer.findOne({ email: email.toLowerCase() });

    // Seed default customer if not found for convenience in exam demo
    if (!customer) {
      customer = await Customer.create({
        name: 'Rahul Patel',
        email: email.toLowerCase(),
        phone: '+91 9876543210',
        licenseNumber: `DL-${Date.now().toString().slice(-6)}`,
        password: password || 'password123',
      });
    }

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
        name: customer.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/vehicles
 * @desc    Return all vehicles (Public)
 */
router.get('/vehicles', async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking (Protected)
 *          Task 5 requirement:
 *          1. Check that vehicle.available === true before creating booking (return 400 if not)
 *          2. Create the Booking record
 *          3. Set the vehicle's available field to false
 */
router.post('/bookings', authGuard, async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;
    const customerId = req.customer.id;

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        error: 'vehicleId, pickupDate, and returnDate are required',
      });
    }

    // 1. Check vehicle existence and availability
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found with the provided ID',
      });
    }

    if (!vehicle.available) {
      return res.status(400).json({
        success: false,
        error: `Vehicle "${vehicle.model}" is currently not available for booking.`,
      });
    }

    // 2. Create the booking record
    const booking = await Booking.create({
      customerId,
      vehicleId,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      status: 'reserved',
    });

    // 3. Mark vehicle as unavailable
    vehicle.available = false;
    await vehicle.save();

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/bookings/my
 * @desc    Return the logged-in customer's own bookings (Protected)
 *          Task 5 requirement:
 *          Use .populate('customerId', 'name email') and .populate('vehicleId', 'model type')
 */
router.get('/bookings/my', authGuard, async (req, res, next) => {
  try {
    const customerId = req.customer.id;

    const bookings = await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/v1/bookings/:id/status
 * @desc    Update booking status (Protected)
 */
router.patch('/bookings/:id/status', authGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['reserved', 'ongoing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    booking.status = status;
    await booking.save();

    // If completed or cancelled, free up the vehicle
    if (status === 'completed' || status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
