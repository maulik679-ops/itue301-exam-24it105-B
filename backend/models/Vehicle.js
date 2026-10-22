const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV'],
        message: '{VALUE} is not a supported vehicle type',
      },
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price per day must be a non-negative number'],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
