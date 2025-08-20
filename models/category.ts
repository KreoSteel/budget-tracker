import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isDefault: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

}, {
  timestamps: true
});

export default mongoose.model("Category", categorySchema);