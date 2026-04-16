const mongoose = require('mongoose');

const supportAgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Developer', 'Payment Specialist', 'Support Engineer', 'Generalist'],
      required: true,
    },
    expertise: [
      {
        type: String,
        enum: ['Bug', 'Feature', 'Payment', 'Login', 'Other'],
      },
    ],
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportAgent', supportAgentSchema);
