import Template from '../models/Template.js';
import Group from '../models/Group.js';
import { generateEmailTemplate } from '../services/aiService.js';

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, content, groupId, variables } = req.body;

    const group = await Group.findOne({
      _id: groupId,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const template = new Template({
      name,
      subject,
      content,
      group: groupId,
      user: req.userId,
      variables
    });

    await template.save();

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const generateAITemplate = async (req, res) => {
  try {
    const { prompt, groupId, tone, purpose } = req.body;

    const group = await Group.findOne({
      _id: groupId,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const generatedTemplate = await generateEmailTemplate({
      prompt,
      tone,
      purpose,
      groupName: group.name
    });

    const template = new Template({
      name: `AI Generated - ${group.name}`,
      subject: generatedTemplate.subject,
      content: generatedTemplate.content,
      group: groupId,
      user: req.userId,
      isAiGenerated: true,
      variables: generatedTemplate.variables
    });

    await template.save();

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    const filter = { user: req.userId };
    if (groupId) {
      filter.group = groupId;
    }

    const templates = await Template.find(filter).populate('group', 'name');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('group', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, subject, content, variables } = req.body;

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, subject, content, variables },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
