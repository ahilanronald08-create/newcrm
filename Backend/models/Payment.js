const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    courseFee: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["full", "emi"],
      default: "full",
    },
    months: {
      type: Number,
      default: null,
    },
    advance: {
      type: Number,
      default: 0,
    },
    advanceDate: {
      type: Date,
      default: null,
    },
    advanceTwo: {
      type: Number,
      default: 0,
    },
    advanceTwoDate: {
      type: Date,
      default: null,
    },
  advanceTwoStatus: {
  type: String,
  enum: ['paid', 'unpaid', 'Paid', 'Unpaid'],
  default: 'Unpaid'
},
    // Monthly payments array for EMI
    monthlyPayments: [
      {
        amount: {
          type: Number,
          required: true,
        },
        paymentDate: {
          type: Date,
          required: true,
        },
        paymentMethod: {
          type: String,
          enum: ["gpay", "bank", "cash"],
          required: true,
        },
        transactionId: {
          type: String,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Payment method details
    paymentMethodDetails: {
      method: {
        type: String,
        enum: ["gpay", "bank", "cash"],
        default: null,
      },
      // For GPay/UPI
      transactionId: {
        type: String,
        default: null,
      },
      // For Bank Transfer
      bankDetails: {
        accountHolder: {
          type: String,
          default: null,
        },
        accountNumber: {
          type: String,
          default: null,
        },
        ifscCode: {
          type: String,
          default: null,
        },
      },
      // For Cash
      cashAmount: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", PaymentSchema);