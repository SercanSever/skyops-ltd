# SkyOps Mission Control

Drone fleet management, mission scheduling, and maintenance tracking application for SkyOps Ltd. An internal tool managing maintenance cycles, mission assignments, and fleet health for 150+ industrial drones.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript), TypeORM |
| Database | PostgreSQL 16 |
| Frontend | React 19 (TypeScript), Vite, Tailwind CSS v4, shadcn/ui, TanStack Query |
| Architecture | DDD + Clean Architecture |
| Testing | Jest (backend), Playwright (frontend E2E) |
| Container | Docker Compose |
| CI/CD | GitHub Actions |

## Prerequisites

- **Node.js** v24.14.1 (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **Docker** and **Docker Compose** ([Docker Desktop](https://www.docker.com/products/docker-desktop/))
- **Git**

## Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/SercanSever/skyops-ltd.git
cd skyops-ltd
cp .env.example .env
```

Fill in `.env` with these development values:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=skyops
DATABASE_PASSWORD=skyops_dev
DATABASE_NAME=skyops_db
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
PGADMIN_DEFAULT_EMAIL=admin@skyops.dev
PGADMIN_DEFAULT_PASSWORD=admin
```

```bash
# 2. Use the correct Node.js version
nvm use

# 3. Start all services with Docker
docker compose up -d
```

After all containers are running, the application is available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| pgAdmin (DB GUI) | http://localhost:5050 |

---

## Manual Setup (Step by Step)

If you prefer running backend and frontend locally (recommended for development):

### 1. Start the Database

```bash
docker compose up -d postgres
```

Wait for the health check to pass:

```bash
docker compose ps    # Status should be "healthy"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create database tables
npm run migration:run

# Load seed data (25 drones, 55 missions, 35 maintenance logs)
npm run seed

# Start development server
npm run start:dev    # http://localhost:3000
```

Verify the backend is running:

```bash
curl http://localhost:3000/api/drones
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev          # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`, so the frontend communicates with the backend seamlessly.

### 4. Database GUI (pgAdmin) — Optional

```bash
docker compose up -d pgadmin    # http://localhost:5050
```

**Login credentials:**
- Email: `admin@skyops.dev`
- Password: `admin`

**Adding the database server in pgAdmin:**

1. Right-click "Servers" > "Register" > "Server"
2. **General** tab: Name = `SkyOps Dev`
3. **Connection** tab:
   - Host: `postgres` (not `localhost` — this is the Docker network name)
   - Port: `5432`
   - Username: `skyops`
   - Password: `skyops_dev`
4. Click "Save"

---

## API Endpoints

### Drones

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/drones` | Create a new drone |
| GET | `/api/drones` | List drones (paginated, filterable by status/model) |
| GET | `/api/drones/:id` | Get drone details |
| PATCH | `/api/drones/:id` | Update drone |
| DELETE | `/api/drones/:id` | Delete drone |
| PATCH | `/api/drones/:id/retire` | Retire drone |

### Missions

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/missions` | Create a mission |
| GET | `/api/missions` | List missions (paginated, filterable by status/droneId/date) |
| GET | `/api/missions/:id` | Get mission details |
| PATCH | `/api/missions/:id/transition` | Transition mission state |

### Maintenance Logs

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/maintenance-logs` | Create maintenance log |
| GET | `/api/maintenance-logs` | List logs (paginated, filterable) |
| GET | `/api/maintenance-logs/:id` | Get log details |
| PATCH | `/api/maintenance-logs/:id/complete` | Complete maintenance |

### Fleet Health

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/fleet-health` | Fleet health dashboard report |

---

## Running Tests

### Backend

```bash
cd backend

# Unit tests (94 tests)
npm run test

# Integration tests (real database)
npm run test:e2e

# Coverage report
npm run test:cov

# Lint check
npm run lint
```

### Frontend

```bash
cd frontend

# Lint check
npm run lint

# Build check (TypeScript + Vite)
npm run build
```

---

## Seed Data

The seed script populates the database with realistic test data:

```bash
cd backend && npm run seed
```

| Table | Count | Details |
|-------|-------|---------|
| Drones | 25 | 12 AVAILABLE, 5 IN_MISSION, 4 MAINTENANCE, 4 RETIRED |
| Missions | 55 | 25 COMPLETED, 15 PLANNED, 5 PRE_FLIGHT_CHECK, 5 IN_PROGRESS, 5 ABORTED |
| Maintenance Logs | 35 | All 5 types, various technicians and dates |

The script is idempotent — safe to re-run (truncates and re-inserts).

---

## Project Architecture

```
DDD + Clean Architecture — 4 layers per domain module

┌─────────────────────────────────┐
│         Presentation            │  Controllers, Request/Response DTOs
├─────────────────────────────────┤
│         Infrastructure          │  ORM Entities, Repository Implementations
├─────────────────────────────────┤
│         Application             │  Use Cases (one business operation each)
├─────────────────────────────────┤
│           Domain                │  Entities, Value Objects, Repository Interfaces
└─────────────────────────────────┘

Dependencies flow inward only. Domain layer is pure TypeScript.
```

```
skyops-ltd/
├── backend/                 # NestJS + TypeORM + PostgreSQL
│   └── src/modules/
│       ├── drone/           # Drone CRUD + business logic
│       ├── mission/         # Mission lifecycle + state machine
│       ├── maintenance/     # Maintenance tracking + side effects
│       └── fleet-health/    # Fleet health dashboard query
├── frontend/                # React + Vite + Tailwind + shadcn/ui
│   └── src/
│       ├── api/             # fetch wrapper + endpoint functions
│       ├── hooks/           # TanStack Query hooks
│       ├── pages/           # Route-level page components
│       └── components/      # UI components + layout
├── docker-compose.yml       # PostgreSQL + pgAdmin + Backend + Frontend
└── .github/workflows/       # CI/CD pipelines
```

---

## Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PostgreSQL | `skyops-postgres` | 5432 | Database |
| pgAdmin | `skyops-pgadmin` | 5050 | Database GUI |
| Backend | `skyops-backend` | 3000 | NestJS API |
| Frontend | `skyops-frontend` | 5173 | React dev server |

```bash
# Start all services
docker compose up -d

# Start only database
docker compose up -d postgres

# Start database + GUI
docker compose up -d postgres pgadmin

# Stop all services
docker compose down

# Stop and remove all data (volumes)
docker compose down -v

# View logs
docker compose logs -f backend
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | Database username | — |
| `DATABASE_PASSWORD` | Database password | — |
| `DATABASE_NAME` | Database name | — |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | — |
| `VITE_API_URL` | Frontend API base URL | `/api` |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email | — |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password | — |
