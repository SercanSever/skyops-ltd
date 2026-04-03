# Drone Registry Business Rules

These rules define all business logic related to the Drone entity. Code must adhere to these rules 100%.

## Entity Properties

- `id`: UUID, auto-generated
- `serialNumber`: Unique, format **SKY-XXXX-XXXX** (X = alphanumeric [A-Z0-9]). Implemented as a Value Object.
- `model`: Enum → `PHANTOM_4`, `MATRICE_300`, `MAVIC_3_ENTERPRISE`
- `status`: Enum → `AVAILABLE`, `IN_MISSION`, `MAINTENANCE`, `RETIRED`
- `totalFlightHours`: Total flight hours (number, default: 0)
- `lastMaintenanceDate`: Last maintenance date (nullable, null on initial creation)
- `nextMaintenanceDueDate`: Next maintenance due date (calculated automatically)
- `createdAt`: Registration timestamp (automatic)
- `updatedAt`: Last update timestamp (automatic)

## Serial Number (Value Object)

- Format: `SKY-XXXX-XXXX` (X = A-Z, 0-9)
- Regex: `/^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/`
- Implement as `SerialNumber` value object in the domain layer
- Validation is performed in the value object constructor (self-validating — encapsulation)
- Unique constraint must also exist at the database level

## Maintenance Calculation Rules

Maintenance is required **every 50 flight hours OR every 90 days**, whichever comes first:

```text
nextMaintenanceDueDate = min(
  lastMaintenanceDate + 90 days,
  estimated date when totalFlightHours reaches the next multiple of 50
)
```

Simplified calculation in practice:

- `nextMaintenanceDueDate` = `lastMaintenanceDate + 90 days` (date-based)
- Flight-hours-based check: compare hours since last maintenance using `totalFlightHours` vs recorded hours at last maintenance
- Maintenance is flagged as required when either condition is met
- This calculation logic lives in the Drone domain entity (SRP — the entity owns its maintenance rules)

## Status Rules

- Default status on creation: `AVAILABLE`
- Only drones with `AVAILABLE` status can be assigned to missions
- When a mission starts (IN_PROGRESS): drone status → `IN_MISSION`
- When a mission is completed or aborted: drone status → `AVAILABLE`
- When a maintenance log is created: drone status → `MAINTENANCE`
- When maintenance is completed: drone status → `AVAILABLE`
- A drone cannot be retired if it has scheduled missions (PLANNED, PRE_FLIGHT_CHECK)
- A `RETIRED` drone cannot be reactivated

## CRUD Rules

- **Create**: Serial number uniqueness check, model validation, status defaults to AVAILABLE
- **Update**: serialNumber is immutable after creation. Status cannot be updated directly (changes via business operations only).
- **Delete**: Soft delete is preferred. Exercise caution with related mission/maintenance records.
- **List**: Pagination is required. Filterable by status and model.
