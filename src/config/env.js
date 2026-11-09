import dotenv from 'dotenv'

dotenv.config()

function parseOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

const config = {
    env: process.env.environment || 'development',
    port: process.env.PORT || 5000,
    mongo_URI: process.env.MONGODB_URI,
    session: {
        secret: process.env.SESSION_SECRET,
        name: process.env.SESSION_NAME || 'sid',
        lifetimeMs: Number (process.env.SESSION_LIFETIME_MS)
    },

    cors: {
      origins: parseOrigins(process.env.CORS_ORIGINS)

    },

    integrations: {
    exchange: {
      baseUrl:
        process.env.EXCHANGE_API_BASE_URL || 'https://api.exchangerate.host',
      timeoutMs: Number(process.env.EXCHANGE_API_TIMEOUT_MS) || 5000,
    },
  },

}

if (!config.mongo_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}
if (!config.session.secret) {
  throw new Error('SESSION_SECRET is not defined in environment variables');
}

export default config;