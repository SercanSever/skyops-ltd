# DEVELOPER_README.md Update Rules

`DEVELOPER_README.md` is an **educational guide** for the developer. It must be updated at every step.

## When to Update

- New module/feature added
- New migration created
- New package installed
- Docker configuration changed
- API endpoint added/changed
- New test written
- Architectural decision made
- Git workflow changed

## Required Sections and Content

### 1. Project Setup

- Step-by-step setup instructions (copy-paste-ready commands)
- Prerequisites (Node.js, Docker, PostgreSQL)
- How to create the `.env` file

### 2. PostgreSQL

- How to install (brew, docker)
- How to start/stop
- Connecting with psql
- Basic SQL commands (CREATE DATABASE, \dt, SELECT, etc.)
- Database URL format

### 3. Docker & Docker Compose

- What Docker is, how it works (brief explanation)
- docker-compose.yml explanation (what each service does)
- Essential commands (up, down, logs, exec)
- Volumes and data persistence

### 4. NestJS Fundamentals

- How the module system works (@Module decorator)
- Dependency Injection (providers, inject tokens) — relate to DIP
- Controller → Service flow
- Pipes (ValidationPipe), Guards, Interceptors, Filters
- Middleware vs Interceptor differences
- Lifecycle hooks

### 5. TypeORM

- Entity definition (decorators explained)
- Migration creation and execution (with commands)
- QueryBuilder usage
- Relations (OneToMany, ManyToOne)
- Repository pattern

### 6. DDD + Clean Architecture

- Why we chose this architecture (relate to SOLID)
- 4 layers and their responsibilities (SRP per layer)
- Dependency Rule explanation (with diagram) — DIP in practice
- Domain Entity vs ORM Entity difference
- What a Value Object is and why we use it
- Use Case pattern explanation (SRP: one operation per use case)

### 7. React + TanStack Query

- useQuery and useMutation usage
- Query key strategy
- Cache invalidation
- Loading and error state handling
- Optimistic updates (if applicable)

### 8. Tailwind + shadcn/ui

- Adding shadcn/ui components (npx shadcn-ui add)
- Theme customization
- cn() utility function
- Responsive design approach

### 9. API Endpoint List

For each endpoint:

- Method + URL
- Request body example
- Response body example
- Possible error codes
- curl example

### 10. Design Decisions

For each architectural decision:

- What was decided
- Why this choice was made
- What the alternatives were
- What the trade-offs are

### 11. Adding a New Feature Guide

Step-by-step:

1. Create domain entity
2. Value objects (if needed)
3. Define repository interface (DIP — depend on abstraction)
4. Write use cases (SRP — one operation each)
5. ORM entity + repository implementation
6. Controller + request/response DTOs
7. Define module and register it
8. Create migration
9. Frontend API functions
10. Frontend components and pages
11. Write tests

### 12. Scaling Strategies

- Horizontal scaling (multiple instances)
- CQRS pattern (read/write separation)
- Event-driven architecture (domain events)
- Microservice migration strategy (bounded contexts → services)
- Caching strategy (Redis)
- Message queue (RabbitMQ/Kafka)

### 13. Git Workflow

- Branch strategy explanation
- PR process
- Commit message format and examples
- How to create a feature branch

### 14. Writing Tests

- How to write unit tests (with example)
- How to write integration tests
- How to write E2E tests
- Mock vs real database (DIP — mock the interface, not the implementation)
- Test execution commands

### 15. Troubleshooting

- Common errors and solutions
- Database connection issues
- Migration errors
- Port conflicts

## Writing Style

- Each section should be self-contained and readable on its own
- Include copy-paste-ready code examples
- Always use full paths for commands
- Always answer the "why" question
- Explain jargon when used
- Write in English
