const express = require('express');
const router = express.Router();
const {
  getUserBudgets,
  createBudget,
  updateBudget,
  getBudgetSummary
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getUserBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.get('/:id/summary', getBudgetSummary);

module.exports = router;