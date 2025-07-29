// src/controllers/emailController.js
import Group from '../models/Group.js';
import Template from '../models/Template.js';
import EmailLog from '../models/EmailLog.js';
import emailService from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const sendEmailSchema = Joi.object({
  groupId: Joi.string().required(),
  templateId: Joi.string().required(),
  fromAddress: Joi.string().email().required(),
  customVariables: Joi.object().default({})
});

export const sendBulkEmail = async (req, res) => {
  try {
    const { error, value } = sendEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { groupId, templateId, fromAddress, customVariables } = value;

    // Verify group belongs to user
    const group = await Group.findOne({
      _id: groupId,
      userId: req.user.sub
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify template belongs to user
    const template = await Template.findOne({
      _id: templateId,
      userId: req.user.sub
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if user has enough email credits
    const emailCount = group.contacts.length;
    const user = req.user.profile;
    const subscription = req.user.subscription;
    
    if (subscription.emailLimit !== -1 && 
        user.emailsUsedThisMonth + emailCount > subscription.emailLimit) {
      return res.status(403).json({
        error: 'Insufficient email credits',
        required: emailCount,
        available: subscription.emailLimit - user.emailsUsedThisMonth
      });
    }

    // Prepare email data
    const campaignId = uuidv4();
    const emailsData = group.contacts.map(contact => ({
      email: contact.email,
      name: contact.name,
      groupId: group._id,
      variables: {
        ...customVariables,
        name: contact.name || contact.email.split('@')[0],
        ...contact.customFields
      }
    }));

    // Send emails in background
    const results = await emailService.sendBulkEmails(
      req.user.sub,
      campaignId,
      emailsData,
      template,
      fromAddress
    );

    res.json({
      message: 'Bulk email campaign initiated',
      campaignId,
      totalEmails: emailCount,
      results: results.slice(0, 5), // Return first 5 results
      summary: {
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCampaignStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const emailLogs = await EmailLog.find({
      campaignId,
      userId: req.user.sub
    }).populate('groupId', 'name').populate('templateId', 'name subject');

    const summary = {
      total: emailLogs.length,
      sent: emailLogs.filter(log => log.status === 'sent').length,
      failed: emailLogs.filter(log => log.status === 'failed').length,
      pending: emailLogs.filter(log => log.status === 'pending').length
    };

    res.json({
      campaignId,
      summary,
      logs: emailLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmailHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const emailLogs = await EmailLog.find({ userId: req.user.sub })
      .populate('groupId', 'name')
      .populate('templateId', 'name subject')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EmailLog.countDocuments({ userId: req.user.sub });

    res.json({
      logs: emailLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
