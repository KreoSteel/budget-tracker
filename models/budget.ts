import mongoose, { ObjectId } from "mongoose";

export interface ICategory {
  categoryId: ObjectId;
  allocatedAmount: number;
  spentAmount: number;
}

const budgetSchema = new mongoose.Schema({
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

  period: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },
  categories: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    allocatedAmount: {
      type: Number,
      required: true
    },

    spentAmount: {
      type: Number,
      default: 0
    }
  }],

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Budget", budgetSchema);
