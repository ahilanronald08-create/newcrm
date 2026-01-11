const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Profile fields (Page 1)
  fullName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    default: 'Male'
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/
  },
  firstContactDate: {
    type: String,
    required: true
  },
  nextFollowUpDate: {
    type: String,
    required: true
  },
  awarenessChannel: {
    type: String,
    default: ''
  },
  leadStatus: {
    type: String,
    default: 'New'
  },
  contactChannel: {
    type: String,
    default: ''
  },
  stage: {
    type: String,
    default: ''
  },
  followUpRemarks: {
    type: String,
    default: ''
  },
  cohort: {
    type: String,
    default: ''
  },
  
  // Preference fields (Page 2)
  preferredcatagory: {
    type: String,
    default: ''
  },
  modeoflearning: {
    type: String,
    default: 'Offline'
  },
  preferredcourse: {
    type: String,
    default: ''
  },
  
  // Educational Details (Page 2)
  qualification: {
    type: String,
    default: ''
  },
  collegename: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  graduationyear: {
    type: String,
    default: ''
  },
  
  // Additional Info (Page 3)
  email: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  fathername: {
    type: String,
    default: ''
  },
  dob: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  fatherphonename: {
    type: String,
    default: ''
  },
  fatheroccupation: {
    type: String,
    default: ''
  },
  payment: {
    course: {
      type: String,
      default: "",
    },
    courseFee: {
      type: Number,
      default: 0,
    },
    paymentType: {
      type: String,
      enum: ["full", "emi"],
      default: "full",
    },
    months: {
      type: Number,
      default: 0,
    },
    advance: {
      type: Number,
      default: 0,
    },
    advanceDate: {
      type: String,
      default: "",
    },
    advanceTwo: {
      type: Number,
      default: 0,
    },
    advanceTwoDate: {
      type: String,
      default: "",
    },
  },

  // Metadata
  lastupdate: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);