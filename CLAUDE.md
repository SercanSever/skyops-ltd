# SkyOps Mission Control

## Project Description

Drone fleet management, mission scheduling, and maintenance tracking application for SkyOps Ltd.
An internal tool managing maintenance cycles, mission assignments, and fleet health for 150+ industrial drones.

## Architecture

**DDD + Clean Architecture** — Each domain module consists of 4 layers:

- **Domain**: Pure TypeScript. Business entities, value objects, enums, repository interfaces. Importing NestJS or TypeORM is FORBIDDEN.
- **Application**: Use cases (application services). Orchestrates domain entities. Each use case has a single responsibility (SRP).
- **Infrastructure**: TypeORM ORM entities, repository implementations, mappers, NestJS module definitions. Implements domain interfaces (DIP — Dependency Inversion Principle).
- **Presentation**: Controllers, request/response DTOs, class-validator decorators.

**Dependency Rule**: Inner layers MUST NOT depend on outer layers. Dependencies flow inward: Presentation → Infrastructure → Application → Domain. Domain depends on nothing.

## Monorepo Structure

```text
/backend   → NestJS + TypeORM + PostgreSQL
/frontend  → React + Vite + Tailwind + shadcn/ui + TanStack Query
```

## Tech Stack

| Layer | Technology |
| Backend | NestJS (TypeScript), TypeORM |
| Database | PostgreSQL 16 |
| Frontend | React 18+ (TypeScript), Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| HTTP Client | Built-in fetch API (DO NOT use Axios) |
| Testing | Jest (backend), Playwright (frontend e2e) |
| API | REST |
| Container | Docker Compose |
| CI/CD | GitHub Actions |

## Development Commands

### Backend

```bash
cd backend
npm install              # Install dependencies
npm run start:dev        # Development server (watch mode)
npm run build            # Production build
npm run test             # Run unit tests
npm run test:e2e         # Run integration tests
npm run test:cov         # Coverage report
npm run lint             # ESLint check
npm run format           # Format with Prettier
npm run migration:generate -- -n MigrationName  # Generate new migration
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration
npm run seed             # Load seed data
```

### Frontend

```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint check
npm run format           # Format with Prettier
npx playwright test      # Run E2E tests
```

### Docker

```bash
docker compose up -d             # Start all services
docker compose up -d postgres    # Start only PostgreSQL
docker compose down              # Stop services
docker compose down -v           # Stop services and delete volumes
docker compose logs -f backend   # Follow backend logs
```

## Environment Variables

Copy `.env.example` to `.env`. Never commit `.env` files.

## Critical Rules

1. **Database**: Use migrations. `synchronize: true` is FORBIDDEN. Create a migration for every schema change.
2. **Validation**: All API inputs must be validated with class-validator (presentation layer).
3. **Domain Logic**: Business rules live in domain entities, not in controllers or services (SRP + encapsulation).
4. **Type Safety**: TypeScript strict mode enabled. `any` type is FORBIDDEN (except with explicit justification).
5. **HTTP Client**: Use only built-in fetch API in the frontend. DO NOT use Axios or any other HTTP library.
6. **Auto-sync**: TypeORM `synchronize` must be `false`. Always use migrations.
7. **Dependency Inversion**: Domain and application layers depend on abstractions (interfaces), not concrete implementations (DIP).
8. **Single Responsibility**: Each use case handles exactly one business operation. Each entity encapsulates its own business rules.

## Git Workflow

- `main` branch: production-ready code
- Feature branches: `feature/drone-registry`, `feature/mission-management`, etc.
- Commit format: `type(scope): description` (feat, fix, refactor, test, docs, chore)
- Each feature is developed in a separate branch and merged to main via PR
