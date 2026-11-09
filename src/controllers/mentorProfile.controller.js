// src/controllers/mentorProfile.controller.js
import {
  createMentorProfile,
  queryMentorProfiles,
  getMentorProfileById,
  getMentorProfileByUserId,
  updateMentorProfileById,
  deleteMentorProfileById,
  getMentorStats,
} from '../services/mentorProfile.service.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { getMentorRateInCurrency } from '../services/mentorRate.service.js';

// POST /api/v1/mentors
export const createMentor = catchAsync(async (req, res) => {
  // If creating profiles manually from a dashboard, assign the active log-in user ID
  if (!req.body.user && req.user) req.body.user = req.user.id;
  
  const mentor = await createMentorProfile(req.body);

  res.status(201).json({
    status: 'success',
    data: mentor,
  });
});

// GET /api/v1/mentors
export const getMentors = catchAsync(async (req, res) => {
  const {
    search,
    skills,
    minRate,
    maxRate,
    minExperience,
    maxExperience,
    isActive,
    sort,
    page,
    limit,
    cursor,
  } = req.query;

  const { results, pageInfo } = await queryMentorProfiles({
    search,
    skills,
    minRate,
    maxRate,
    minExperience,
    maxExperience,
    isActive,
    sort,
    page,
    limit,
    cursor,
  });

  res.status(200).json({
    status: 'success',
    results: results.length,
    pageInfo,
    data: results, // Documents inside this array contain populated user sub-objects
  });
});

// GET /api/v1/mentors/:id
export const getMentor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const mentor = await getMentorProfileById(id);

  if (!mentor) {
    return next(new AppError('Mentor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: mentor,
  });
});

// GET /api/v1/mentors/me
export const getMyMentorProfile = catchAsync(async (req, res, next) => {
  const mentor = await getMentorProfileByUserId(req.user.id);

  if (!mentor) {
    return next(new AppError('Mentor profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: mentor,
  });
});

// PATCH /api/v1/mentors/:id
export const updateMentor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const mentor = await updateMentorProfileById(id, req.body);

  if (!mentor) {
    return next(new AppError('Mentor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: mentor,
  });
});

// DELETE /api/v1/mentors/:id
export const deleteMentor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await deleteMentorProfileById(id);

  if (!deleted) {
    return next(new AppError('Mentor not found', 404));
  }

  res.status(204).send();
});

// GET /api/v1/mentors/stats
export const getMentorStatistics = catchAsync(async (req, res) => {
  const stats = await getMentorStats();

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// GET /api/v1/mentors/:id/rate?currency=EUR
export const getMentorRate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { currency = 'USD' } = req.query;

  const { data, reason } = await getMentorRateInCurrency({
    mentorId: id,
    targetCurrency: currency,
  });

  if (reason === 'mentor_not_found') {
    return next(new AppError('Mentor not found', 404));
  }

  if (reason === 'exchange_api_failed') {
    return next(new AppError('Failed to fetch exchange rate', 502));
  }

  res.status(200).json({
    status: 'success',
    data,
  });
});
