import Group from '../models/Group.js';
import User from '../models/User.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, contacts } = req.body;

    const user = await User.findById(req.userId).populate('subscription');
    const existingGroups = await Group.countDocuments({ user: req.userId });

    if (existingGroups >= user.subscription.groupLimit) {
      return res.status(400).json({
        success: false,
        message: `You can only create ${user.subscription.groupLimit} groups with your current plan`
      });
    }

    const group = new Group({
      name,
      description,
      contacts,
      user: req.userId
    });

    await group.save();

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ user: req.userId });
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, description, contacts } = req.body;

    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, description, contacts },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addContactToGroup = async (req, res) => {
  try {
    const { name, email, customFields } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if contact already exists
    const existingContact = group.contacts.find(contact => contact.email === email);
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact already exists in this group'
      });
    }

    group.contacts.push({ name, email, customFields });
    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const removeContactFromGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    group.contacts = group.contacts.filter(
      contact => contact._id.toString() !== req.params.contactId
    );

    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
