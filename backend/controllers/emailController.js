import mongoose from 'mongoose';
import Email from '../models/Email.js';
import Group from '../models/Group.js';
import Template from '../models/Template.js';
import User from '../models/User.js';
import { sendBulkEmails } from '../services/emailService.js';
import { personalizeContent } from '../utils/helpers.js';

export const sendEmails = async (req, res) => {
  try {
    const { groupId, templateId, subject, content, customContent } = req.body;

    const user = await User.findById(req.userId).populate('subscription');
    const group = await Group.findOne({ _id: groupId, user: req.userId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check email limits
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const lastReset = new Date(user.lastEmailReset);
    if (lastReset.getMonth() !== currentMonth || lastReset.getFullYear() !== currentYear) {
      user.emailsSentThisMonth = 0;
      user.lastEmailReset = currentDate;
      await user.save();
    }

    const emailsToSend = group.contacts.length;
    const remainingEmails = user.subscription.emailLimit === -1 ? 
                              Infinity : 
                              user.subscription.emailLimit - user.emailsSentThisMonth;

    if (user.subscription.emailLimit !== -1 && emailsToSend > remainingEmails) {
      return res.status(400).json({
        success: false,
        message: `You can only send ${remainingEmails} more emails this month`
      });
    }

    let finalSubject = subject;
    let finalContent = content;

    // If using template
    if (templateId) {
      const template = await Template.findOne({
        _id: templateId,
        user: req.userId
      });

      if (template) {
        finalSubject = template.subject;
        finalContent = template.content;
      }
    }

    // Override with custom content if provided
    if (customContent) {
      finalContent = customContent;
    }

    // Create email record with proper ObjectId conversion
    const email = new Email({
      user: new mongoose.Types.ObjectId(req.userId),
      group: new mongoose.Types.ObjectId(groupId),
      template: templateId ? new mongoose.Types.ObjectId(templateId) : null,
      subject: finalSubject,
      content: finalContent,
      recipients: group.contacts.map(contact => ({
        email: contact.email,
        name: contact.name,
        status: 'pending'
      })),
      totalRecipients: group.contacts.length,
      status: 'sending',
      successCount: 0,
      failedCount: 0
    });

    await email.save();

    
    // Send emails asynchronously with comprehensive error handling
    sendBulkEmails(user, group, email, finalSubject, finalContent)
      .then(async (results) => {
        try {
          // Update email record with results
          email.successCount = results.successCount || 0;
          email.failedCount = results.failedCount || 0;
          email.status = 'completed';
          email.recipients = results.recipients;
          
          // Update user's email count with fresh user data
          const updatedUser = await User.findById(req.userId);
          const previousCount = updatedUser.emailsSentThisMonth || 0;
          updatedUser.emailsSentThisMonth = previousCount + (results.successCount || 0);
          
          // Save both records
          await updatedUser.save();
          await email.save();
          
          
        } catch (updateError) {
          console.error('❌ Error updating email counts:', updateError);
        }
      })
      .catch(async (error) => {
        console.error('❌ Bulk email sending failed:', error);
        try {
          email.status = 'failed';
          email.failedCount = email.totalRecipients;
          email.successCount = 0;
          await email.save();
        } catch (saveError) {
          console.error('❌ Error saving failed email status:', saveError);
        }
      });

    res.json({
      success: true,
      message: 'Email sending initiated',
      data: {
        emailId: email._id,
        totalRecipients: email.totalRecipients,
        estimatedTime: Math.ceil(email.totalRecipients / 10) // Rough estimate
      }
    });
  } catch (error) {
    console.error('❌ Send emails error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailStatus = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('group', 'name').populate('template', 'name');

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Calculate success rate
    const successRate = email.totalRecipients > 0 ? 
                        ((email.successCount || 0) / email.totalRecipients) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...email.toObject(),
        successRate: Math.round(successRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('❌ Get email status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter
    const filter = { user: new mongoose.Types.ObjectId(req.userId) };
    if (status) {
      filter.status = status;
    }
    
    const emails = await Email.find(filter)
      .populate('group', 'name')
      .populate('template', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add success rate to each email
    const emailsWithStats = emails.map(email => {
      const successRate = email.totalRecipients > 0 ? 
                            ((email.successCount || 0) / email.totalRecipients) * 100 : 0;
      return {
        ...email.toObject(),
        successRate: Math.round(successRate * 100) / 100
      };
    });

    const total = await Email.countDocuments(filter);

    res.json({
      success: true,
      data: {
        emails: emailsWithStats,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Get email history error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get date range filters
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    // Build match criteria
    const matchCriteria = { user: userObjectId };
    if (Object.keys(dateFilter).length > 0) {
      matchCriteria.createdAt = dateFilter;
    }
    
    // Get overall statistics
    const totalEmails = await Email.countDocuments({ user: userObjectId });
    
    const overallStats = await Email.aggregate([
      { $match: { user: userObjectId } },
      { 
        $group: { 
          _id: null, 
          totalSent: { $sum: '$successCount' },
          totalFailed: { $sum: '$failedCount' },
          totalCampaigns: { $sum: 1 }
        } 
      }
    ]);
    
    // Get filtered statistics (if date range provided)
    const filteredStats = await Email.aggregate([
      { $match: matchCriteria },
      { 
        $group: { 
          _id: null, 
          periodSent: { $sum: '$successCount' },
          periodFailed: { $sum: '$failedCount' },
          periodCampaigns: { $sum: 1 }
        } 
      }
    ]);

    // Get monthly statistics for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlyStats = await Email.aggregate([
      { 
        $match: { 
          user: userObjectId,
          createdAt: { $gte: startOfMonth }
        }
      },
      { 
        $group: { 
          _id: null, 
          monthlySent: { $sum: '$successCount' },
          monthlyFailed: { $sum: '$failedCount' },
          monthlyCampaigns: { $sum: 1 }
        } 
      }
    ]);

    // Get daily statistics for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Email.aggregate([
      { 
        $match: { 
          user: userObjectId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sent: { $sum: '$successCount' },
          failed: { $sum: '$failedCount' },
          campaigns: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get recent emails
    const recentEmails = await Email.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('group', 'name')
      .select('subject successCount failedCount totalRecipients status createdAt group');

    // Get top performing groups
    const topGroups = await Email.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$group',
          totalSent: { $sum: '$successCount' },
          totalFailed: { $sum: '$failedCount' },
          campaigns: { $sum: 1 }
        }
      },
      { $sort: { totalSent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: '_id',
          as: 'groupInfo'
        }
      }
    ]);

    const overall = overallStats[0] || { totalSent: 0, totalFailed: 0, totalCampaigns: 0 };
    const filtered = filteredStats[0] || { periodSent: 0, periodFailed: 0, periodCampaigns: 0 };
    const monthly = monthlyStats[0] || { monthlySent: 0, monthlyFailed: 0, monthlyCampaigns: 0 };

    // Calculate success rates
    const overallSuccessRate = overall.totalSent + overall.totalFailed > 0 ? 
                               (overall.totalSent / (overall.totalSent + overall.totalFailed)) * 100 : 0;
    
    const monthlySuccessRate = monthly.monthlySent + monthly.monthlyFailed > 0 ? 
                               (monthly.monthlySent / (monthly.monthlySent + monthly.monthlyFailed)) * 100 : 0;

    res.json({
      success: true,
      data: {
        // Overall statistics
        totalCampaigns: overall.totalCampaigns,
        totalEmailsSent: overall.totalSent,
        totalEmailsFailed: overall.totalFailed,
        overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
        
        // Monthly statistics
        monthlyEmailsSent: monthly.monthlySent,
        monthlyEmailsFailed: monthly.monthlyFailed,
        monthlyCampaigns: monthly.monthlyCampaigns,
        monthlySuccessRate: Math.round(monthlySuccessRate * 100) / 100,
        
        // Filtered statistics (if date range provided)
        periodEmailsSent: filtered.periodSent,
        periodEmailsFailed: filtered.periodFailed,
        periodCampaigns: filtered.periodCampaigns,
        
        // Chart data
        dailyStats: dailyStats.map(stat => ({
          date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
          sent: stat.sent,
          failed: stat.failed,
          campaigns: stat.campaigns
        })),
        
        // Additional insights
        recentEmails: recentEmails.map(email => ({
          ...email.toObject(),
          successRate: email.totalRecipients > 0 ? 
                       Math.round((email.successCount / email.totalRecipients) * 10000) / 100 : 0
        })),
        
        topGroups: topGroups.map(group => ({
          groupId: group._id,
          groupName: group.groupInfo[0]?.name || 'Unknown Group',
          totalSent: group.totalSent,
          totalFailed: group.totalFailed,
          campaigns: group.campaigns,
          successRate: group.totalSent + group.totalFailed > 0 ? 
                       Math.round((group.totalSent / (group.totalSent + group.totalFailed)) * 10000) / 100 : 0
        }))
      }
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NEW: Refresh user email statistics
export const refreshUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    
    // Recalculate total emails sent from Email records
    const totalSentResult = await Email.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: null, total: { $sum: '$successCount' } } }
    ]);
    
    // Get current month emails sent
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlySentResult = await Email.aggregate([
      { 
        $match: { 
          user: userObjectId,
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$successCount' } } }
    ]);
    
    // Update user record
    const user = await User.findById(userId);
    const oldMonthlyCount = user.emailsSentThisMonth;
    user.emailsSentThisMonth = monthlySentResult[0]?.total || 0;
    user.lastEmailReset = currentDate;
    await user.save();
    
    
    res.json({
      success: true,
      message: 'Email statistics refreshed successfully',
      data: {
        totalEmailsSent: totalSentResult[0]?.total || 0,
        emailsSentThisMonth: user.emailsSentThisMonth,
        previousMonthlyCount: oldMonthlyCount,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Refresh stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NEW: Debug endpoint to check email counts
export const debugEmailCounts = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    
    // Get user data
    const user = await User.findById(userId).populate('subscription');
    
    // Get email campaigns
    const emails = await Email.find({ user: userObjectId })
      .select('successCount failedCount totalRecipients status createdAt subject')
      .sort({ createdAt: -1 });
    
    // Calculate totals
    const calculatedTotal = emails.reduce((sum, email) => sum + (email.successCount || 0), 0);
    const calculatedFailed = emails.reduce((sum, email) => sum + (email.failedCount || 0), 0);
    
    // Get monthly total
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyEmails = emails.filter(email => email.createdAt >= startOfMonth);
    const calculatedMonthlyTotal = monthlyEmails.reduce((sum, email) => sum + (email.successCount || 0), 0);
    
    const debugInfo = {
      userId,
      userInfo: {
        emailsSentThisMonth: user.emailsSentThisMonth,
        subscription: user.subscription?.plan,
        emailLimit: user.subscription?.emailLimit,
        lastEmailReset: user.lastEmailReset
      },
      emailRecords: {
        totalRecords: emails.length,
        monthlyRecords: monthlyEmails.length,
        calculatedTotalSent: calculatedTotal,
        calculatedTotalFailed: calculatedFailed,
        calculatedMonthlySent: calculatedMonthlyTotal
      },
      discrepancy: {
        userVsCalculated: user.emailsSentThisMonth - calculatedTotal,
        userVsMonthlyCalculated: user.emailsSentThisMonth - calculatedMonthlyTotal
      },
      sampleRecords: emails.slice(0, 3).map(email => ({
        id: email._id,
        subject: email.subject,
        successCount: email.successCount,
        failedCount: email.failedCount,
        totalRecipients: email.totalRecipients,
        status: email.status,
        createdAt: email.createdAt
      }))
    };
    
    
    res.json({
      success: true,
      debug: debugInfo
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ NEW: Get email campaign details
export const getEmailCampaignDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const email = await Email.findOne({
      _id: id,
      user: req.userId
    })
    .populate('group', 'name contacts')
    .populate('template', 'name')
    .populate('user', 'name email');

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email campaign not found'
      });
    }

    // Calculate detailed statistics
    const successRate = email.totalRecipients > 0 ? 
                        ((email.successCount || 0) / email.totalRecipients) * 100 : 0;
    
    const failureRate = email.totalRecipients > 0 ? 
                        ((email.failedCount || 0) / email.totalRecipients) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...email.toObject(),
        statistics: {
          successRate: Math.round(successRate * 100) / 100,
          failureRate: Math.round(failureRate * 100) / 100,
          deliveryRate: Math.round((100 - failureRate) * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('❌ Get campaign details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NEW: Delete email campaign
export const deleteEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const email = await Email.findOne({
      _id: id,
      user: req.userId
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email campaign not found'
      });
    }

    // Don't allow deletion of currently sending campaigns
    if (email.status === 'sending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a campaign that is currently being sent'
      });
    }

    await Email.findByIdAndDelete(id);
    


    res.json({
      success: true,
      message: 'Email campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
