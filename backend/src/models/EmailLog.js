// src/models/EmailLog.js
import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  campaignId: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientName: String,
  subject: String,
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  errorMessage: String,
  sentAt: Date,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  }
}, {
  timestamps: true
});

export default mongoose.model('EmailLog', emailLogSchema);
