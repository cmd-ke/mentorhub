import { z } from 'zod';
import { objectIdSchema } from './common.validation.js';


const baseMentorBody = {
  headline: z.string().min(1).max(120),
  bio: z.string().min(1).max(2000),
  skills: z.array(z.string()).default([]).optional(),
  hourlyRate: z.number().min(0),
  yearsOfExperience: z.number().min(0).max(60),
  isActive: z.boolean().optional(),
};

// 1. Create Schema: All base fields are required
export const createMentorSchema = z.object({
  body: z.object(baseMentorBody),
});

// 2. Update Schema: Fields are dynamically turned optional via .partial()
export const updateMentorSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object(baseMentorBody) 
    .partial()              
    .strict()              
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field must be provided for update'
    ),
});

// 3. Get Schema: Validates URL param id
export const getMentorSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// 4. Delete Schema: Validates URL param id
export const deleteMentorSchema = z.object({
  params: z.object({
    id: objectIdSchema, 
  }),
});


export const listMentorsSchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),

      // skills=Node.js,Express => ['Node.js', 'Express']
      skills: z
        .string()
        .trim()
        .optional()
        .transform((val) =>
          val ? val.split(',').map((s) => s.trim()).filter(Boolean) : undefined
        ),

      minRate: z.coerce.number().min(0).optional(),
      maxRate: z.coerce.number().min(0).optional(),

      minExperience: z.coerce.number().min(0).optional(),
      maxExperience: z.coerce.number().min(0).optional(),

      isActive: z.coerce.boolean().optional(),

      sort: z.string().trim().optional(),

      page: z.coerce.number().min(1).optional(),
      limit: z.coerce.number().min(1).max(50).optional(),

      // Cursor for cursor-based pagination: ISO datetime string
      cursor: z.string().datetime().optional(),
    })
    .refine(
      (data) => !(data.cursor && data.page),
      {
        message: 'Use either cursor or page-based pagination, not both',
        path: ['cursor'],
      }
    ),
});