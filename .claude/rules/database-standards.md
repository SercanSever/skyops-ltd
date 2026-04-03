# Database Standards

PostgreSQL and TypeORM usage rules.

## Core Rules

1. **Auto-sync is FORBIDDEN**: `synchronize: false` always. Create a migration for every schema change.
2. **Migration files**: Located in `backend/src/database/migrations/`
3. **Data source**: `backend/src/database/data-source.ts` (shared between CLI and app)

## Migration Commands

```bash
# Generate migration from entity changes (path is positional, NOT -n flag)
npm run migration:generate -- src/database/migrations/CreateDronesTable

# Create empty migration (for manual SQL)
npm run migration:create -- src/database/migrations/SeedInitialData

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# View migration status
npm run migration:show
```

**Note:** Migration scripts use `ts-node -r tsconfig-paths/register` internally because the project uses `module: "nodenext"`. A `ts-node` override in `tsconfig.json` forces CommonJS for CLI compatibility.

## Entity Conventions (ORM Entity — Infrastructure Layer)

- File name: `*.orm-entity.ts` (to distinguish from domain entities)
- Table name: snake_case, plural (`drones`, `missions`, `maintenance_logs`)
- Column name: snake_case (`serial_number`, `total_flight_hours`, `planned_start_time`)
- Primary key: UUID (`@PrimaryGeneratedColumn('uuid')`)
- Timestamps: `created_at` and `updated_at` on every entity (`@CreateDateColumn`, `@UpdateDateColumn`)

## Enum Handling

Use PostgreSQL native enums:

```typescript
@Column({
  type: 'enum',
  enum: DroneStatus,
  default: DroneStatus.AVAILABLE,
})
status: DroneStatus;
```

## Index Definitions

- `serial_number`: UNIQUE index
- `drone_id` (missions, maintenance_logs): Foreign key index
- `status` (drones, missions): Regular index (for filtering)
- `planned_start_time`, `planned_end_time` (missions): Composite index (for overlap detection)

## Relations

- Drone → Mission: OneToMany
- Drone → MaintenanceLog: OneToMany
- Mission → Drone: ManyToOne
- MaintenanceLog → Drone: ManyToOne

DO NOT use cascade delete. Deletion must be prevented when related records exist.

## Seed Script

Located in `backend/src/database/seeds/`:

- At least 20 drones (various statuses and models)
- At least 50 missions (various statuses, some completed)
- At least 30 maintenance logs (various types)
- Seed data must be realistic: valid serial numbers, dates, flight hours
- Seed script must be idempotent (safe to re-run)

## ORM Entity vs Domain Entity

- **ORM Entity** (`*.orm-entity.ts`): TypeORM decorators, DB mapping, lives in the infrastructure layer
- **Domain Entity** (`*.entity.ts`): Pure TypeScript class, business logic, lives in the domain layer
- **Mapper**: ORM ↔ Domain conversion, lives in the infrastructure layer
- Domain entity MUST NEVER import from TypeORM (DIP — domain depends on abstractions, not infrastructure)
