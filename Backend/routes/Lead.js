const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  searchLeads,
  getDashboardStats
} = require('../controllers/leadController');

// 🔐 All routes are protected
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Search
router.get('/search', searchLeads);



router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;
