import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  recipients: [{
    email: String,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    errorMessage: String
  }],
  totalRecipients: Number,
  successCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sending', 'completed', 'failed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

export default mongoose.model('Email', emailSchema);
