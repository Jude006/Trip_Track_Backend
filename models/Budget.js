const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  allocated: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0 }
});

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  categories: [budgetCategorySchema],
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);