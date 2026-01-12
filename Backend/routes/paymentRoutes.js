const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPayments,
  updatePayment
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createPayment);
router.get("/", getPayments);
router.put("/:id", updatePayment);

module.exports = router;
