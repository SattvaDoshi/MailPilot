// src/models/Group.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: String,
  customFields: {
    type: Map,
    of: String
  }
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  userId: {
    type: String,
    required: true,
    index: true
  },
  contacts: [contactSchema],
  tags: [String]
}, {
  timestamps: true
});

export default mongoose.model('Group', groupSchema);
