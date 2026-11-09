import cors from 'cors';
import config from './env.js';
import logger from '../utils/logger.js';

export function createCorsMiddleware() {
  const allowedOrigins = config.cors.origins;

  const corsOptions = {
    // Dynamic origin check
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        // If no origins configured, allow all in development only
        if (config.env === 'development') {
          logger.warn(
            { origin },
            'CORS: No origins configured, allowing in dev mode'
          );
          return callback(null, true);
        }
        return callback(new Error('CORS: No allowed origins configured'));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn({ origin }, 'CORS: Origin not allowed');
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },

    // Allow cookies and auth headers to be sent cross-origin
    credentials: true,

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed request headers (frontend can send these)
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],

    // How long the browser can cache the preflight response (seconds)
    maxAge: 86400, // 24 hours
  };

  return cors(corsOptions);
}