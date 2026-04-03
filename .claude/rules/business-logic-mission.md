# Mission Management Business Rules

These rules define all business logic related to the Mission entity. State machine transitions are critical.

## Entity Properties

- `id`: UUID, auto-generated
- `name`: Mission name (required)
- `type`: Enum → `WIND_TURBINE_INSPECTION`, `SOLAR_PANEL_SURVEY`, `POWER_LINE_PATROL`
- `droneId`: Assigned drone (FK)
- `pilotName`: Pilot name (required)
- `siteLocation`: Mission site location (required)
- `status`: Enum → `PLANNED`, `PRE_FLIGHT_CHECK`, `IN_PROGRESS`, `COMPLETED`, `ABORTED`
- `plannedStartTime`: Planned start time (required)
- `plannedEndTime`: Planned end time (required)
- `actualStartTime`: Actual start time (set when transitioning to IN_PROGRESS)
- `actualEndTime`: Actual end time (set when COMPLETED or ABORTED)
- `flightHours`: Flight hours (recorded on COMPLETED, required)
- `abortReason`: Abort reason (OPTIONAL, recorded if provided when ABORTED)
- `createdAt`: Registration timestamp
- `updatedAt`: Last update timestamp

## State Machine (Mission Lifecycle)

```text
PLANNED ──→ PRE_FLIGHT_CHECK ──→ IN_PROGRESS ──→ COMPLETED
   |              |                    |
   v              v                    v
ABORTED        ABORTED             ABORTED
```

### Valid State Transitions

| From | To | Condition |
|---|---|---|
| PLANNED | PRE_FLIGHT_CHECK | — |
| PLANNED | ABORTED | abortReason is optional |
| PRE_FLIGHT_CHECK | IN_PROGRESS | drone status → IN_MISSION, actualStartTime is set |
| PRE_FLIGHT_CHECK | ABORTED | abortReason is optional |
| IN_PROGRESS | COMPLETED | flightHours required, added to drone, maintenance check triggered, actualEndTime set |
| IN_PROGRESS | ABORTED | abortReason is optional, drone status → AVAILABLE, actualEndTime set |

**Invalid transitions must be rejected** (e.g., COMPLETED → PLANNED, ABORTED → IN_PROGRESS).

The transition validation logic lives in the Mission domain entity (SRP — the entity owns its state machine).

## Side Effects (On State Transitions)

Side effects are orchestrated by the use case (Application layer), not the domain entity. The entity validates and transitions; the use case coordinates cross-entity changes (SRP).

### PRE_FLIGHT_CHECK → IN_PROGRESS

1. Drone status → `IN_MISSION`
2. `actualStartTime` = current time

### IN_PROGRESS → COMPLETED

1. `flightHours` is recorded (from request body)
2. Drone `totalFlightHours` += `flightHours`
3. Check if maintenance is now due (50-hour or 90-day rule)
4. Drone status → `AVAILABLE`
5. `actualEndTime` = current time

### Any → ABORTED

1. `abortReason` is recorded if provided (optional)
2. If drone is IN_MISSION → drone status → `AVAILABLE`
3. `actualEndTime` = current time

## Validation Rules

1. **No past scheduling**: `plannedStartTime` must be in the future
2. **End after start**: `plannedEndTime` > `plannedStartTime`
3. **Drone must be available**: Assigned drone status must be `AVAILABLE`
4. **Overlap detection**: No time overlap with existing active missions for the same drone
   - Check: new mission's `[plannedStartTime, plannedEndTime]` must not overlap with existing missions (PLANNED, PRE_FLIGHT_CHECK, IN_PROGRESS)
5. **flightHours**: Required on COMPLETED transition, must be a positive number

## Overlap Detection Algorithm

```sql
-- Does an overlap exist?
EXISTS (
  SELECT 1 FROM missions
  WHERE drone_id = :droneId
    AND id != :currentMissionId
    AND status IN ('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS')
    AND planned_start_time < :newEndTime
    AND planned_end_time > :newStartTime
)
```
