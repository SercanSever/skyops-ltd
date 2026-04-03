# CI/CD Pipeline

Automated quality control rules using GitHub Actions.

## Pipeline Triggers

- On PR opened (opened, synchronize, reopened)
- On push to `main` branch
- Path filter: only runs on changes in the relevant directory

## Backend CI (`.github/workflows/backend-ci.yml`)

### Jobs

1. **lint**
   - ESLint: `npm run lint`
   - Prettier: `npm run format:check`
   - Pipeline fails on any error

2. **build**
   - `npm run build`
   - TypeScript compilation must succeed
   - Pipeline fails on type errors

3. **test**
   - Uses a PostgreSQL service container
   - Run migrations
   - `npm run test` (unit tests)
   - `npm run test:e2e` (integration tests)
   - Coverage threshold: 80% (lines)

4. **security**
   - `npm audit --audit-level=high`
   - Pipeline fails on high/critical severity vulnerabilities

### PostgreSQL Service Container

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: skyops_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Frontend CI (`.github/workflows/frontend-ci.yml`)

### Jobs

1. **lint**
   - ESLint: `npm run lint`
   - Prettier: `npm run format:check`

2. **build**
   - `npm run build`
   - Vite production build must succeed

3. **test-e2e**
   - Backend + PostgreSQL service containers are started
   - Playwright tests are executed
   - Test results are stored as artifacts
   - Screenshots/videos are uploaded on failure

4. **security**
   - `npm audit --audit-level=high`

## Branch Protection Rules (GitHub)

- Direct push to `main` is FORBIDDEN
- Required status checks for PR merge:
  - backend-ci (lint, build, test, security) must all pass
  - frontend-ci (lint, build) must all pass
- Stale reviews are dismissed

## Node.js Version

- Use `node-version-file: '.nvmrc'` in CI (currently v24.14.1 LTS)
- Via `actions/setup-node@v4`

## Caching

- Cache `node_modules` with `actions/cache@v4`
- Cache key: `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`
