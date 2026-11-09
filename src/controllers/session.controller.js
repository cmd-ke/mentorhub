// src/controllers/session.controller.js
import {
  createSession,
  querySessions,
  getSessionById,
  updateSessionById,
  deleteSessionById,
  getSessionStatsByMentor,
} from '../services/session.service.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// POST /api/v1/sessions
export const createSessionController = catchAsync(async (req, res, next) => {
  const { session, reason } = await createSession(req.body);

  if (reason === 'mentor_not_found') {
    return next(new AppError('Mentor not found', 404));
  }

  res.status(201).json({
    status: 'success',
    data: session,
  });
});

// GET /api/v1/sessions
export const getSessionsController = catchAsync(async (req, res) => {
  const { mentor, status, from, to, sort, page, limit } = req.query;

  const { results, pageInfo } = await querySessions({
    mentor,
    status,
    from,
    to,
    sort,
    page,
    limit,
  });

  res.status(200).json({
    status: 'success',
    results: results.length,
    pageInfo,
    data: results,
  });
});

// GET /api/v1/sessions/:id
export const getSessionController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const session = await getSessionById(id);

  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: session,
  });
});

// PATCH /api/v1/sessions/:id
export const updateSessionController = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const updated = await updateSessionById(id, req.body);

    if (!updated) {
      return next(new AppError('Session not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  }
);

// DELETE /api/v1/sessions/:id
export const deleteSessionController = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const deleted = await deleteSessionById(id);

    if (!deleted) {
      return next(new AppError('Session not found', 404));
    }

    res.status(204).send();
  }
);

// GET /api/v1/sessions/stats/mentor/:mentorId
export const getMentorSessionStatsController = catchAsync(
  async (req, res) => {
    const { mentorId } = req.params;

    const stats = await getSessionStatsByMentor(mentorId);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }
);