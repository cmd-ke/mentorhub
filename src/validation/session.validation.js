import {z} from 'zod'
import { objectIdSchema } from './common.validation.js'


const baseSessionBody = {
  mentor: objectIdSchema,
  menteeName: z.string().min(1).max(120),
  scheduledAt: z.string().datetime(), // ISO string
  durationMinutes: z.coerce.number().min(15).max(480),
  meetingLink: z.string().url().max(500).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
};

//create Session
export const createSessionSchema = z.object({
  body: z.object(baseSessionBody),
});


//update Session
export const updateSessionSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }),
    body: z
    .object({
    mentor: objectIdSchema.optional(),
      menteeName: z.string().min(1).max(120).optional(),
      scheduledAt: z.string().datetime().optional(),
      durationMinutes: z.coerce.number().min(15).max(480).optional(),
      meetingLink: z.string().url().max(500).optional(),
      notes: z.string().max(2000).optional(),
      status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),

    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        'At least one field must ne provided for update'
    )
})

//get session by id

export const getSessionSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
})

//delete Session
export const deleteSessionSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
})

//
export const listSessionsSchema = z.object({
  query: z.object({
    mentor: objectIdSchema.optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    sort: z.string().trim().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
  }),
});

export const mentorSessionStatsSchema = z.object({
  params: z.object({
    mentorId: objectIdSchema,
  }),
});