/**
 * this validates fetching of ObjectIds from Mongoose
 */

import {z} from 'zod'

export const objectIdSchema =z
.string()
.regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

