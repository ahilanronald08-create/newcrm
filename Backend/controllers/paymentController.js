const Payment = require("../models/Payment");
const Lead = require("../models/lead");

/* CREATE PAYMENT */
exports.createPayment = async (req, res) => {
  try {
    let {
      leadId,
      course,
      courseFee,
      paymentType,
      months,
      advance,
      advanceDate,
      advanceTwo,
      advanceTwoDate,
      advanceTwoStatus,
      paymentMethodDetails,
    } = req.body;

    advance = Number(advance || 0);
    advanceTwo = Number(advanceTwo || 0);
    courseFee = Number(courseFee);

    if (!leadId || !course || !courseFee) {
      return res.status(400).json({
        success: false,
        message: "Lead, course and fee are required",
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const payment = await Payment.create({
      leadId,
      course,
      courseFee,
      paymentType: paymentType || "full",
      months: paymentType === "emi" ? months : null,
      advance,
      advanceDate: advance > 0 ? advanceDate : null,
      advanceTwo,
      advanceTwoDate: advanceTwo > 0 ? advanceTwoDate : null,
      advanceTwoStatus: advanceTwo > 0 ? advanceTwoStatus || "unpaid" : "unpaid",
      paymentMethodDetails: paymentMethodDetails || null,
      monthlyPayments: [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* GET ALL PAYMENTS */
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      createdBy: req.user.id,
    })
      .populate("leadId", "fullName phone modeoflearning email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* GET PAYMENT BY ID */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "leadId",
      "fullName phone modeoflearning email"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* GET PAYMENT BY LEAD ID - FOR EDIT FUNCTIONALITY */
exports.getPaymentByLeadId = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      leadId: req.params.leadId,
      createdBy: req.user.id,
    }).populate("leadId", "fullName phone modeoflearning email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this lead",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment by lead error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* UPDATE PAYMENT BY ID */
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    let {
      course,
      courseFee,
      paymentType,
      months,
      advance,
      advanceDate,
      advanceTwo,
      advanceTwoDate,
      advanceTwoStatus,
      paymentMethodDetails,
    } = req.body;

    // Update fields
    if (course !== undefined) payment.course = course;
    if (courseFee !== undefined) payment.courseFee = Number(courseFee);
    if (paymentType !== undefined) {
      payment.paymentType = paymentType;
      payment.months = paymentType === "emi" ? Number(months) : null;
    }

    if (advance !== undefined) {
      advance = Number(advance);
      payment.advance = advance;
      payment.advanceDate = advance > 0 ? advanceDate || payment.advanceDate : null;
    }

    if (advanceTwo !== undefined) {
      advanceTwo = Number(advanceTwo);
      payment.advanceTwo = advanceTwo;
      payment.advanceTwoDate = advanceTwo > 0 ? advanceTwoDate || payment.advanceTwoDate : null;
    }

    if (advanceTwoStatus !== undefined) {
      payment.advanceTwoStatus = advanceTwoStatus.toLowerCase();
    }

    if (paymentMethodDetails) {
      payment.paymentMethodDetails = paymentMethodDetails;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* UPDATE PAYMENT BY LEAD ID - FOR EDIT FUNCTIONALITY */
exports.updatePaymentByLeadId = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      leadId: req.params.leadId,
      createdBy: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this lead",
      });
    }

    let {
      course,
      courseFee,
      paymentType,
      months,
      advance,
      advanceDate,
      advanceTwo,
      advanceTwoDate,
      advanceTwoStatus,
      paymentMethodDetails,
    } = req.body;

    // Update fields
    if (course !== undefined) payment.course = course;
    if (courseFee !== undefined) payment.courseFee = Number(courseFee);
    if (paymentType !== undefined) {
      payment.paymentType = paymentType;
      payment.months = paymentType === "emi" ? Number(months) : null;
    }

    if (advance !== undefined) {
      advance = Number(advance);
      payment.advance = advance;
      payment.advanceDate = advance > 0 ? advanceDate || payment.advanceDate : null;
    }

    if (advanceTwo !== undefined) {
      advanceTwo = Number(advanceTwo);
      payment.advanceTwo = advanceTwo;
      payment.advanceTwoDate = advanceTwo > 0 ? advanceTwoDate || payment.advanceTwoDate : null;
    }

    if (advanceTwoStatus !== undefined) {
      payment.advanceTwoStatus = advanceTwoStatus.toLowerCase();
    }

    if (paymentMethodDetails) {
      payment.paymentMethodDetails = paymentMethodDetails;
    }

    await payment.save();
    await payment.populate("leadId", "fullName phone modeoflearning email");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Update payment by lead error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* ADD MONTHLY PAYMENT */
exports.addMonthlyPayment = async (req, res) => {
  try {
    const { paymentId, amount, paymentDate, paymentMethod, transactionId } = req.body;

    if (!paymentId || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment ID, amount, date, and method are required",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (payment.paymentType !== "emi") {
      return res.status(400).json({
        success: false,
        message: "Monthly payments are only for EMI payment type",
      });
    }

    // Calculate current balance
    const totalAdvance = payment.advance + (payment.advanceTwoStatus === "paid" ? payment.advanceTwo : 0);
    const monthlyTotal = payment.monthlyPayments.reduce(
      (sum, mp) => sum + Number(mp.amount),
      0
    );
    const balance = payment.courseFee - totalAdvance - monthlyTotal;

    if (Number(amount) > balance) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds balance of ₹${balance}`,
      });
    }

    // Add monthly payment
    const monthlyPayment = {
      amount: Number(amount),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      transactionId: paymentMethod === "gpay" ? transactionId : null,
      createdAt: new Date(),
    };

    payment.monthlyPayments.push(monthlyPayment);
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Monthly payment added successfully",
      payment,
    });
  } catch (error) {
    console.error("Add monthly payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* DELETE PAYMENT */
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* DELETE MONTHLY PAYMENT */
exports.deleteMonthlyPayment = async (req, res) => {
  try {
    const { paymentId, monthlyPaymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    payment.monthlyPayments = payment.monthlyPayments.filter(
      (mp) => mp._id.toString() !== monthlyPaymentId
    );

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Monthly payment deleted successfully",
      payment,
    });
  } catch (error) {
    console.error("Delete monthly payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};