# Workflow Commands

User communicates intent through specific command tags. Follow these rules exactly.

## Phase Number (e.g., "Phase 14", "14 ile devam")

When the user references a phase number from `implementation-plan.md`:

1. Read the corresponding phase from `implementation-plan.md`
2. Create the appropriate branch from `main` (if a new branch is needed per the plan)
3. Implement the phase fully (code, tests, lint, build verification)
4. **STOP and wait** for the user to say **`--commitpr`**
5. Do NOT commit, push, or create a PR until explicitly told

## --commitpr

When the user says `--commitpr`:

1. Stage relevant files and create a descriptive commit
2. If a PR already exists for the current branch: **push to the existing branch** (the PR updates automatically)
3. If no PR exists yet: push to remote and create a new PR via `gh pr create` targeting `main`
4. Share the PR URL with the user

## --newfeature \<description\>

When the user's message starts with `--newfeature`:

1. Parse the feature description from the message
2. Add the feature as a new phase in `implementation-plan.md` (next available number, appropriate branch name)
3. Create the feature branch from `main`
4. Implement the feature following all project rules (DDD layers if backend, folder structure, testing standards, etc.)
5. **STOP and wait** for the user to say **`--commitpr`**
6. Do NOT commit, push, or create a PR until explicitly told

## --issue

When the user says `--issue`:

1. Check open issues on GitHub via `gh issue list --state open`
2. Read the most recent open issue details via `gh issue view <number>`
3. Diagnose the problem described in the issue
4. Implement the fix (code changes, test fixes, CI fixes, etc.)
5. **STOP and wait** for the user to say **`--commitpr`**
6. Do NOT commit, push, or create a PR until explicitly told
7. When `--commitpr` is given, include `Closes #<issue-number>` in the commit message so the issue auto-closes on merge

## --issuedone

When the user says `--issuedone`:

1. List all open issues on GitHub via `gh issue list --state open`
2. Close each open issue via `gh issue close <number>`
3. Report which issues were closed

## Key Principle

**Never commit, push, or create a PR automatically.** Always wait for the explicit `--commitpr` command. This applies to ALL changes — phase implementations, bug fixes, issue fixes, feature additions. The only action that triggers git operations is `--commitpr`.
