const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const TripInvite = require("../models/TripInvite");
const User = require("../models/User");
const sendInviteEmail = require("../utils/sendInviteEmail");

const {
  getTrip,
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getTrips);
router.get("/:id", authMiddleware, getTrip);
router.put("/:id", authMiddleware, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);

// Invite someone to a trip
router.post("/:tripId/invite", authMiddleware, async (req, res) => {
  const { email } = req.body;
  const { tripId } = req.params;
  const invitedBy = req.user.id || req.user._id;

  try {
    // Check if the trip exists
    const trip = await Trip.findById(tripId);
    console.log("Trip", trip);
    console.log(invitedBy);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingInvite = await TripInvite.findOne({ trip: tripId, email });
    console.log("Existing Invite:", existingInvite); // 🔍
    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "User has already been invited to this trip." });
    }

    const invite = new TripInvite({
      email,
      trip: tripId,
      invitedBy,
    });
    await invite.save();

    // Generate frontend invite link
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${FRONTEND_URL}/accept-invite?tripId=${tripId}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendInviteEmail(email, trip.title, inviteLink);

    return res.status(200).json({ message: "Invite sent successfully.", trip });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});



// Accept an invite to join a trip
router.post('/:tripId/accept-invite', authMiddleware, async (req, res) => {
  const { tripId } = req.params;
  const { email } = req.body;
  const userId = req.user.id || req.user._id;

  try {
    const invite = await TripInvite.findOne({ trip: tripId, email });
    if (!invite) {
      return res.status(404).json({ message: 'No valid invite found for this email.' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Add user to members if not already added
    if (!trip.members.includes(userId)) {
      trip.members.push(userId);
      await trip.save();
    }

    // Delete the invite after acceptance
    await TripInvite.deleteOne({ _id: invite._id });

    return res.status(200).json({ message: 'Joined the trip successfully.' });
  } catch (err) {
    console.error('Accept Invite Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});


module.exports = router;
