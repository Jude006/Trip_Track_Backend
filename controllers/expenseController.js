const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getExpenses = async (req, res) => {
  try {
    const { month, year, category,tripId } = req.query;
    let query = { user: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (category) {
      query.category = category;
    }

    if (tripId) {
      query.trip = tripId;
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).populate('trip', 'title');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, receipt, notes, budgetId, tripId } = req.body;
    
    const expense = new Expense({
      user: req.user.id,
      title,
      amount,
      category,
      date: date || new Date(),
      receipt,
      notes,
      budget: budgetId || null,
      trip: tripId || null
    });

    await expense.save();
    
    if (budgetId) {
      await Budget.findOneAndUpdate(
        { _id: budgetId, 'categories.name': category },
        { $inc: { 'categories.$.spent': amount } }
      );
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const monthlySpending = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: cutoffDate } } },
      { $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: cutoffDate } } },
      { $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    res.json({ monthlySpending, categoryBreakdown });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};