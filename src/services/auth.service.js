// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const SALT_ROUNDS = 12;

export async function registerUser({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return { user: null, reason: 'email_taken' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: role || 'mentee',
  });

  return { user, reason: null };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail, isActive: true });

  if (!user) {
    return { user: null, reason: 'invalid_credentials' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { user: null, reason: 'invalid_credentials' };
  }

  return { user, reason: null };
}