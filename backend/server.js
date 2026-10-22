const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');
const Vehicle = require('./models/Vehicle');
const Customer = require('./models/Customer');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy';

// Global Middlewares
app.use(cors());
app.use(express.json());

// Task 3: Global custom requestLogger middleware
app.use(requestLogger);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DriveEasy Car Rental System API is running',
    version: '1.0.0',
    endpoints: {
      auth: 'POST /api/v1/auth/login',
      vehicles: 'GET /api/v1/vehicles',
      createBooking: 'POST /api/v1/bookings',
      myBookings: 'GET /api/v1/bookings/my',
      updateStatus: 'PATCH /api/v1/bookings/:id/status',
    },
  });
});

// REST API Routes under /api/v1/
app.use('/api/v1', apiRoutes);

// Task 3: Global error-handling middleware (must be last)
app.use(errorHandler);

// Seed initial vehicles and customer for practical demo
const seedDatabase = async () => {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('Seeding initial vehicle fleet...');
      await Vehicle.create([
        { model: 'Maruti Suzuki Swift', type: 'Hatchback', pricePerDay: 1500, available: true },
        { model: 'Hyundai i20', type: 'Hatchback', pricePerDay: 1800, available: true },
        { model: 'Honda City', type: 'Sedan', pricePerDay: 2500, available: true },
        { model: 'Hyundai Verna', type: 'Sedan', pricePerDay: 2800, available: false }, // Demonstrates "Not Available" badge
        { model: 'Mahindra XUV700', type: 'SUV', pricePerDay: 3800, available: true },
        { model: 'Tata Harrier', type: 'SUV', pricePerDay: 3500, available: true },
        { model: 'Toyota Fortuner', type: 'SUV', pricePerDay: 5000, available: true },
      ]);
      console.log('Vehicle fleet seeded successfully.');
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('Seeding demo customer...');
      await Customer.create({
        name: 'Rahul Patel',
        email: 'rahul@example.com',
        phone: '+91 9876543210',
        licenseNumber: 'GJ-01-2023-009988',
        password: 'password123',
      });
      console.log('Demo customer seeded.');
    }
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

// Database connection & Server start
const startServer = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB successfully.');
    await seedDatabase();
  } catch (err) {
    console.warn(`Standard MongoDB connection failed: ${err.message}`);
    // Fallback to in-memory mongodb if available (ensures zero downtime during testing/demo)
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: { version: '7.0.14' },
        instance: { port: 27017, dbName: 'driveeasy' },
      });
      const uri = mongod.getUri();
      console.log(`Started fallback MongoDB 7.0 instance at: ${uri}`);
      await mongoose.connect(uri);
      console.log('Connected to Fallback MongoDB successfully.');
      await seedDatabase();
    } catch (memErr) {
      console.error('Fatal: Could not connect to any MongoDB instance:', memErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` DriveEasy Server running on http://localhost:${PORT}`);
    console.log(` REST API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`===============================================`);
  });
};

startServer();

module.exports = app;
