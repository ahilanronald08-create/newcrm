const CallLog = require('../models/CallLog');
const Lead = require('../models/lead');

// Get all call logs for a specific lead
exports.getCallLogs = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Verify lead belongs to user
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const callLogs = await CallLog.find({ leadId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: callLogs.length,
      callLogs
    });
  } catch (error) {
    console.error('Get call logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new call log
exports.createCallLog = async (req, res) => {
  try {
    const { leadId, name, phone, event, followUpDate, remark } = req.body;

    // Verify lead exists and belongs to user
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create call log
    const callLog = await CallLog.create({
      leadId,
      name,
      phone,
      event,
      followUpDate,
      remark,
      createdBy: req.user.id
    });

    // Update lead's last update date and next follow-up date
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const updateData = {
      lastupdate: formattedDate
    };

    if (followUpDate) {
      const followUp = new Date(followUpDate);
      const formattedFollowUp = followUp.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      updateData.nextFollowUpDate = formattedFollowUp;
    }

    await Lead.findByIdAndUpdate(leadId, updateData);

    res.status(201).json({
      success: true,
      message: 'Call log created successfully',
      callLog
    });
  } catch (error) {
    console.error('Create call log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a call log
exports.deleteCallLog = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.id);

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Check if call log belongs to user
    if (callLog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await callLog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Call log deleted successfully'
    });
  } catch (error) {
    console.error('Delete call log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};