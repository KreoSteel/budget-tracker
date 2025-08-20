import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    preferences: {
        currency: {
            type: String,
            default: 'EUR'
        },
        dateFormat: {
            type: String,
            default: 'DD/MM/YYYY'
        },
        budgetPeriod: {
            type: String,
            enum: ['weekly', 'monthly', 'yearly'],
            default: 'monthly'
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        }
    },

    isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
})

export default mongoose.model("User", userSchema);