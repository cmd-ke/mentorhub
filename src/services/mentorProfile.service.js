// src/services/mentorProfile.service.js
import MentorProfile from '../models/mentorProfiles.model.js';

// --- LIST / QUERY MENTORS ---

export async function queryMentorProfiles(options) {
  const {
    search,
    skills,
    minRate,
    maxRate,
    minExperience,
    maxExperience,
    isActive,
    sort,
    page = 1,
    limit = 10,
    cursor,
  } = options;

  const filter = {};

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  // Text search (uses the text index defined on headline/bio)
  if (search) {
    filter.$text = { $search: search };
  }

  // Skills filter: require all listed skills
  if (skills && skills.length > 0) {
    filter.skills = { $all: skills };
  }

  // Hourly rate range
  if (minRate != null || maxRate != null) {
    filter.hourlyRate = {};
    if (minRate != null) filter.hourlyRate.$gte = minRate;
    if (maxRate != null) filter.hourlyRate.$lte = maxRate;
  }

  // Experience range
  if (minExperience != null || maxExperience != null) {
    filter.yearsOfExperience = {};
    if (minExperience != null) filter.yearsOfExperience.$gte = minExperience;
    if (maxExperience != null) filter.yearsOfExperience.$lte = maxExperience;
  }

  // Build sort object
  let sortBy = {};

  if (cursor) {
    // Enforce createdAt desc for cursor-based pagination
    filter.createdAt = {
      ...(filter.createdAt || {}),
      $lt: new Date(cursor),
    };
    sortBy = { createdAt: -1 };
  } else if (sort) {
    // sort=-ratingAverage,hourlyRate => { ratingAverage: -1, hourlyRate: 1 }
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
    // Default sort: newest first
    sortBy = { createdAt: -1 };
  }

  const limitNum = Number(limit) || 10;
  
  // 💡 Added .populate('user', 'name email') to link your user model context
  let query = MentorProfile.find(filter)
    .sort(sortBy)
    .limit(limitNum)
    .populate('user', 'name email');

  // Cursor-based pagination (no page/skip)
  if (cursor) {
    const docs = await query.exec();

    const nextCursor =
      docs.length === limitNum
        ? docs[docs.length - 1].createdAt.toISOString()
        : null;

    return {
      results: docs,
      pageInfo: {
        type: 'cursor',
        limit: limitNum,
        cursor,
        nextCursor,
      },
    };
  }

  // Page-based pagination
  const pageNum = Number(page) || 1;
  const skip = (pageNum - 1) * limitNum;

  query = query.skip(skip);

  const [docs, totalDocs] = await Promise.all([
    query.exec(),
    MentorProfile.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / limitNum));

  return {
    results: docs,
    pageInfo: {
      type: 'page',
      page: pageNum,
      limit: limitNum,
      totalDocs,
      totalPages,
    },
  };
}

// --- SINGLE DOCUMENT OPERATIONS ---

export async function createMentorProfile(data) {
  const mentor = await MentorProfile.create(data);
  // Populate the user reference fields immediately upon creation
  return await mentor.populate('user', 'name email');
}

export async function getMentorProfileById(id) {
  const mentor = await MentorProfile.findById(id).populate('user', 'name email');
  return mentor;
}

export async function getMentorProfileByUserId(userId) {
  return MentorProfile.findOne({ user: userId }).populate('user', 'name email');
}

export async function updateMentorProfileById(id, data) {
  const updated = await MentorProfile.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email'); // 💡 Ensure updated documents retain reference shapes
  return updated;
}

export async function deleteMentorProfileById(id) {
  const deleted = await MentorProfile.findByIdAndDelete(id);
  return deleted;
}

// --- AGGREGATION STATS ---

export async function getMentorStats() {
  const [overall] = await MentorProfile.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMentors: { $sum: 1 },
        avgHourlyRate: { $avg: '$hourlyRate' },
        minHourlyRate: { $min: '$hourlyRate' },
        maxHourlyRate: { $max: '$hourlyRate' },
        avgExperience: { $avg: '$yearsOfExperience' },
        avgRating: { $avg: '$ratingAverage' },
      },
    },
    { $project: { _id: 0 } },
  ]);

  const topSkills = await MentorProfile.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        mentorsCount: { $sum: 1 },
        avgRate: { $avg: '$hourlyRate' },
        avgRating: { $avg: '$ratingAverage' },
      },
    },
    { $sort: { mentorsCount: -1 } },
    { $limit: 10 },
  ]);

  return {
    overall: overall || null,
    topSkills,
  };
}
