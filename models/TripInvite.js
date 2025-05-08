const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripInviteSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  trip: {
    type: Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  }, 
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TripInvite', tripInviteSchema);
