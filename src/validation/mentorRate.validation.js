// src/validation/mentorRate.validation.js
import { z } from 'zod';
import { objectIdSchema } from './common.validation.js';

export const mentorRateSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    currency: z
      .string()
      .trim()
      .length(3, 'Currency must be a 3-letter ISO code')
      .toUpperCase()
      .optional(),
  }),
});