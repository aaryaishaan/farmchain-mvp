
# FarmChain — MVP (Web App)

## What is FarmChain?
FarmChain is a web-first MVP to trace agricultural produce from farm → consumer. This repo contains a React frontend, a Node/Express backend, and a mock blockchain service for demonstration purposes.

## Tech stack
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + TypeScript + Express
- ORM: Prisma + SQLite (dev-friendly)
- Auth: JWT + bcrypt
- QR: qrcode library
- Mock blockchain: internal Express router

## Prerequisites
- Node.js v18+ and npm (or pnpm/yarn)
- Git
- (Optional) Docker/Docker Compose — only for production container runs

# Quick local setup (dev)

### 1. Clone repo

git clone <repo-url> <br>
cd farmchain


## 2. Install dependencies

### from repo root
npm install <br>
cd frontend && npm install <br>
cd ../backend && npm install <br>


### 3. Environment variables
Create .env files in /backend:

\`\`\`env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace_with_a_secure_random_string"
PORT=4000
FRONTEND_URL=http://localhost:5173
\`\`\`

### 4. Run DB migrations & seed demo data

## backend
cd backend <br>
npx prisma migrate dev --name init <br>
npm run seed <br>


### 5. Start dev servers

### from repo root (recommended)
npm run dev
 ### Alternative: Start the frontend and backend sever individually 
  cd frontend && npm run dev <br>
  cd backend && npm run dev <br>
# which runs:
# frontend: http://localhost:5173
# backend:  http://localhost:4000
\`\`\`

## Demo accounts

- **Farmer**: farmer@demo.test / password: Password123
- **Distributor**: distributor@demo.test / password: Password123
- **Retailer**: retailer@demo.test / password: Password123
- **Consumer**: consumer@demo.test / password: Password123

(You can run `npm run seed` to recreate demo accounts and sample batches.)

## How to simulate blockchain verification

1. Click "Verify on-chain" on any batch event.
2. Backend calls /api/mock/tx and returns a txHash.
3. You may Poll GET /api/mock/tx/:txHash or visit developer admin page to force confirm.

## Common commands

- `npm run dev` — start frontend + backend for development
- `cd backend && npm run dev` — start backend only
- `cd frontend && npm run dev` — start frontend only
- `cd backend && npx prisma migrate dev --name init`
- `cd backend && npm run seed` — seed demo data
- `npm run test` — run unit tests (backend + frontend)

## Deploying (brief)

- **Frontend**: build with `cd frontend && npm run build` and host on Vercel/Netlify
- **Backend**: build and run as usual; ensure DATABASE_URL for production (Postgres recommended)

For demonstration you can serve the built frontend from Express static folder.

## Troubleshooting

- If QR scanner can't access camera, ensure your browser has camera permissions and you are on https or localhost.
- If database errors occur delete `backend/dev.db` and re-run migrations/seed.

## Project structure (high level)

- `/frontend` — Vite React app
- `/backend` — Express API, Prisma schema, seed scripts
- `/uploads` — image uploads (local storage for dev)

## Tests & Linting

- `npm run test` runs Jest tests
- `npm run lint` runs ESLint
