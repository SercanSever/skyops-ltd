# Backend — NestJS + TypeORM

## Architecture

DDD + Clean Architecture with 4 layers per domain module:

```text
modules/<domain>/
├── domain/          # Pure TypeScript. NO NestJS/TypeORM imports.
├── application/     # Use cases. Depends only on domain layer.
├── infrastructure/  # TypeORM entities, repository implementations, NestJS module.
└── presentation/    # Controllers, request/response DTOs, validation.
```

## Key Rules

1. **Domain layer is pure TypeScript** — no framework imports (`@nestjs/*`, `typeorm`) allowed.
2. **Use cases have single responsibility** — one business operation per use case (SRP).
3. **Repository pattern via interfaces** — domain defines the interface, infrastructure implements it (DIP).
4. **ORM entity != Domain entity** — separate files, mapper converts between them.
5. **Validation in presentation layer** — class-validator decorators on request DTOs only.
6. **synchronize: false** — always use migrations, never auto-sync.

## Commands

```bash
npm run start:dev        # Dev server (watch mode) — http://localhost:3000
npm run build            # Production build
npm run test             # Unit tests
npm run test:e2e         # Integration tests
npm run test:cov         # Coverage report
npm run lint             # ESLint (auto-fix)
npm run format           # Prettier format
npm run format:check     # Prettier check (CI)
npm run migration:generate -- -n Name  # Generate migration from entity changes
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration
npm run seed             # Load seed data
```

## File Naming

| Type | Pattern | Location |
| Domain entity | `*.entity.ts` | `domain/entities/` |
| ORM entity | `*.orm-entity.ts` | `infrastructure/persistence/` |
| Value object | `*.vo.ts` | `domain/value-objects/` |
| Use case | `*.use-case.ts` | `application/use-cases/` |
| Repository interface | `*.repository.interface.ts` | `domain/repositories/` |
| Repository impl | `*.repository.ts` | `infrastructure/persistence/` |
| Mapper | `*.mapper.ts` | `infrastructure/persistence/` |
| Controller | `*.controller.ts` | `presentation/` |
| Request DTO | `*.request.dto.ts` | `presentation/dto/` |
| Response DTO | `*.response.dto.ts` | `presentation/dto/` |
| Unit test | `*.spec.ts` | Co-located with source |
| Integration test | `*.e2e-spec.ts` | `test/` |

## Global Setup (main.ts)

- Global prefix: `/api`
- ValidationPipe: `whitelist: true, forbidNonWhitelisted: true, transform: true`
- AllExceptionsFilter for consistent error responses
- CORS enabled for frontend dev server

## Error Response Format

```json
{
  "statusCode": 422,
  "message": "Human-readable error message",
  "error": "Error Category",
  "details": {}
}
```
