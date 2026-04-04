# Workflow Commands

User communicates intent through specific keywords. Follow these rules exactly.

## Phase Number (e.g., "Phase 14", "14 ile devam")

When the user references a phase number from `implementation-plan.md`:

1. Read the corresponding phase from `implementation-plan.md`
2. Create the appropriate branch from `main` (if a new branch is needed per the plan)
3. Implement the phase fully (code, tests, lint, build verification)
4. **STOP and wait** for the user to say **"commit-PR"**
5. Do NOT commit or create a PR until explicitly told

## commit-PR

When the user says "commit-PR":

1. Stage relevant files and create a descriptive commit
2. Push to the remote branch
3. Create a PR via `gh pr create` targeting `main`
4. Share the PR URL with the user

## newfeature <description>

When the user's message starts with "newfeature":

1. Parse the feature description from the message
2. Add the feature as a new phase in `implementation-plan.md` (next available number, appropriate branch name)
3. Create the feature branch from `main`
4. Implement the feature following all project rules (DDD layers if backend, folder structure, testing standards, etc.)
5. **STOP and wait** for the user to say **"commit-PR"**
6. Do NOT commit or create a PR until explicitly told

## Key Principle

**Never commit or create a PR automatically after implementation.** Always wait for the explicit "commit-PR" command. This gives the user time to review changes before they are committed.
