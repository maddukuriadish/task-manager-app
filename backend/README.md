# Task Manager API

Backend API for Task Manager application built with Node.js, Express, and PostgreSQL.

## Tech Stack

- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL
- npm >= 9.0.0

## Local Development Setup

1. Install dependencies:
```bash
   npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
   cp .env.example .env
```

3. Update `.env` with your database credentials

4. Start PostgreSQL (using Docker):
```bash
   docker-compose up -d
```

5. Run database migrations:
```bash
   psql -h localhost -U taskuser -d taskmanager -f database/schema.sql
```

6. Start development server:
```bash
   npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

## Environment Variables

See `.env.example` for required environment variables.

### Production Deployment

Required environment variables for production:
- `NODE_ENV=production`
- `PORT` (provided by hosting platform)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (strong random string)
- `FRONTEND_URL` (your frontend URL for CORS)

## License

MIT