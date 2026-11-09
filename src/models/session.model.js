import mongoose from "mongoose";

const {Schema} = mongoose

const sessionSchema = new Schema(
    {
        mentor: {
            type: Schema.Types.ObjectId,
            ref: 'MentorProfile',
            required: true,
            index: true
        },
        menteeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
      max: 480,
    },
    hourlyRateSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    statusReason: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ mentor: 1, scheduledAt: -1 });
sessionSchema.index({ status: 1, scheduledAt: -1 });
sessionSchema.index({ mentor: 1, status: 1, scheduledAt: -1 });

const Session = mongoose.model('Session', sessionSchema)

export default Session