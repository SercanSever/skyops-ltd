# Folder Structure

This project uses DDD + Clean Architecture. The following structure must be followed.

## Project Root

```text
skyops-ltd/
├── CLAUDE.md                    # AI assistant rules
├── DEVELOPER_README.md          # Developer guide (update on every change)
├── CANDIDATE_CASE_STUDY.md      # Original case study document
├── docker-compose.yml           # Docker services
├── .env.example                 # Environment variables template
├── .gitignore
├── .github/
│   └── workflows/
│       ├── backend-ci.yml       # Backend CI pipeline
│       └── frontend-ci.yml      # Frontend CI pipeline
├── backend/                     # NestJS backend
└── frontend/                    # React frontend
```

## Backend Structure (DDD + Clean Architecture)

Each domain module follows the 4-layer structure. Each layer has a single responsibility (SRP), and dependencies point inward only (DIP).

```text
backend/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── .eslintrc.js
├── .prettierrc
├── src/
│   ├── app.module.ts            # Root module
│   ├── main.ts                  # Bootstrap
│   ├── common/                  # Shared utilities
│   │   ├── dto/
│   │   │   ├── pagination-query.dto.ts
│   │   │   └── paginated-response.dto.ts
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts
│   │   └── exceptions/
│   │       └── business-rule-violation.exception.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── database/
│   │   ├── data-source.ts       # TypeORM CLI data source
│   │   ├── migrations/          # Migration files
│   │   └── seeds/
│   │       └── seed.ts          # Seed script
│   └── modules/
│       ├── drone/
│       │   ├── domain/                         # Pure TS — no framework imports
│       │   │   ├── entities/
│       │   │   │   └── drone.entity.ts
│       │   │   ├── enums/
│       │   │   │   ├── drone-status.enum.ts
│       │   │   │   └── drone-model.enum.ts
│       │   │   ├── repositories/
│       │   │   │   └── drone.repository.interface.ts
│       │   │   └── value-objects/
│       │   │       └── serial-number.vo.ts
│       │   ├── application/                    # Use cases (SRP: one operation each)
│       │   │   ├── use-cases/
│       │   │   │   ├── create-drone.use-case.ts
│       │   │   │   ├── update-drone.use-case.ts
│       │   │   │   ├── get-drone.use-case.ts
│       │   │   │   ├── list-drones.use-case.ts
│       │   │   │   └── retire-drone.use-case.ts
│       │   │   └── dto/
│       │   │       ├── create-drone.input.ts
│       │   │       └── update-drone.input.ts
│       │   ├── infrastructure/                 # Implements domain interfaces (DIP)
│       │   │   ├── persistence/
│       │   │   │   ├── drone.orm-entity.ts
│       │   │   │   ├── drone.repository.ts
│       │   │   │   └── drone.mapper.ts
│       │   │   └── drone.module.ts
│       │   └── presentation/                   # HTTP layer
│       │       ├── drone.controller.ts
│       │       └── dto/
│       │           ├── create-drone.request.dto.ts
│       │           ├── update-drone.request.dto.ts
│       │           └── drone.response.dto.ts
│       ├── mission/
│       │   └── (same 4-layer structure)
│       ├── maintenance/
│       │   └── (same 4-layer structure)
│       └── fleet-health/
│           ├── fleet-health.module.ts
│           ├── fleet-health.controller.ts
│           ├── fleet-health.service.ts
│           └── fleet-health.service.spec.ts
└── test/
    └── mission-lifecycle.e2e-spec.ts
```

## Frontend Structure

```text
frontend/
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── components.json              # shadcn/ui config
├── index.html
├── postcss.config.js
├── src/
│   ├── App.tsx                  # Root component + router
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Tailwind imports
│   ├── api/
│   │   ├── client.ts            # fetch wrapper (base URL, error handling)
│   │   ├── drones.ts            # drone API functions
│   │   ├── missions.ts          # mission API functions
│   │   ├── maintenance.ts       # maintenance API functions
│   │   └── fleet-health.ts      # fleet health API functions
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── features/
│   │   ├── dashboard/           # Dashboard components
│   │   ├── drones/              # Drone CRUD components
│   │   ├── missions/            # Mission management components
│   │   └── maintenance/         # Maintenance log components
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── DronesPage.tsx
│   │   ├── DroneDetailPage.tsx
│   │   ├── MissionsPage.tsx
│   │   └── MaintenancePage.tsx
│   ├── hooks/
│   │   ├── use-drones.ts        # TanStack Query hooks for drones
│   │   ├── use-missions.ts
│   │   ├── use-maintenance.ts
│   │   └── use-fleet-health.ts
│   ├── types/
│   │   ├── drone.types.ts
│   │   ├── mission.types.ts
│   │   ├── maintenance.types.ts
│   │   └── api.types.ts         # Pagination, error response types
│   └── lib/
│       └── utils.ts             # cn() helper, formatters
├── e2e/
│   └── full-flow.spec.ts
└── playwright.config.ts
```

## File Creation Rules

1. Follow the 4-layer structure when adding a new domain module
2. Each file should have a single responsibility (SRP)
3. Index files (barrel exports) are optional — use when needed
4. Test files should be co-located next to the file they test
5. Fleet Health module uses a simpler structure — full DDD layers are unnecessary (just service + controller)
