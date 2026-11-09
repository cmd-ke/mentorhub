# MentorHub

A full-stack mentorship platform where mentees discover mentors, book
sessions, and track progress. Built with the MERN stack following
production-grade architecture patterns.

## Tech Stack

**Backend** — Node.js, Express.js, MongoDB, Mongoose, Zod, express-session,
connect-mongo, bcryptjs, Pino, Axios, node-cron

**Frontend** — React 18, Vite, React Router v6, Axios

## Project Structure

```
mentorhub/
├── mentorhub-api/          # Express backend (port 5000)
│   └── src/
│       ├── config/         # env, db, session, cors
│       ├── controllers/    # HTTP layer
│       ├── integrations/   # External API clients
│       ├── jobs/           # Background tasks (cron)
│       ├── middlewares/     # auth, validation, error handler
│       ├── models/         # Mongoose schemas
│       ├── routes/v1/      # Versioned API routes
│       ├── services/       # Business logic
│       ├── utils/          # AppError, catchAsync, logger
│       └── validation/     # Zod schemas
│
└── mentorhub-frontend/     # React frontend (port 5173)
    └── src/
        ├── api/            # Axios client + API services
        ├── pages/          # Route components
        └── utils/          # Error handling helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Backend

```bash
cd mentorhub-api
npm install
cp .env.example .env        # Edit with your MongoDB URI and session secret
npm run dev
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd mentorhub-frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
npm run dev
```

App runs at `http://localhost:5173`.

## Environment Variables

### Backend (`mentorhub-api/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `SESSION_SECRET` | Session signing secret | — |
| `SESSION_NAME` | Cookie name | `mentorhub.sid` |
| `SESSION_LIFETIME_MS` | Session duration in ms | `604800000` |
| `CORS_ORIGINS` | Comma-separated allowed origins | — |
| `EXCHANGE_API_BASE_URL` | Currency API base URL | `https://api.exchangerate.host` |

### Frontend (`mentorhub-frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:5000` |

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, auto-login |
| POST | `/auth/login` | No | Log in, set session cookie |
| POST | `/auth/logout` | Yes | Destroy session |
| GET | `/auth/me` | Yes | Get current user profile |

### Mentors

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/mentors` | No | List with search, filter, sort, paginate |
| GET | `/mentors/stats` | No | Aggregated statistics |
| POST | `/mentors` | Mentor/Admin | Create mentor profile |
| GET | `/mentors/:id` | No | Get single mentor |
| GET | `/mentors/:id/rate?currency=EUR` | No | Hourly rate in target currency |
| PATCH | `/mentors/:id` | Mentor/Admin | Update mentor profile |
| DELETE | `/mentors/:id` | Admin | Delete mentor profile |

**Query parameters for `GET /mentors`:**

| Param | Type | Example |
|---|---|---|
| `search` | string | `backend` |
| `skills` | string (comma-separated) | `Node.js,Express` |
| `minRate` | number | `50` |
| `maxRate` | number | `150` |
| `minExperience` | number | `3` |
| `maxExperience` | number | `10` |
| `isActive` | boolean | `true` |
| `sort` | string | `-ratingAverage,hourlyRate` |
| `page` | number | `1` |
| `limit` | number | `10` |
| `cursor` | ISO date | `2025-01-01T00:00:00Z` |

### Sessions

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/sessions` | No | List with mentor/status/date filters |
| POST | `/sessions` | Yes | Book a session |
| GET | `/sessions/:id` | No | Get single session |
| PATCH | `/sessions/:id` | Yes | Update session |
| DELETE | `/sessions/:id` | Yes | Cancel session |
| GET | `/sessions/stats/mentor/:id` | No | Mentor session analytics |

## Architecture

The backend follows strict separation of concerns:

```
Request
  -> CORS
  -> JSON Parser
  -> Session
  -> Route
  -> Validation (Zod)
  -> Controller (HTTP semantics)
  -> Service (business logic)
  -> Model (MongoDB)
```

- **Routes** map URLs to controllers and attach middleware.
- **Validation** uses Zod schemas to reject bad requests before they reach controllers.
- **Controllers** handle status codes and response shapes. They contain no business logic.
- **Services** encapsulate all business and data-access logic.
- **Models** define schemas, indexes, and instance methods.
- **Middlewares** handle cross-cutting concerns: authentication, role authorization, error handling.

Errors flow through a centralized global handler that distinguishes between operational errors (400, 401, 404) and programming errors (500), with detailed output in development and safe messages in production.

## Key Features

- Layered architecture with strict separation of concerns
- Versioned REST API (`/api/v1`)
- Advanced querying: full-text search, multi-field filtering, sorting, page-based and cursor-based pagination
- MongoDB aggregation pipelines for statistics and analytics
- Zod request validation with field-level error responses
- Global error handling with AppError class and async wrapper
- Cookie-based authentication with HttpOnly, Secure, SameSite flags
- Role-based access control (mentor, mentee, admin)
- Background jobs for automatic session cleanup (node-cron)
- Third-party API integration (currency conversion)
- Dynamic CORS configuration for cross-origin requests
- Structured logging with Pino

## License

MIT