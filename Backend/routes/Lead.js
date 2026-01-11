const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  searchLeads,
  getDashboardStats  // ✅ ADD THIS
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/search')
  .get(searchLeads);

router.route('/dashboard')  // ✅ ADD THIS ROUTE
  .get(getDashboardStats);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;