# SkyOps Mission Control - Developer Guide

> This document is an instructional guide for the developer working on the project. It should be updated whenever a new feature, migration, or architectural decision is added.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [PostgreSQL](#2-postgresql)
3. [Docker & Docker Compose](#3-docker--docker-compose)
4. [NestJS Fundamentals](#4-nestjs-fundamentals)
5. [TypeORM](#5-typeorm)
6. [DDD + Clean Architecture](#6-ddd--clean-architecture)
7. [React + TanStack Query](#7-react--tanstack-query)
8. [Tailwind + shadcn/ui](#8-tailwind--shadcnui)
9. [API Endpoint List](#9-api-endpoint-list)
10. [Design Decisions](#10-design-decisions)
11. [Adding a New Feature Guide](#11-adding-a-new-feature-guide)
12. [Scaling Strategies](#12-scaling-strategies)
13. [Git Workflow](#13-git-workflow)
14. [Writing Tests](#14-writing-tests)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Project Setup

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([download](https://www.docker.com/products/docker-desktop/))
- **Git** ([download](https://git-scm.com/))

### Quick Start

```bash
# 1. Clone the repo
git clone <https://github.com/SercanSever/skyops-ltd>
cd skyops-ltd

# 2. Set up environment variables
cp .env.example .env

# 3. Start PostgreSQL with Docker
docker compose up -d postgres

# 4. Backend setup
cd backend
npm install
npm run migration:run    # Create database tables
npm run seed             # Load test data
npm run start:dev        # http://localhost:3000

# 5. Frontend setup (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### Alternative: Start All Services with Docker

```bash
docker compose up -d     # PostgreSQL + Backend + Frontend all at once
```

---

## 2. PostgreSQL

### What is PostgreSQL?

An open-source relational database management system. In this project, we use it to store drone, mission, and maintenance data.

### Running with Docker (Recommended)

```bash
# Start
docker compose up -d postgres

# Stop
docker compose stop postgres

# View logs
docker compose logs -f postgres

# Remove completely (INCLUDING DATA)
docker compose down -v
```

### Connecting with psql

```bash
# Connect to psql inside the Docker container
docker exec -it skyops-postgres psql -U skyops -d skyops_db

# Or with local psql
psql -h localhost -p 5432 -U skyops -d skyops_db
```

### Essential psql Commands

```sql
-- List tables
\dt

-- View table structure
\d drones

-- Query records
SELECT * FROM drones LIMIT 5;

-- Count records
SELECT COUNT(*) FROM missions;

-- Group by status
SELECT status, COUNT(*) FROM drones GROUP BY status;

-- Exit
\q
```

### Database URL Format

```text
postgresql://user:password@host:port/database
postgresql://<DATABASE_USER>:<DATABASE_PASSWORD>@<DATABASE_HOST>:<DATABASE_PORT>/<DATABASE_NAME>
```

---

## 3. Docker & Docker Compose

### What is Docker?

Docker packages and runs applications inside containers. Container = an isolated environment. It eliminates the "it works on my machine" problem.

### What is Docker Compose?

Defines and manages multiple containers with a single file (`docker-compose.yml`).

### Docker Compose Services in This Project

| Service | Port | Description |
| `postgres` | 5432 | PostgreSQL database |
| `backend` | 3000 | NestJS API |
| `frontend` | 5173 | React dev server |

### Essential Commands

```bash
# Start all services (in background)
docker compose up -d

# Start only PostgreSQL
docker compose up -d postgres

# Stop services
docker compose stop

# Stop services and remove containers
docker compose down

# Stop services, remove containers AND data
docker compose down -v

# Watch logs for a service
docker compose logs -f backend

# Connect to a container with shell
docker exec -it skyops-backend sh

# View running containers
docker compose ps

# Restart a service
docker compose restart backend

# Rebuild (if Dockerfile changed)
docker compose up -d --build
```

### What is a Volume?

The `postgres_data` volume ensures PostgreSQL data persists even if the container is deleted. You can remove it with `docker compose down -v`.

---

## 4. NestJS Fundamentals

### What is NestJS?

A backend framework written in TypeScript, inspired by Angular. It provides a modular structure, dependency injection, and decorator-based architecture.

### Module System

In NestJS, everything lives inside a module. A module = a unit that groups related controllers, services, and providers together.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([DroneOrmEntity])], // Dependent modules
  controllers: [DroneController],                        // HTTP endpoints
  providers: [                                           // Services and DI
    CreateDroneUseCase,
    { provide: 'IDroneRepository', useClass: DroneRepository },
  ],
  exports: ['IDroneRepository'],                         // Providers exposed externally
})
export class DroneModule {}
```

### Dependency Injection (DI)

NestJS automatically injects dependencies. You declare them in the constructor, and NestJS provides them:

```typescript
export class CreateDroneUseCase {
  constructor(
    @Inject('IDroneRepository')
    private readonly droneRepository: IDroneRepository,
  ) {}
}
```

**Why DI?** When writing tests, you can inject a mock repository instead of a real database. This follows the **Dependency Inversion Principle (DIP)** -- depend on abstractions, not concretions.

### Controller to Service Flow

```text
HTTP Request → Controller (validation) → Use Case (business logic) → Repository (DB) → Response
```

### Pipes

Used for data transformation and validation:

```typescript
// Global ValidationPipe (in main.ts)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // Strip fields not in the DTO
  forbidNonWhitelisted: true, // Throw error if unknown fields are present
  transform: true,          // Automatic type conversion
}));
```

### Filters (Exception Handling)

Catches errors and returns a consistent response format:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Error → { statusCode, message, error, details }
  }
}
```

### Interceptors

Transforms request/response (logging, caching, etc.):

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('Before...');
    return next.handle().pipe(tap(() => console.log('After...')));
  }
}
```

### Lifecycle

```text
Request → Middleware → Guard → Interceptor (before) → Pipe → Controller → Service → Interceptor (after) → Filter (if error) → Response
```

---

## 5. TypeORM

### What is TypeORM?

An ORM (Object-Relational Mapping) written in TypeScript. It maps TypeScript classes to database tables.

### Entity Definition (ORM Entity)

```typescript
@Entity('drones')
export class DroneOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'serial_number', unique: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: DroneStatus, default: DroneStatus.AVAILABLE })
  status: DroneStatus;

  @Column({ name: 'total_flight_hours', type: 'decimal', default: 0 })
  totalFlightHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MissionOrmEntity, (mission) => mission.drone)
  missions: MissionOrmEntity[];
}
```

### Data Source Configuration

TypeORM needs two configuration points:

1. **`src/database/data-source.ts`** — Used by the TypeORM CLI (migrations). Loads `.env` from the monorepo root using `dotenv`.
2. **`src/config/database.config.ts`** — Used by NestJS at runtime. Registered as a namespaced config (`'database'`) via `@nestjs/config`.

Both share the same connection parameters but are loaded differently. The data source uses `dotenv` directly (for CLI), while the NestJS config uses `ConfigModule.forRoot()`.

**Why two files?** The TypeORM CLI runs outside of NestJS (it's a standalone Node.js script), so it can't use NestJS's `ConfigModule`. The data source file bridges this gap.

### ts-node and Module Resolution

The project uses `"module": "nodenext"` in `tsconfig.json` for NestJS compatibility. However, the TypeORM CLI runs via `ts-node` which needs CommonJS. A `ts-node` override in `tsconfig.json` handles this:

```json
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

This means migration scripts use `ts-node -r tsconfig-paths/register` to ensure correct module resolution.

### Migration Commands

```bash
# Generate a migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName
# This creates a timestamped file under src/database/migrations/

# Run migrations (creates tables)
npm run migration:run

# Revert the last migration
npm run migration:revert

# View migration status
npm run migration:show
```

**IMPORTANT**: DO NOT USE `synchronize: true`. Always write migrations. Otherwise, data loss may occur in production.

### Database Schema

#### Enum Types (PostgreSQL native)

| Enum Name | Values |
|---|---|
| `drone_status` | AVAILABLE, IN_MISSION, MAINTENANCE, RETIRED |
| `drone_model` | PHANTOM_4, MATRICE_300, MAVIC_3_ENTERPRISE |
| `mission_status` | PLANNED, PRE_FLIGHT_CHECK, IN_PROGRESS, COMPLETED, ABORTED |
| `mission_type` | WIND_TURBINE_INSPECTION, SOLAR_PANEL_SURVEY, POWER_LINE_PATROL |
| `maintenance_type` | ROUTINE_CHECK, BATTERY_REPLACEMENT, MOTOR_REPAIR, FIRMWARE_UPDATE, FULL_OVERHAUL |

#### Tables

**`drones`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| serial_number | VARCHAR | NOT NULL, UNIQUE INDEX |
| model | drone_model (enum) | NOT NULL |
| status | drone_status (enum) | NOT NULL, DEFAULT 'AVAILABLE', INDEX |
| total_flight_hours | DECIMAL(10,2) | NOT NULL, DEFAULT 0 |
| last_maintenance_date | TIMESTAMPTZ | nullable |
| next_maintenance_due_date | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**`missions`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| name | VARCHAR | NOT NULL |
| type | mission_type (enum) | NOT NULL |
| drone_id | UUID | NOT NULL, FK → drones(id) ON DELETE RESTRICT, INDEX |
| pilot_name | VARCHAR | NOT NULL |
| site_location | VARCHAR | NOT NULL |
| status | mission_status (enum) | NOT NULL, DEFAULT 'PLANNED', INDEX |
| planned_start_time | TIMESTAMPTZ | NOT NULL, composite INDEX with planned_end_time |
| planned_end_time | TIMESTAMPTZ | NOT NULL |
| actual_start_time | TIMESTAMPTZ | nullable |
| actual_end_time | TIMESTAMPTZ | nullable |
| flight_hours | DECIMAL(10,2) | nullable |
| abort_reason | TEXT | nullable |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**`maintenance_logs`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| drone_id | UUID | NOT NULL, FK → drones(id) ON DELETE RESTRICT, INDEX |
| type | maintenance_type (enum) | NOT NULL |
| technician_name | VARCHAR | NOT NULL |
| notes | TEXT | nullable |
| date_performed | TIMESTAMPTZ | NOT NULL |
| flight_hours_at_maintenance | DECIMAL(10,2) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### Key Indexes

- `serial_number` on drones — UNIQUE (prevents duplicate drone registration)
- `status` on drones and missions — for filtering queries
- `drone_id` on missions and maintenance_logs — FK index for join performance
- `(planned_start_time, planned_end_time)` on missions — composite index for overlap detection queries

#### Foreign Key Rules

All foreign keys use `ON DELETE RESTRICT` — a drone cannot be deleted if it has related missions or maintenance logs. This prevents accidental data loss.

### QueryBuilder Usage

```typescript
// Overlap detection example
const overlap = await this.repository
  .createQueryBuilder('mission')
  .where('mission.droneId = :droneId', { droneId })
  .andWhere('mission.status IN (:...statuses)', { statuses: ['PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS'] })
  .andWhere('mission.plannedStartTime < :endTime', { endTime: newEndTime })
  .andWhere('mission.plannedEndTime > :startTime', { startTime: newStartTime })
  .getOne();
```

### Relations

```typescript
// OneToMany: A drone can have multiple missions
@OneToMany(() => MissionOrmEntity, (mission) => mission.drone)
missions: MissionOrmEntity[];

// ManyToOne: A mission belongs to a single drone
@ManyToOne(() => DroneOrmEntity, (drone) => drone.missions)
@JoinColumn({ name: 'drone_id' })
drone: DroneOrmEntity;
```

---

## 6. DDD + Clean Architecture

### Why Did We Choose This Architecture?

1. **Testability**: Domain logic is pure TypeScript with no framework dependency -- easy to test. Aligns with **SRP** (Single Responsibility Principle): each layer has one reason to change.
2. **Scalability**: Bounded contexts make the transition to microservices straightforward. Follows **OCP** (Open/Closed Principle): extend behavior by adding new modules without modifying existing ones.
3. **Maintainability**: Business logic lives in one place -- changes are easy. Supports **ISP** (Interface Segregation Principle): each layer exposes only the interfaces its consumers need.
4. **Framework Independence**: If you switch from NestJS to Express, your domain logic remains unchanged. This embodies **DIP** (Dependency Inversion Principle): high-level modules do not depend on low-level modules; both depend on abstractions.

### 4 Layers

```text
┌─────────────────────────────────┐
│         Presentation            │  Controller, Request/Response DTO
│  (NestJS controllers)           │  HTTP → Domain conversion
├─────────────────────────────────┤
│         Infrastructure          │  ORM Entity, Repository Impl, Module
│  (TypeORM, NestJS Module)       │  Concrete implementations of Domain interfaces
├─────────────────────────────────┤
│         Application             │  Use Cases (CreateDrone, CompleteMission)
│  (Orchestration)                │  Workflow using domain entities
├─────────────────────────────────┤
│           Domain                │  Entity, Value Object, Enum, Repository Interface
│  (Pure TypeScript)              │  Business rules live here
└─────────────────────────────────┘
```

### Dependency Rule

**Inner layers must NEVER depend on outer layers.** This is a direct application of the **Dependency Inversion Principle (DIP)**.

- Domain -- depends on nothing (pure TypeScript)
- Application -- depends only on Domain
- Infrastructure -- depends on Domain + Application
- Presentation -- depends on Infrastructure (through NestJS modules)

### Domain Entity vs ORM Entity

| | Domain Entity | ORM Entity |
| Location | `domain/entities/` | `infrastructure/persistence/` |
| Dependency | Pure TypeScript | TypeORM decorators |
| Responsibility | Business logic, validation | Database mapping |
| Example | `drone.entity.ts` | `drone.orm-entity.ts` |

Separating these two follows **SRP**: the Domain Entity is responsible for business rules, while the ORM Entity is responsible for database mapping.

### What is a Value Object?

An object without identity, defined by its value. Two SerialNumber instances with the same value are equal.

```typescript
export class SerialNumber {
  private static readonly FORMAT = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  private readonly value: string;

  private constructor(value: string) { this.value = value; }

  static create(value: string): SerialNumber {
    if (!SerialNumber.FORMAT.test(value)) {
      throw new Error('Invalid serial number format. Expected: SKY-XXXX-XXXX');
    }
    return new SerialNumber(value);
  }

  getValue(): string { return this.value; }
  equals(other: SerialNumber): boolean { return this.value === other.value; }
}
```

### Domain Entity Construction Pattern

Domain entities use **private constructor + static factories**:

- `static create(props)` — new entity: generates UUID, sets defaults, validates
- `static reconstitute(props)` — loading from DB: accepts all fields, skips validation

```typescript
export class Drone {
  private readonly props: DroneProps;
  private constructor(props: DroneProps) { this.props = props; }

  static create(props: CreateDroneProps): Drone {
    // Validates, generates UUID, sets defaults
  }

  static reconstitute(props: DroneProps): Drone {
    // Direct construction, no validation (data already valid from DB)
    return new Drone(props);
  }

  // Properties exposed via getters only
  get id(): string { return this.props.id; }

  // Business methods mutate internal state
  addFlightHours(hours: number): void { /* validation + mutation */ }
}
```

### Mission State Machine

The Mission entity encapsulates its state machine. The entity validates transitions, the use case orchestrates side effects:

```text
PLANNED ──→ PRE_FLIGHT_CHECK ──→ IN_PROGRESS ──→ COMPLETED
   |              |                    |
   v              v                    v
ABORTED        ABORTED             ABORTED
```

Key transition rules:
- PRE_FLIGHT_CHECK → IN_PROGRESS: sets `actualStartTime`
- IN_PROGRESS → COMPLETED: requires `flightHours > 0`, sets `actualEndTime`
- Any → ABORTED: `abortReason` is optional, sets `actualEndTime`
- COMPLETED and ABORTED are terminal states

### Mapper

Handles the conversion between ORM Entity and Domain Entity:

```typescript
export class DroneMapper {
  static toDomain(ormEntity: DroneOrmEntity): Drone {
    return new Drone({
      id: ormEntity.id,
      serialNumber: SerialNumber.create(ormEntity.serialNumber),
      // ...
    });
  }

  static toOrm(domain: Drone): DroneOrmEntity {
    const orm = new DroneOrmEntity();
    orm.id = domain.id;
    orm.serialNumber = domain.serialNumber.getValue();
    // ...
    return orm;
  }
}
```

---

## 7. React + TanStack Query

### What is TanStack Query (React Query)?

A server state management library. It caches data from APIs, automatically refetches, and manages loading/error states.

### Why TanStack Query?

- No need for a global state store like Redux/Zustand (client state is minimal in this project)
- Automatic caching and cache invalidation
- Background refetching
- Optimistic updates support

### QueryClient Configuration

Global defaults are set in `App.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // Data considered fresh for 30 seconds
      retry: 1,          // Retry failed requests once
    },
  },
});
```

### Query Key Strategy

Query keys follow a consistent naming convention across all hooks:

| Hook | Query Key | Description |
|---|---|---|
| `useDrones(params)` | `["drones", params]` | List with filters/pagination |
| `useDrone(id)` | `["drones", id]` | Single drone |
| `useMissions(params)` | `["missions", params]` | List with filters/pagination |
| `useMission(id)` | `["missions", id]` | Single mission |
| `useMaintenanceLogs(params)` | `["maintenance-logs", params]` | List with filters/pagination |
| `useMaintenanceLog(id)` | `["maintenance-logs", id]` | Single maintenance record |
| `useFleetHealth()` | `["fleet-health"]` | Fleet health report (refetchInterval: 60s) |

### Cross-Resource Cache Invalidation

Mutations invalidate not just their own resource, but also dependent resources:

```typescript
// Example: useTransitionMission invalidates 3 resources
// because a mission transition can change drone status and fleet health
const useTransitionMission = () => useMutation({
  mutationFn: transitionMission,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['missions'] });
    queryClient.invalidateQueries({ queryKey: ['drones'] });       // drone status may change
    queryClient.invalidateQueries({ queryKey: ['fleet-health'] }); // fleet stats may change
  },
});
```

**Invalidation map:**

| Mutation | Invalidates |
|---|---|
| Create/retire/delete drone | `drones`, `fleet-health` |
| Update drone | `drones` |
| Create mission | `missions`, `fleet-health` |
| Transition mission | `missions`, `drones`, `fleet-health` |
| Create maintenance log | `maintenance-logs`, `drones`, `fleet-health` |
| Complete maintenance | `maintenance-logs`, `drones`, `fleet-health` |

### Basic Usage

```typescript
// Fetching data (GET)
const { data, isLoading, error } = useQuery({
  queryKey: ['drones', page, filters],
  queryFn: () => fetchDrones({ page, ...filters }),
});

// Mutating data (POST, PUT, DELETE)
const mutation = useMutation({
  mutationFn: createDrone,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['drones'] });
  },
});
```

### Built-in Fetch API

In this project, we use the browser's native `fetch` API instead of Axios. The wrapper is in `src/api/client.ts`:

```typescript
// Generic typed helpers
apiGet<T>(path, params?)    // GET with query params (undefined values filtered)
apiPost<T>(path, body?)     // POST with JSON body
apiPatch<T>(path, body?)    // PATCH with JSON body
apiDelete<T>(path)          // DELETE (returns undefined for 204)
```

Custom `ApiError` class carries `statusCode`, `error`, and `details` from the backend error response format.

---

## 8. Tailwind + shadcn/ui

### Tailwind CSS

A utility-first CSS framework. You write styles directly with classes:

```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold">Fleet Overview</h2>
</div>
```

### shadcn/ui

A copy-and-customize component library. It is NOT an npm package -- it copies the files into your project.

```bash
# Add a component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### cn() Utility

For conditionally merging Tailwind classes:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn('p-4', isActive && 'bg-blue-500', className)} />
```

### Components Used in This Project

| Component | Usage |
|---|---|
| `badge` | Status labels (drone status, mission status) |
| `button` | Actions, form submit, state transitions |
| `card` | Dashboard cards, detail sections |
| `dialog` | Create/edit forms, confirmation modals |
| `input` | Text fields in forms |
| `select` | Dropdowns (model, type, status filters) |
| `separator` | Visual dividers |
| `sheet` | Side panel / mobile navigation |
| `table` | Data tables (drones, missions, maintenance) |

### Responsive Design

The layout uses a sidebar navigation on desktop and a sheet-based mobile menu. Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) control visibility and layout shifts.

---

## 9. API Endpoint List

> This section should be updated whenever a new endpoint is added.

### Drones

| Method | URL | Description |
| GET | `/api/drones` | List all drones (paginated) |
| GET | `/api/drones/:id` | Single drone details |
| POST | `/api/drones` | Create a new drone |
| PATCH | `/api/drones/:id` | Update a drone |
| DELETE | `/api/drones/:id` | Delete a drone |
| PATCH | `/api/drones/:id/retire` | Retire a drone |

### Missions

| Method | URL | Description |
| GET | `/api/missions` | List all missions (paginated, filterable) |
| GET | `/api/missions/:id` | Single mission details |
| POST | `/api/missions` | Create a new mission |
| PATCH | `/api/missions/:id/transition` | Mission state transition |

### Maintenance Logs

| Method | URL | Description |
| GET | `/api/maintenance-logs` | List all maintenance records (paginated) |
| GET | `/api/maintenance-logs/:id` | Single maintenance record details |
| POST | `/api/maintenance-logs` | Create a new maintenance record |
| PATCH | `/api/maintenance-logs/:id/complete` | Complete maintenance (drone → AVAILABLE) |

### Fleet Health

| Method | URL | Description |
| GET | `/api/fleet-health` | Fleet health report |

### Example Request/Response (Drones)

```bash
# Create a drone
curl -X POST http://localhost:3000/api/drones \
  -H "Content-Type: application/json" \
  -d '{"serialNumber": "SKY-AB12-CD34", "model": "PHANTOM_4"}'
# → 201 { id, serialNumber, model, status: "AVAILABLE", ... }

# List drones (paginated + filtered)
curl "http://localhost:3000/api/drones?page=1&limit=10&status=AVAILABLE"
# → 200 { data: [...], meta: { page, limit, total, totalPages } }

# Get single drone
curl http://localhost:3000/api/drones/{id}
# → 200 { id, serialNumber, model, status, totalFlightHours, ... }

# Update drone
curl -X PATCH http://localhost:3000/api/drones/{id} \
  -H "Content-Type: application/json" \
  -d '{"model": "MATRICE_300"}'
# → 200 { ... updated drone }

# Retire drone
curl -X PATCH http://localhost:3000/api/drones/{id}/retire
# → 200 { ... status: "RETIRED" }

# Delete drone
curl -X DELETE http://localhost:3000/api/drones/{id}
# → 204 (no content)

# Error examples
# Invalid serial → 400 { message: [...], error: "Bad Request" }
# Duplicate serial → 409 { message, error: "Business Rule Violation", details }
# Not found → 404 { message, error: "Business Rule Violation" }
```

### Example Request/Response (Missions)

```bash
# Create a mission (drone must exist and be AVAILABLE)
curl -X POST http://localhost:3000/api/missions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wind Farm Inspection",
    "type": "WIND_TURBINE_INSPECTION",
    "droneId": "{droneId}",
    "pilotName": "John Doe",
    "siteLocation": "Wind Farm Alpha",
    "plannedStartTime": "2027-01-15T10:00:00Z",
    "plannedEndTime": "2027-01-15T14:00:00Z"
  }'
# → 201 { id, name, type, droneId, status: "PLANNED", ... }

# List missions (filtered)
curl "http://localhost:3000/api/missions?status=PLANNED&droneId={droneId}&page=1&limit=10"
# → 200 { data: [...], meta: { page, limit, total, totalPages } }

# State transitions
curl -X PATCH http://localhost:3000/api/missions/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{"status": "PRE_FLIGHT_CHECK"}'
# → 200 { status: "PRE_FLIGHT_CHECK" }

curl -X PATCH http://localhost:3000/api/missions/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
# → 200 { status: "IN_PROGRESS", actualStartTime: "..." }
# Side effect: drone status → IN_MISSION

curl -X PATCH http://localhost:3000/api/missions/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED", "flightHours": 2.5}'
# → 200 { status: "COMPLETED", flightHours: 2.5, actualEndTime: "..." }
# Side effects: drone totalFlightHours += 2.5, drone → AVAILABLE, nextMaintenanceDueDate recalculated

# Abort (reason optional)
curl -X PATCH http://localhost:3000/api/missions/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{"status": "ABORTED", "abortReason": "Weather conditions"}'
# → 200 { status: "ABORTED", abortReason: "Weather conditions" }

# Error examples
# Past scheduling → 422 "Planned start time must be in the future"
# Overlapping mission → 409 "Mission time overlaps..."
# Invalid transition → 422 "Invalid state transition: ABORTED → IN_PROGRESS"
# Drone not available → 422 "Drone is not available for missions"
```

### Example Request/Response (Maintenance)

```bash
# Create maintenance log (drone → MAINTENANCE)
curl -X POST http://localhost:3000/api/maintenance-logs \
  -H "Content-Type: application/json" \
  -d '{"droneId": "{id}", "type": "ROUTINE_CHECK", "technicianName": "Alex Smith", "notes": "90-day inspection", "datePerformed": "2026-04-01T10:00:00Z", "flightHoursAtMaintenance": 25}'
# → 201, drone status → MAINTENANCE, lastMaintenanceDate + nextMaintenanceDueDate updated

# Complete maintenance (drone → AVAILABLE)
curl -X PATCH http://localhost:3000/api/maintenance-logs/{id}/complete
# → 200, drone status → AVAILABLE

# Error: flight hours mismatch (±1 hour tolerance)
# → 422 "Flight hours at maintenance is inconsistent..."
# Error: drone IN_MISSION → 422 "Cannot start maintenance on a drone currently on a mission"
```

---

## 10. Design Decisions

### Decision 1: DDD + Clean Architecture

- **What**: 4-layer architecture, domain logic independent of the framework
- **Why**: Strong position for post-interview scaling discussions. Easy transition to microservices or framework changes. Follows **SRP** and **DIP** -- each layer has a single responsibility and depends on abstractions rather than concretions.
- **Alternative**: Standard NestJS structure (controller -> service -> repository). Simpler but hard to scale.
- **Trade-off**: More files and boilerplate, but better separation of concerns.

### Decision 2: Built-in Fetch API (instead of Axios)

- **What**: The browser's native fetch API
- **Why**: No additional dependency needed. Modern browsers have full support.
- **Alternative**: Axios - has interceptors and automatic JSON parsing.
- **Trade-off**: We give up some Axios conveniences (interceptors, automatic transforms), but bundle size decreases and we use the native API.

### Decision 3: TanStack Query (instead of Redux/Zustand)

- **What**: A specialized library for server state management
- **Why**: Client-side state is minimal in this project. Drone lists and missions always come from the server.
- **Alternative**: Redux Toolkit Query, Zustand + fetch
- **Trade-off**: If global client state is needed, a separate solution is required (not needed for this project).

### Decision 4: Domain Entity ≠ ORM Entity

- **What**: Two separate entity classes + mapper
- **Why**: Domain logic should be independent of TypeORM decorators. No database needed when testing domain entities. This upholds **SRP** -- each entity class has a single reason to change -- and **DIP** -- domain code depends on abstractions, not ORM details.
- **Alternative**: Single entity (both TypeORM and business logic). Fewer files but high coupling.
- **Trade-off**: Mapper boilerplate exists, but domain purity is maintained.

### Decision 5: PostgreSQL Native Enum

- **What**: Enums as PostgreSQL enum types
- **Why**: Type safety at the database level. Invalid values cannot be inserted.
- **Alternative**: String column + application-level validation
- **Trade-off**: Enum changes in migrations are somewhat tedious, but data integrity is guaranteed.

---

## 11. Adding a New Feature Guide

Follow these steps when you want to add a new domain module:

### Step 1: Domain Layer

```bash
src/modules/new-module/domain/
├── entities/new-entity.entity.ts      # Business rules
├── enums/new-status.enum.ts           # Enums
├── repositories/new.repository.interface.ts  # Port (abstraction per DIP)
└── value-objects/                      # If applicable
```

### Step 2: Application Layer

```bash
src/modules/new-module/application/
├── use-cases/
│   ├── create-new.use-case.ts         # Each use case follows SRP
│   └── list-new.use-case.ts
└── dto/
    └── create-new.input.ts
```

### Step 3: Infrastructure Layer

```bash
src/modules/new-module/infrastructure/
├── persistence/
│   ├── new.orm-entity.ts              # TypeORM entity
│   ├── new.repository.ts             # Repository impl (implements Domain interface per DIP)
│   └── new.mapper.ts                 # Domain ↔ ORM
└── new.module.ts                     # NestJS module
```

### Step 4: Presentation Layer

```bash
src/modules/new-module/presentation/
├── new.controller.ts
└── dto/
    ├── create-new.request.dto.ts
    └── new.response.dto.ts
```

### Step 5: Migration

```bash
npm run migration:generate -- src/database/migrations/CreateNewTable
npm run migration:run
```

### Step 6: Register in the App Module

```typescript
// app.module.ts
@Module({
  imports: [..., NewModule],
})
```

### Step 7: Frontend

```bash
frontend/src/
├── api/new.ts                        # API functions
├── hooks/use-new.ts                  # TanStack Query hooks
├── types/new.types.ts                # TypeScript types
├── features/new/                     # Components
└── pages/NewPage.tsx                 # Route component
```

### Step 8: Test

- Domain entity unit test
- Use case unit test (mock repository)
- Controller integration test (optional)

### Step 9: Update This README

- Add to the API endpoint list
- Add to design decisions (if applicable)

---

## 12. Scaling Strategies

This project is currently a monolith. As it grows, the following strategies can be applied:

### Horizontal Scaling

- Run multiple backend instances (behind a load balancer)
- Stateless design (no sessions, JWT or token-based auth)
- Database connection pooling (pg-pool)

### CQRS (Command Query Responsibility Segregation)

- Separate Write (command) and Read (query) operations. This aligns with **ISP** -- read and write interfaces are segregated for their consumers.
- Write: Use cases -> domain entity -> repository
- Read: Direct SQL queries or views (no need to go through domain entities)
- Fleet Health Report is already a query service (the read side of CQRS)

### Event-Driven Architecture

- Domain events: `MissionCompleted`, `MaintenanceDue`, `DroneRetired`
- Loose coupling with an event bus. Follows **OCP** -- new event handlers can be added without modifying existing code.
- Notification system (email, Slack) triggered by events

### Transition to Microservices

Thanks to DDD + Clean Architecture, bounded contexts are already separate:

- `drone-service` -> Drone Registry
- `mission-service` -> Mission Management
- `maintenance-service` -> Maintenance Log
- Unified via an API Gateway
- Inter-service communication via event bus (RabbitMQ/Kafka)

### Caching (Redis)

- Fleet Health Report -> cache (TTL: 5 minutes)
- Drone list -> cache (invalidation on change)
- Session/token store (if auth is added)

### Database Optimization

- Read replica (for read-heavy operations)
- Partitioning (missions table by date)
- Materialized views (dashboard statistics)

---

## 13. Git Workflow

### Branch Strategy

```text
main                          # Production-ready code
├── feature/project-setup     # Project infrastructure
├── feature/drone-registry    # Drone CRUD
├── feature/mission-management# Mission lifecycle
├── feature/maintenance-log   # Maintenance CRUD
├── feature/fleet-health      # Fleet health endpoint
├── feature/dashboard         # Frontend
├── feature/seed-data         # Seed script
└── feature/e2e-tests         # Tests
```

### Creating a New Feature Branch

```bash
# New branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Work and commit
git add .
git commit -m "feat(scope): description"

# Push and create PR
git push -u origin feature/new-feature
# Create PR on GitHub
```

### Commit Message Format

```text
type(scope): description

Types:
  feat     → New feature
  fix      → Bug fix
  refactor → Code restructuring
  test     → Adding/fixing tests
  docs     → Documentation changes
  chore    → Build, CI, dependency

Scopes:
  drone, mission, maintenance  → Backend domain
  dashboard, ui               → Frontend
  docker, ci                  → Infrastructure

Examples:
  feat(drone): add serial number validation
  fix(mission): prevent past date scheduling
  test(maintenance): add flight hours consistency test
  chore(ci): add backend lint job
```

### PR Process

1. Develop on a feature branch
2. Run tests: `npm run test && npm run lint`
3. Push: `git push -u origin feature/xxx`
4. Create PR on GitHub (base: main)
5. Wait for the CI pipeline to pass
6. Merge into main

---

## 14. Writing Tests

### Unit Test (Domain Entity)

```typescript
describe('SerialNumber', () => {
  it('should create valid serial number', () => {
    const sn = SerialNumber.create('SKY-AB12-CD34');
    expect(sn.getValue()).toBe('SKY-AB12-CD34');
  });

  it('should reject invalid format', () => {
    expect(() => SerialNumber.create('INVALID')).toThrow();
    expect(() => SerialNumber.create('SKY-xxxx-xxxx')).toThrow();
  });
});
```

### Unit Test (Use Case)

```typescript
describe('CreateDroneUseCase', () => {
  let useCase: CreateDroneUseCase;
  let mockRepository: jest.Mocked<IDroneRepository>;

  beforeEach(() => {
    mockRepository = {
      findBySerialNumber: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new CreateDroneUseCase(mockRepository);
  });

  it('should create drone with valid data', async () => {
    mockRepository.findBySerialNumber.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue(expectedDrone);

    const result = await useCase.execute(validInput);
    expect(result).toBeDefined();
  });
});
```

### Integration Test (E2E)

Integration tests use a **real database** and test the full HTTP request/response cycle through all layers. Located in `backend/test/`.

**How it works:**

1. NestJS Test Module imports the full `AppModule` (all modules, real DB)
2. Supertest sends HTTP requests to the app
3. Assertions verify response bodies and cross-entity side effects
4. Test data is cleaned up in `afterAll`

```typescript
describe('Mission Lifecycle (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Full app with all modules and real database
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  it('should complete full mission lifecycle', async () => {
    // 1. Create drone → AVAILABLE
    const droneRes = await request(app.getHttpServer())
      .post('/api/drones')
      .send({ serialNumber: 'SKY-E2E1-TE5T', model: 'PHANTOM_4' })
      .expect(201);

    // 2. Plan mission → PLANNED
    // 3. PLANNED → PRE_FLIGHT_CHECK (drone still AVAILABLE)
    // 4. PRE_FLIGHT_CHECK → IN_PROGRESS (drone → IN_MISSION)
    // 5. IN_PROGRESS → COMPLETED (flightHours: 2.5, drone → AVAILABLE)
    // 6. Verify: drone.totalFlightHours = 2.5, nextMaintenanceDueDate set
  });

  afterAll(async () => {
    // Clean up test-created records
    await dataSource.query('DELETE FROM missions WHERE id = $1', [missionId]);
    await dataSource.query('DELETE FROM drones WHERE id = $1', [droneId]);
    await app.close();
  });
});
```

**Key points:**
- **Global setup must match `main.ts`**: `setGlobalPrefix('api')`, `ValidationPipe`, `AllExceptionsFilter`
- **Cleanup is essential**: delete test records in `afterAll` to keep the database clean
- **No mocking**: integration tests use real database, real repositories, real business logic
- **Cross-entity verification**: after completing a mission, verify the drone's status and flight hours changed

**Running integration tests:**

```bash
# Prerequisites: PostgreSQL must be running
docker compose up -d postgres

# Run integration tests
cd backend && npm run test:e2e
```

### Running Tests

```bash
# Backend unit tests
cd backend && npm run test

# A specific test file
npm run test -- --testPathPattern=drone

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Integration tests
npm run test:e2e

# Frontend E2E
cd frontend && npx playwright test

# Playwright UI mode (debug)
npx playwright test --ui
```

---

## 15. Troubleshooting

### Database Connection Error

```text
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Check if PostgreSQL is running:

```bash
docker compose ps                    # Is the container running?
docker compose up -d postgres        # Start it
docker compose logs postgres         # Check the logs
```

### Migration Error

```text
Error: relation "drones" already exists
```

**Solution**: Reset the database:

```bash
docker compose down -v               # Remove volumes
docker compose up -d postgres        # Restart
npm run migration:run                # Run migrations again
```

### Port Conflict

```text
Error: listen EADDRINUSE :::3000
```

**Solution**: Find and kill the process using the port:

```bash
lsof -i :3000                       # Find the PID
kill -9 <PID>                        # Kill the process
```

### Migration Generate: __dirname Error

```text
Error: __dirname is not defined in ES module scope
```

**Solution**: The project uses `module: "nodenext"` which causes ESM issues with TypeORM CLI. Make sure `tsconfig.json` has the `ts-node` override:

```json
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

And that migration scripts in `package.json` use `ts-node -r tsconfig-paths/register` prefix.

### TypeORM Sync Warning

```text
IMPORTANT: Set synchronize to false in production
```

**Solution**: Make sure `synchronize: false` is set. In this project, we always use migrations.

### npm install Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

---

> **Note**: This is a living document. Update the relevant section with every new change.
