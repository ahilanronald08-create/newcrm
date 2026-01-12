const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true
    },
    course:{
        type: String,
        required:true
    },
    courseFee: {
      type: Number,
      required: true
    },
    paymentType: {
      type: String,
      enum: ["full", "emi"],
      required: true
    },
    months: Number,
    advance: {
      type: Number,
      default: 0
    },
     advanceDate: {
      type: Date,
    },
    advanceTwo: {
      type: Number,
      default: 0
    },
     advanceTwoDate: {
      type: Date, // ✅ Will update only when Adv-2 is paid
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
