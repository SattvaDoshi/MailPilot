// src/controllers/groupController.js
import Group from '../models/Group.js';
import User from '../models/User.js';
import Joi from 'joi';

const groupSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().max(500),
  contacts: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().max(100),
      customFields: Joi.object()
    })
  ).required()
});

export const createGroup = async (req, res) => {
  try {
    const { error, value } = groupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const group = new Group({
      ...value,
      userId: req.user.sub
    });

    await group.save();

    // Update user's group count
    await User.findOneAndUpdate(
      { clerkId: req.user.sub },
      { $inc: { groupsCreated: 1 } }
    );

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ userId: req.user.sub })
      .select('-contacts.customFields')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      userId: req.user.sub
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { error, value } = groupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      value,
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update user's group count
    await User.findOneAndUpdate(
      { clerkId: req.user.sub },
      { $inc: { groupsCreated: -1 } }
    );

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
