import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },

    
    accountId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    date: {
        type: Date,
        required: false,
        default: Date.now
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'],
        default: 'cash'
    },

    isRecurring: {
        type: Boolean,
        default: false
    },

    recurringDetails: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        },
        endDate: {
            type: Date,
        },
        nextOccurrence: {
            type: Date,
        },
        occurrences: {
            type: Number,
            default: null // null for infinite, number for specific count
        }
    },


}, {
    timestamps: true
});

export default mongoose.model("Transaction", transactionSchema);
