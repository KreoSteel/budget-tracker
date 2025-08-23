import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ['cash', 'checking', 'savings', 'credit_card', 'investment', 'other'],
    required: true
  },

  balance: {
    type: Number,
    default: 0
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  currency: {
    type: String,
    default: 'EUR'
  },

  bankName: {
    type: String,
  },

  isActive: {
    type: Boolean,
    default: true
  },
  
}, {
  timestamps: true
});

export default mongoose.model("Account", accountSchema);
