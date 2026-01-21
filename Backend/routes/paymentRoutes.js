const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPayment,
  getPayments,
  updatePayment,
  updatePaymentByLeadId,
  deletePayment,
  getPaymentById,
  getPaymentByLeadId,
  addMonthlyPayment,
  deleteMonthlyPayment,
} = require("../controllers/paymentController");

// Monthly payment routes FIRST (before dynamic :id routes)
router.post("/monthly", protect, addMonthlyPayment);
router.delete("/:paymentId/monthly/:monthlyPaymentId", protect, deleteMonthlyPayment);

// Lead-specific routes (before :id routes)
router.get("/lead/:leadId", protect, getPaymentByLeadId);
router.put("/lead/:leadId", protect, updatePaymentByLeadId);

// General CRUD routes
router.post("/", protect, createPayment);
router.get("/", protect, getPayments);
router.get("/:id", protect, getPaymentById);
router.put("/:id", protect, updatePayment);
router.delete("/:id", protect, deletePayment);

module.exports = router;