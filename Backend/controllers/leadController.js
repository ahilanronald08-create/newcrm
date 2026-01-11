const Lead = require('../models/lead');

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      phone,
      firstContactDate,
      nextFollowUpDate,
      awarenessChannel,
      leadStatus,
      contactChannel,
      stage,
      followUpRemarks,
      lastupdate
    } = req.body;

    // Validate required fields
    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone number are required'
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    // Check if phone number already exists
    const existingLead = await Lead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Create new lead
    const lead = await Lead.create({
      fullName,
      gender,
      phone,
      firstContactDate,
      nextFollowUpDate,
      awarenessChannel,
      leadStatus,
      contactChannel,
      stage,
      followUpRemarks,
      lastupdate,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all leads for logged-in user
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single lead by ID
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if lead belongs to user
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead'
      });
    }

    res.status(200).json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if lead belongs to user
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // If phone number is being changed, check for duplicates
    if (req.body.phone && req.body.phone !== lead.phone) {
      const existingLead = await Lead.findOne({ phone: req.body.phone });
      if (existingLead) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if lead belongs to user
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lead'
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search leads with filters
exports.searchLeads = async (req, res) => {
  try {
    const {
      name,
      leadStatus,
      cohort,
      phonenumber,
      graduationyear,
      courseinterested,
      modeoflearning,
      startdate,
      enddate
    } = req.query;

    // Build query
    let query = { createdBy: req.user.id };

    // Add filters if provided
    if (name && name.trim()) {
      query.fullName = { $regex: name.trim(), $options: 'i' };
    }

    if (leadStatus && leadStatus.trim()) {
      query.leadStatus = leadStatus.trim();
    }

    if (cohort && cohort.trim()) {
      query.cohort = cohort.trim();
    }

    if (phonenumber && phonenumber.trim()) {
      query.phone = { $regex: phonenumber.trim(), $options: 'i' };
    }

    if (graduationyear && graduationyear.trim()) {
      query.graduationyear = graduationyear.trim();
    }

    if (courseinterested && courseinterested.trim()) {
      query.preferredcourse = courseinterested.trim();
    }

    if (modeoflearning && modeoflearning.trim()) {
      query.modeoflearning = modeoflearning.trim();
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Search leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ NEW FUNCTION - Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all leads for the user
    const allLeads = await Lead.find({ createdBy: userId }).sort({ createdAt: -1 });
    
    // Calculate statistics
    const stats = {
      total: allLeads.length,
      new: allLeads.filter(l => l.leadStatus === 'New').length,
      inProgress: allLeads.filter(l => l.leadStatus === 'In Progress').length,
      deferred: allLeads.filter(l => l.leadStatus === 'Deferred').length,
      converted: allLeads.filter(l => l.leadStatus === 'Converted').length,
      lost: allLeads.filter(l => l.leadStatus === 'Lost').length,
      online: allLeads.filter(l => l.modeoflearning === 'Online').length,
      offline: allLeads.filter(l => l.modeoflearning === 'Offline').length
    };
    
    res.status(200).json({
      success: true,
      stats,
      leads: allLeads
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};