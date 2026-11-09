// src/routes/v1/index.js
import { Router } from 'express';
import config from '../../config/env.js';
import mentorRouter from './mentorProfile.routes.js';
import sessionRouter from './session.routes.js';
import authRouter from './auth.routes.js'

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.env,
    message: 'API is healthy',
  });
});

router.use('/auth', authRouter);
router.use('/mentors', mentorRouter);
router.use('/sessions', sessionRouter);

export default router;