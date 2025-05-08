const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }, // Optional
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' }, // Optional
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  receipt: String,
  notes: String,
  isRecurring: { type: Boolean, default: false },
  recurringDetails: {
    frequency: String, // 'daily', 'weekly', 'monthly'
    endDate: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);