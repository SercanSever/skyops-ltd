# Testing Standards

Backend and frontend testing rules.

## Backend Unit Tests

Domain entities and use cases are tested. No framework dependencies (pure TypeScript).

### Business logic to test

1. **Serial Number Validation**
   - Valid format: `SKY-AB12-CD34` pass
   - Invalid formats: `SKY-XXXX`, `DRN-XXXX-XXXX`, `SKY-xxxx-xxxx`, `SKY-@#$%-XXXX` fail

2. **State Transitions (Mission)**
   - PLANNED → PRE_FLIGHT_CHECK pass
   - PLANNED → ABORTED pass
   - PRE_FLIGHT_CHECK → IN_PROGRESS pass
   - IN_PROGRESS → COMPLETED pass
   - COMPLETED → PLANNED fail (invalid)
   - ABORTED → IN_PROGRESS fail (invalid)

3. **Maintenance Calculations**
   - Maintenance required after 50 flight hours
   - Maintenance required after 90 days
   - Whichever comes first takes precedence
   - nextMaintenanceDueDate is calculated correctly

4. **Overlap Detection**
   - Same drone, overlapping time range → error
   - Same drone, non-overlapping time range → success
   - Different drone, same time range → success

5. **Drone Retirement**
   - Retire with scheduled missions → error
   - Retire with no missions → success

6. **Flight Hours**
   - Drone totalFlightHours updates on mission completion
   - Maintenance flightHoursAtMaintenance consistency check

### Fleet Health Report Logic

- Total drone count and status breakdown are correct
- Overdue maintenance list is correct
- Missions in next 24 hours count is correct
- Average flight hours calculation is correct

## Backend Integration Test

Full mission lifecycle (at least 1 test):

```text
1. Create drone (POST /api/drones) → AVAILABLE
2. Schedule mission (POST /api/missions) → PLANNED
3. Transition to PRE_FLIGHT_CHECK → drone still AVAILABLE
4. Transition to IN_PROGRESS → drone IN_MISSION
5. Transition to COMPLETED (send flightHours) → drone AVAILABLE, totalFlightHours updated
6. Verify drone: totalFlightHours increased, maintenance dates updated
```

## Frontend E2E Test (Playwright)

Full user flow (at least 1 test):

```text
1. Open dashboard, verify fleet overview
2. Create a new drone (fill form, submit)
3. Verify new drone appears in the drone list
4. Create a mission (select drone, fill info)
5. Advance mission through states
6. Verify dashboard reflects the changes
```

## File Naming

- Unit test: `*.spec.ts` (co-located next to the entity or use case)
- Integration test: `*.e2e-spec.ts` (in `backend/test/`)
- E2E test: `*.spec.ts` (in `frontend/e2e/`)

## Testing Principles

- Domain tests are pure TypeScript, no mocks needed (test the entity's own logic)
- Use case tests: mock the repository interface (DIP — test against the abstraction, not the implementation)
- Integration tests: use a real database (test database)
- E2E tests: run against the real application, no internal component mocking
