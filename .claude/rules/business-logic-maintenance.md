# Maintenance Log Business Rules

These rules define all business logic related to the Maintenance Log entity.

## Entity Properties

- `id`: UUID, auto-generated
- `droneId`: Associated drone (FK, required)
- `type`: Enum → `ROUTINE_CHECK`, `BATTERY_REPLACEMENT`, `MOTOR_REPAIR`, `FIRMWARE_UPDATE`, `FULL_OVERHAUL`
- `technicianName`: Technician name (required)
- `notes`: Notes (optional)
- `datePerformed`: Date the maintenance was performed (required)
- `flightHoursAtMaintenance`: Total flight hours at time of maintenance (required)
- `createdAt`: Registration timestamp
- `updatedAt`: Last update timestamp

## Side Effects on Maintenance Log Creation

When a maintenance log is created, the following operations are performed in order. Cross-entity side effects are orchestrated by the use case (Application layer), not the entity itself (SRP + DIP):

1. **Drone status update**: Drone status → `MAINTENANCE`
2. **lastMaintenanceDate update**: Drone's `lastMaintenanceDate` = `datePerformed`
3. **nextMaintenanceDueDate recalculation**:
   - `datePerformed + 90 days` (date-based)
   - Flight-hours-based check also evaluated (50-hour rule)
4. **flightHoursAtMaintenance consistency check**:
   - Recorded `flightHoursAtMaintenance` must be consistent with drone's `totalFlightHours`
   - Tolerance: ±1 hour (for rounding differences)
   - Return an error if inconsistent

## Maintenance Completion

An endpoint or mechanism must exist to set the drone status back to `AVAILABLE` after maintenance is completed.
This can be implemented as a separate "complete maintenance" operation or as an explicit status update after the maintenance log is created.

## Validation Rules

1. **Drone existence check**: `droneId` must reference a valid drone
2. **flightHoursAtMaintenance**: Must be a positive number, consistent with drone's `totalFlightHours` (±1 hour tolerance)
3. **datePerformed**: Cannot be a future date
4. **type**: Must be a valid enum value
5. **Drone must not be IN_MISSION**: Maintenance cannot be started if the drone is currently on a mission

## Listing and Filtering

- Pagination is required
- Filtering by drone must be supported
- Filtering by date range must be supported
- Filtering by type must be supported
