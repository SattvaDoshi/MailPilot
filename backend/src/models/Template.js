// src/models/Template.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: String,
  userId: {
    type: String,
    required: true,
    index: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  variables: [String] // For personalization like {{name}}, {{company}}
}, {
  timestamps: true
});

export default mongoose.model('Template', templateSchema);
