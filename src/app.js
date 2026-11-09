import express from 'express'
import v1Router from './routes/v1/index.js'
import AppError from './utils/AppError.js';
import globalErrorHandler from './middlewares/errorHandler.js';
import { createSessionMiddleware } from './config/session.js';
import { createCorsMiddleware } from './config/cors.js';

const app = express()

app.use(createCorsMiddleware());

app.use(express.json())

app.use(createSessionMiddleware());


app.use('/api/v1', v1Router);

app.all('*splat', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// Global error handler
app.use(globalErrorHandler);

export default app