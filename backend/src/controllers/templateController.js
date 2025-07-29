// src/controllers/templateController.js
import Template from '../models/Template.js';
import Group from '../models/Group.js';
import aiService from '../services/aiService.js';
import { sanitizeHtml, createEmailPreview } from '../utils/helpers.js';
import Joi from 'joi';

const templateSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  subject: Joi.string().required().min(1).max(200),
  htmlContent: Joi.string().required(),
  textContent: Joi.string().allow(''),
  groupId: Joi.string().allow(''),
  variables: Joi.array().items(Joi.string()).default([])
});

const aiTemplateSchema = Joi.object({
  prompt: Joi.string().required().min(10).max(1000),
  groupId: Joi.string().required(),
  purpose: Joi.string().required().min(5).max(200)
});

export const createTemplate = async (req, res) => {
  try {
    const { error, value } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Sanitize HTML content
    value.htmlContent = sanitizeHtml(value.htmlContent);

    const template = new Template({
      ...value,
      userId: req.user.sub
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    const filter = { userId: req.user.sub };
    if (groupId) {
      filter.groupId = groupId;
    }

    const templates = await Template.find(filter)
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.sub
    }).populate('groupId', 'name');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { error, value } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Sanitize HTML content
    value.htmlContent = sanitizeHtml(value.htmlContent);

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      value,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateAITemplate = async (req, res) => {
  try {
    const { error, value } = aiTemplateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { prompt, groupId, purpose } = value;

    // Verify group belongs to user
    const group = await Group.findOne({
      _id: groupId,
      userId: req.user.sub
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Generate template using AI
    const aiTemplate = await aiService.generateEmailTemplate(
      prompt,
      group.name,
      purpose
    );

    // Sanitize AI-generated content
    aiTemplate.htmlContent = sanitizeHtml(aiTemplate.htmlContent);

    const template = new Template({
      name: `${purpose} - ${group.name}`,
      subject: aiTemplate.subject,
      htmlContent: aiTemplate.htmlContent,
      textContent: aiTemplate.textContent,
      userId: req.user.sub,
      groupId: group._id,
      isAIGenerated: true,
      variables: aiTemplate.variables || []
    });

    await template.save();

    res.status(201).json({
      message: 'AI template generated successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const previewTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.sub
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const sampleData = req.body.sampleData || {};
    const preview = createEmailPreview(template, sampleData);

    res.json({
      preview: {
        subject: template.subject,
        htmlContent: preview,
        textContent: template.textContent
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
