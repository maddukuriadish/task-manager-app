# Task Manager Frontend

React frontend for Task Manager application.

## Tech Stack

- React
- Vite
- React Router
- Axios
- date-fns

## Prerequisites

- Node.js >= 18.0.0
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

3. Update `.env` with your backend API URL:
```
   VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
   npm run dev
```

App runs on http://localhost:5173

## Build for Production
```bash
npm run build
```

Output in `dist/` folder.

## Environment Variables

- `VITE_API_URL` - Backend API URL

## License

MIT