# API Standards

All REST API endpoints must adhere to these standards.

## HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error (class-validator) |
| 404 | Resource not found |
| 409 | Conflict (duplicate serial number, overlapping mission) |
| 422 | Business rule violation (invalid state transition, drone not available) |

## Error Response Format

```json
{
  "statusCode": 422,
  "message": "Drone is not available for missions",
  "error": "Business Rule Violation",
  "details": {
    "field": "droneId",
    "currentStatus": "IN_MISSION"
  }
}
```

- `statusCode`: HTTP status code
- `message`: Human-readable error message
- `error`: Error category
- `details`: Optional, additional context

## Input Validation

- Performed in the **presentation layer** (controller DTOs)
- Use `class-validator` decorators: `@IsString()`, `@IsEnum()`, `@IsUUID()`, `@IsNotEmpty()`, `@Matches()`, `@IsDateString()`, `@IsPositive()`, `@IsOptional()`, etc.
- NestJS `ValidationPipe` enabled globally (whitelist: true, forbidNonWhitelisted: true, transform: true)
- Validation is the presentation layer's single responsibility — business rule validation belongs in the domain/application layer (SRP)

## Pagination

### Request

```text
GET /api/drones?page=1&limit=10
```

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

### Response

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

## Filtering (Mission)

```text
GET /api/missions?status=PLANNED&droneId=uuid&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

All filters are optional. Multiple filters are combined with AND.

## API Endpoint Naming

- Prefix: `/api/`
- Resource names are plural: `/api/drones`, `/api/missions`, `/api/maintenance-logs`
- Nested resources when needed: `/api/drones/:id/missions`
- Action endpoints: `/api/missions/:id/transition` (for state transitions)

## Request/Response DTO Rules

- Request DTO: `CreateDroneRequestDto`, `UpdateDroneRequestDto` → class-validator decorators
- Response DTO: `DroneResponseDto` → transformed from domain entity
- DTOs live in the presentation layer
- Never return domain entities directly from the API (ISP — clients should not depend on internal domain structures)
