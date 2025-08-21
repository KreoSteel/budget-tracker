import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  targetAmount: {
    type: Number,
    required: true
  },

  currentAmount: {
    type: Number,
    required: true,
    default: 0
  },

  targetDate: {
    type: Date,
  },

  description: {
    type: String,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export default mongoose.model("Goal", goalSchema);
