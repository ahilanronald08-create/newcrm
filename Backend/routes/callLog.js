const express = require('express');
const router = express.Router();
const {
  getCallLogs,
  createCallLog,
  deleteCallLog
} = require('../controllers/callLogController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/lead/:leadId')
  .get(getCallLogs);

router.route('/')
  .post(createCallLog);

router.route('/:id')
  .delete(deleteCallLog);

module.exports = router;