const Budget = require('../models/Budget');
const Trip = require('../models/Trip')
const Expense = require('../models/Expense');

exports.getUserBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ 
      $or: [
        { user: req.user.id },
        { trip: { $in: await Trip.find({ members: req.user.id }).select('_id') } }
      ]
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { tripId, ...budgetData } = req.body;
    const budget = new Budget({
      user: req.user.id,
      ...budgetData
    });
   
    await budget.save();

    if (tripId) {
      await Trip.findByIdAndUpdate(tripId, {
        $addToSet: { budgets: budget._id }
      }); 
    }

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const expenses = await Expense.find({ budget: budget._id });
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({
      budget,
      totalSpent,
      remaining: budget.totalAmount - totalSpent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};