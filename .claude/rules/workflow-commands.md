# Workflow Commands

User communicates intent through specific command tags. Follow these rules exactly.

## Phase Number (e.g., "Phase 14", "14 ile devam")

When the user references a phase number from `implementation-plan.md`:

1. Read the corresponding phase from `implementation-plan.md`
2. Create the appropriate branch from `main` (if a new branch is needed per the plan)
3. Implement the phase fully (code, tests, lint, build verification)
4. **STOP and wait** for the user to say **`--commitpr`**
5. Do NOT commit, push, or create a PR until explicitly told

## --newfeature `<description>`

When the user's message starts with `--newfeature`:

1. Parse the feature description from the message
2. Analyze the codebase to understand what changes are needed
3. Present an implementation plan to the user:
   - Which layers will be affected (domain, application, infrastructure, presentation)
   - Which files will be created or modified
   - Branch name proposal: `feature/<short-kebab-case-name>` (e.g., `--newfeature add login button` → `feature/login-button`, 2-4 words max)
4. **STOP and wait** for the user to approve the plan
5. Once approved:
   - Ensure `main` is up to date (`git checkout main && git pull origin main`)
   - Create the feature branch from `main` (`git checkout -b feature/<name>`)
   - Implement the feature following all project rules (DDD layers if backend, folder structure, testing standards, etc.)
   - **Auto-generate tests:** If domain or application layer code was added or modified, automatically write or update the corresponding unit tests (co-located `*.spec.ts` files). Follow the testing standards defined in the project rules. The user will run `npm run test` manually to verify.
   - **STOP and wait** for the user to say **`--commitpr`**
6. Do NOT commit, push, or create a PR until explicitly told

## --commitpr

When the user says `--commitpr`:

1. Stage relevant files and create a descriptive commit following the commit message format (`type(scope): description`)
2. Push the branch to remote (`git push -u origin <branch-name>`)
3. If a PR already exists for the current branch: **push to the existing branch** (the PR updates automatically)
4. If no PR exists yet: create a new PR via `gh pr create` targeting `main`
5. Share the PR URL with the user
6. **STOP and wait** — do NOT merge, do NOT switch branches. The user will merge the PR manually on GitHub.

## --mergedone

When the user says `--mergedone` (after they have manually merged the PR on GitHub):

1. Switch to main branch: `git checkout main`
2. Pull the latest changes: `git pull origin main`
3. Delete the local feature branch: `git branch -d <branch-name>`
4. Confirm the current state: report the current branch (`main`) and that the project is up to date

## --issue

When the user says `--issue`:

1. Check open issues on GitHub via `gh issue list --state open`
2. Read the most recent open issue details via `gh issue view <number>`
3. Diagnose the problem described in the issue
4. Present a fix plan to the user (what is broken, why, and how to fix it)
5. **STOP and wait** for the user to approve the plan
6. Once approved:
   - Ensure `main` is up to date (`git checkout main && git pull origin main`)
   - Create a fix branch from `main` (`fix/<short-description-from-issue>`)
   - Implement the fix (code changes, test fixes, CI fixes, etc.)
   - **STOP and wait** for the user to say **`--commitpr`**
7. Do NOT commit, push, or create a PR until explicitly told
8. When `--commitpr` is given, include `Closes #<issue-number>` in the commit message so the issue auto-closes on merge

## --rune2e

When the user says `--rune2e`:

1. Run backend integration tests: `cd backend && npm run test:e2e`
2. Run frontend E2E tests: `cd frontend && npx playwright test`
3. If **all tests pass**: report success with a summary of tests run
4. If **any test fails**:
   - Read the error output and diagnose the root cause
   - Present a fix plan to the user (what failed, why, and how to fix it)
   - **STOP and wait** for the user to approve the plan
   - Once approved:
     - Ensure `main` is up to date (`git checkout main && git pull origin main`)
     - Create a fix branch from `main` (`fix/<short-description>`)
     - Implement the fixes
     - Re-run the failing test suite to verify the fix
     - **STOP and wait** for `--commitpr`
   - The full cycle then follows: `--commitpr` → user merges on GitHub → `--mergedone`
5. Do NOT commit, push, or create a PR automatically — always wait for `--commitpr`

## --issuedone

When the user says `--issuedone`:

1. List all open issues on GitHub via `gh issue list --state open`
2. Close each open issue via `gh issue close <number>`
3. Report which issues were closed

## Migration Rules

When a new feature or fix requires a new DB table or schema change:

1. Create the Entity (domain) and ORM Entity (infrastructure) files
2. **STOP** — Do NOT generate migration yet. Present the entity structure and proposed migration name to the user
3. After user approves → run `npm run migration:generate -- src/database/migrations/<Name>` (generate only)
4. **STOP** — Show the generated migration file to the user, wait for approval
5. After user approves → run `npm run migration:run` to update the database

**Never run migration:generate or migration:run without explicit user approval.**

## Key Principle

**Never commit, push, or create a PR automatically.** Always wait for the explicit `--commitpr` command. This applies to ALL changes — phase implementations, bug fixes, issue fixes, feature additions. The only action that triggers git operations is `--commitpr`.

After `--mergedone`, always end up on a clean, up-to-date `main` branch ready for the next task.
