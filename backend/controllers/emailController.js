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
    const remainingEmails = user.subscription.emailLimit - user.emailsSentThisMonth;

    if (user.subscription.plan !== 'unlimited' && emailsToSend > remainingEmails) {
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

    // Create email record
    const email = new Email({
      user: req.userId,
      group: groupId,
      template: templateId,
      subject: finalSubject,
      content: finalContent,
      recipients: group.contacts.map(contact => ({
        email: contact.email,
        name: contact.name,
        status: 'pending'
      })),
      totalRecipients: group.contacts.length,
      status: 'sending'
    });

    await email.save();

    // Send emails asynchronously
    sendBulkEmails(user, group, email, finalSubject, finalContent)
      .then(async (results) => {
        // Update email record with results
        email.successCount = results.successCount;
        email.failedCount = results.failedCount;
        email.status = 'completed';
        email.recipients = results.recipients;
        
        // Update user's email count
        user.emailsSentThisMonth += results.successCount;
        await user.save();
        await email.save();
      })
      .catch(async (error) => {
        email.status = 'failed';
        await email.save();
        console.error('Bulk email sending failed:', error);
      });

    res.json({
      success: true,
      message: 'Email sending initiated',
      data: {
        emailId: email._id,
        totalRecipients: email.totalRecipients
      }
    });
  } catch (error) {
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

    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const emails = await Email.find({ user: req.userId })
      .populate('group', 'name')
      .populate('template', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Email.countDocuments({ user: req.userId });

    res.json({
      success: true,
      data: {
        emails,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    
    const totalEmails = await Email.countDocuments({ user: userId });
    const totalSent = await Email.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$successCount' } } }
    ]);
    
    const totalFailed = await Email.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$failedCount' } } }
    ]);

    const recentEmails = await Email.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('group', 'name');

    res.json({
      success: true,
      data: {
        totalCampaigns: totalEmails,
        totalEmailsSent: totalSent[0]?.total || 0,
        totalEmailsFailed: totalFailed[0]?.total || 0,
        recentEmails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
