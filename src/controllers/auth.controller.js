// src/controllers/auth.controller.js
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import config from '../config/env.js';
import { registerUser, loginUser } from '../services/auth.service.js';
import User from '../models/user.model.js';

// POST /api/v1/auth/register
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const { user, reason } = await registerUser({ name, email, password, role });

  if (reason === 'email_taken') {
    return next(new AppError('Email is already in use', 409));
  }

  // Auto-login on successful registration
  req.session.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

// POST /api/v1/auth/login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const { user, reason } = await loginUser({ email, password });

  if (reason === 'invalid_credentials') {
    return next(new AppError('Invalid email or password', 401));
  }

  req.session.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// POST /api/v1/auth/logout
export const logout = catchAsync(async (req, res, next) => {
  if (!req.session) {
    return res.status(200).json({ status: 'success', message: 'Logged out' });
  }

  req.session.destroy((err) => {
    if (err) {
      return next(new AppError('Failed to logout', 500));
    }

    // clear session cookie
    res.clearCookie(config.session.name);

    return res.status(200).json({
      status: 'success',
      message: 'Logged out',
    });
  });
});

// GET /api/v1/auth/me
export const getMe = catchAsync(async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { id } = req.session.user;

  const user = await User.findById(id);
  if (!user || !user.isActive) {
    return next(new AppError('User not found or inactive', 401));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
