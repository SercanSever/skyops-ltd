# Git Workflow

Feature branch + PR-based development rules.

## Branch Strategy

- `main`: Production-ready code. Direct push is FORBIDDEN.
- `feature/*`: New features
- `fix/*`: Bug fixes
- `refactor/*`: Refactoring
- `test/*`: Test additions/fixes
- `docs/*`: Documentation changes
- `chore/*`: Configuration, dependency, CI/CD changes

## Main Feature Branches

```text
feature/project-setup          # Project scaffold, docker, CI/CD
feature/drone-registry         # Drone CRUD + business logic
feature/mission-management     # Mission lifecycle + state machine
feature/maintenance-log        # Maintenance CRUD + side effects
feature/fleet-health           # Fleet health report endpoint
feature/dashboard              # Frontend dashboard + pages
feature/seed-data              # Seed script
feature/e2e-tests              # Integration + E2E tests
```

## Commit Message Format

```text
type(scope): description

Examples:
feat(drone): add serial number validation with value object
fix(mission): prevent scheduling missions in the past
refactor(maintenance): extract maintenance calculation logic
test(drone): add unit tests for serial number format
docs(readme): update API endpoint documentation
chore(docker): add PostgreSQL health check
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (behavior unchanged)
- `test`: Test addition/fix
- `docs`: Documentation change
- `chore`: Build, CI, dependency changes
- `style`: Formatting, missing semi colons (code unchanged)

### Scopes

- `drone`, `mission`, `maintenance`, `fleet-health`: Backend domains
- `dashboard`, `ui`: Frontend
- `docker`, `ci`: Infrastructure
- `readme`, `config`: General

## PR Process

1. Create feature branch: `git checkout -b feature/drone-registry`
2. Commit changes (prefer atomic commits)
3. Push: `git push -u origin feature/drone-registry`
4. Create PR on GitHub
5. Wait for CI checks to pass
6. Merge to main (squash merge preferred)
7. Update local main: `git checkout main && git pull`

## Rules

- Each PR should focus on a single feature/concern (SRP applied to PRs)
- Run `npm run lint` and `npm run test` before opening a PR
- Merge conflicts are resolved by the PR author
- Force push to main is FORBIDDEN
- Commits should be meaningful and descriptive
