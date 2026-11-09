// src/routes/v1/mentorProfile.routes.js
import { Router } from 'express';
import {
  createMentor,
  getMentors,
  getMentor,
  getMyMentorProfile,
  updateMentor,
  deleteMentor,
  getMentorStatistics,
  getMentorRate, // Added missing controller import
} from '../../controllers/mentorProfile.controller.js';
import { validate } from '../../middlewares/validateRequest.js';
import {
  createMentorSchema,
  updateMentorSchema,
  getMentorSchema,
  deleteMentorSchema,
  listMentorsSchema,
} from '../../validation/mentorProfile.validation.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { mentorRateSchema } from '../../validation/mentorRate.validation.js';

const router = Router();

router.get('/stats', getMentorStatistics);
router.get('/me', requireAuth, requireRole('mentor'), getMyMentorProfile);

router
  .route('/')
  .get(validate(listMentorsSchema), getMentors)
  .post(
    requireAuth,
    requireRole('mentor', 'admin'),
    validate(createMentorSchema),
    createMentor
  );

router.get('/:id/rate', validate(mentorRateSchema), getMentorRate);

router
  .route('/:id')
  .get(validate(getMentorSchema), getMentor)
  .patch(
    requireAuth,
    requireRole('mentor', 'admin'),
    validate(updateMentorSchema),
    updateMentor
  )
  .delete(
    requireAuth,
    requireRole('admin'),
    validate(deleteMentorSchema),
    deleteMentor
  );

export default router;
