const Trip = require('../models/Trip');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const mongoose = require ('mongoose');

// Helper to delete image file
const deleteImageFile = (filename) => {
  if (filename) {
    const filePath = path.join(__dirname, '../public/uploads/trips', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Create Trip
const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, totalBudget } = req.body;

    if (!title || !destination || !startDate || !endDate || !totalBudget) {
      return res.status(400).json({ error: "All fields are required" });
    }
 
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const tripData = {
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      totalBudget: parseFloat(totalBudget),
      createdBy: req.user.id
    };

    if (req.file) {
      tripData.coverImage = {
        url: `/uploads/trips/${req.file.filename}`,
        filename: req.file.filename
      };
    }

    const trip = await Trip.create(tripData);
    res.status(201).json(trip);

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get All Trips
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ 
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();

    res.status(200).json(trips.map(trip => ({
      ...trip,
      progress: ((trip.totalSpent || 0) / trip.totalBudget * 100).toFixed(1)
    })));
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

// Get Single Trip - Updated with ID validation
const getTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 Add this validation block (No spoil your existing code)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid trip ID format!" });
    }

    // Your original code remains intact 👇
    const trip = await Trip.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.status(200).json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
};

// Update Trip
const updateTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, totalBudget } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this trip" });
    }

    let coverImage = trip.coverImage;
    if (req.file) {
      if (trip.coverImage?.filename) {
        deleteImageFile(trip.coverImage.filename);
      }
      coverImage = {
        url: `/uploads/trips/${req.file.filename}`,
        filename: req.file.filename
      };
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        totalBudget: parseFloat(totalBudget),
        coverImage
      },
      { new: true }
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete Trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this trip" });
    }

    if (trip.coverImage?.filename) {
      deleteImageFile(trip.coverImage.filename);
    }

    await Trip.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
};

module.exports = {
  getTrip,
  getTrips,
  createTrip: [upload.single('coverImage'), createTrip],
  updateTrip: [upload.single('coverImage'), updateTrip],
  deleteTrip
};