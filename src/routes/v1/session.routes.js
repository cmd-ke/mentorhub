// src/routes/v1/session.routes.js
import { Router } from 'express';
import { validate } from '../../middlewares/validateRequest.js';
import {
  createSessionSchema,
  updateSessionSchema,
  getSessionSchema,
  deleteSessionSchema,
  listSessionsSchema,
  mentorSessionStatsSchema,
} from '../../validation/session.validation.js';
import {
  createSessionController,
  getSessionsController,
  getSessionController,
  updateSessionController,
  deleteSessionController,
  getMentorSessionStatsController,
} from '../../controllers/session.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

router.get(
  '/stats/mentor/:mentorId',
  validate(mentorSessionStatsSchema),
  getMentorSessionStatsController
);

router
  .route('/')
  .get(validate(listSessionsSchema), getSessionsController)
  .post(requireAuth, validate(createSessionSchema), createSessionController);

router
  .route('/:id')
  .get(validate(getSessionSchema), getSessionController)
  .patch(requireAuth, validate(updateSessionSchema), updateSessionController)
  .delete(requireAuth, validate(deleteSessionSchema), deleteSessionController);

export default router;