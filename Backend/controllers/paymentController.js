const Payment = require("../models/Payment");
const Lead = require("../models/lead");


exports.createPayment = async (req, res) => {
  try {
    let {
      leadId,
      course,
      courseFee,
      paymentType,
      months,
      advance,
      advanceTwo
    } = req.body;

    // Convert to numbers safely
    advance = Number(advance || 0);
    advanceTwo = Number(advanceTwo || 0);
    courseFee = Number(courseFee);

    if (!leadId || !course || !courseFee) {
      return res.status(400).json({
        success: false,
        message: "Lead, course and fee are required"
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (advanceTwo > 0 && advance === 0) {
      return res.status(400).json({
        success: false,
        message: "Advance 1 must be paid before Advance 2"
      });
    }

    const payment = await Payment.create({
      leadId,
      course,
      courseFee,
      paymentType: paymentType || "full",
      months: paymentType === "emi" ? months : null,

      advance,
      advanceDate: advance > 0 ? new Date() : null,

      advanceTwo,
      advanceTwoDate: advanceTwo > 0 ? new Date() : null,

      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment
    });

  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* ================================
   GET PAYMENTS
================================ */
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      createdBy: req.user.id
    })
      .populate("leadId", "fullName phone modeoflearning")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* ================================
   UPDATE PAYMENT
================================ */
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    let { advance, advanceTwo } = req.body;

    if (advance !== undefined) {
      advance = Number(advance);
      payment.advance = advance;
      payment.advanceDate = advance > 0 ? new Date() : null;
    }

    if (advanceTwo !== undefined) {
      advanceTwo = Number(advanceTwo);

      if (advanceTwo > 0 && payment.advance === 0) {
        return res.status(400).json({
          success: false,
          message: "Advance 1 must be paid before Advance 2"
        });
      }

      payment.advanceTwo = advanceTwo;
      payment.advanceTwoDate = advanceTwo > 0 ? new Date() : null;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment
    });

  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
