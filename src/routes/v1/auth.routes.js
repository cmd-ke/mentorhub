// src/routes/v1/auth.routes.js
import { Router } from 'express';
import { validate } from '../../middlewares/validateRequest.js';
import { registerSchema, loginSchema } from '../../validation/auth.validation.js';
import { register, login, logout, getMe } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;