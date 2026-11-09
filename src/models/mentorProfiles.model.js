// src/models/mentorProfile.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const mentorProfileSchema = new Schema(
    {
        // 💡 1. FIX: Connect this profile directly to a User Account doc ID
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Must match your User model registration name exactly
            required: true,
            unique: true, // A user can only have ONE profile
        },
        headline: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        bio: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        skills: {
            type: [String],
            default: [],
            index: true,
        },
        hourlyRate: {
            type: Number,
            required: true,
            min: 0,
        },
        yearsOfExperience: {
            type: Number,
            required: true,
            min: 0,
            max: 60,
        },
        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// 💡 2. FIX: Remove 'name' from the text search indexes configuration
mentorProfileSchema.index({
  headline: 'text',
  bio: 'text',
});

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);
export default MentorProfile;
