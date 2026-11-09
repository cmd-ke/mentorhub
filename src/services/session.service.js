// src/services/session.service.js
import mongoose from 'mongoose';
import Session from '../models/session.model.js';
import MentorProfile from '../models/mentorProfiles.model.js';

export async function createSession(data) {
  const {
    mentor: mentorId,
    menteeName,
    scheduledAt,
    durationMinutes,
    meetingLink,
    notes,
    status,
  } = data;

  const mentor = await MentorProfile.findById(mentorId);
  if (!mentor) {
    return { session: null, reason: 'mentor_not_found' };
  }

  const hourlyRateSnapshot = mentor.hourlyRate;
  const totalPriceRaw = (durationMinutes / 60) * hourlyRateSnapshot;
  const totalPrice = Math.round(totalPriceRaw * 100) / 100;

  const session = await Session.create({
    mentor: mentor._id,
    menteeName,
    scheduledAt: new Date(scheduledAt),
    durationMinutes,
    hourlyRateSnapshot,
    totalPrice,
    meetingLink,
    notes,
    status: status || 'scheduled',
  });

  return { session, reason: null };
}

export async function querySessions(options) {
  const { mentor, status, from, to, sort, page = 1, limit = 10 } = options;

  const filter = {};

  if (mentor) {
    filter.mentor = mentor;
  }

  if (status) {
    filter.status = status;
  }

  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }

  let sortBy = {};
  if (sort) {
    sort.split(',').forEach((field) => {
      const trimmed = field.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('-')) {
        sortBy[trimmed.slice(1)] = -1;
      } else {
        sortBy[trimmed] = 1;
      }
    });
  } else {
    sortBy = { scheduledAt: -1 }; // newest/upcoming first
  }

  const limitNum = Number(limit) || 10;
  const pageNum = Number(page) || 1;
  const skip = (pageNum - 1) * limitNum;

  const query = Session.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum)
    .populate('mentor', 'name headline skills hourlyRate ratingAverage');

  const [sessions, totalDocs] = await Promise.all([
    query.exec(),
    Session.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / limitNum));

  return {
    results: sessions,
    pageInfo: {
      page: pageNum,
      limit: limitNum,
      totalDocs,
      totalPages,
    },
  };
}

export async function getSessionById(id) {
  const session = await Session.findById(id).populate(
    'mentor',
    'name headline skills hourlyRate ratingAverage'
  );
  return session;
}

export async function updateSessionById(id, data) {
  const update = { ...data };

  if (update.scheduledAt) {
    update.scheduledAt = new Date(update.scheduledAt);
  }

  // Recompute totalPrice if duration changes
  if (update.durationMinutes != null) {
    const session = await Session.findById(id);
    if (!session) {
      return null;
    }
    const durationMinutes = update.durationMinutes;
    const hourlyRateSnapshot = session.hourlyRateSnapshot;
    const totalPriceRaw = (durationMinutes / 60) * hourlyRateSnapshot;
    update.totalPrice = Math.round(totalPriceRaw * 100) / 100;
  }

  const updated = await Session.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate('mentor', 'name headline skills hourlyRate ratingAverage');

  return updated;
}

export async function deleteSessionById(id) {
  const deleted = await Session.findByIdAndDelete(id);
  return deleted;
}

export async function getSessionStatsByMentor(mentorId) {
  const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

  const [overall] = await Session.aggregate([
    { $match: { mentor: mentorObjectId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelledSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        scheduledSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] },
        },
        totalDurationMinutes: { $sum: '$durationMinutes' },
        totalRevenue: { $sum: '$totalPrice' },
        firstSessionAt: { $min: '$scheduledAt' },
        lastSessionAt: { $max: '$scheduledAt' },
      },
    },
    { $project: { _id: 0 } },
  ]);

  const monthly = await Session.aggregate([
    { $match: { mentor: mentorObjectId } },
    {
      $group: {
        _id: {
          year: { $year: '$scheduledAt' },
          month: { $month: '$scheduledAt' },
        },
        sessions: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
        avgDurationMinutes: { $avg: '$durationMinutes' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return {
    overall: overall || null,
    monthly,
  };
}