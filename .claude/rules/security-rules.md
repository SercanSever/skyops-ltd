# Security Rules

Rules for handling sensitive data and credentials in this project.

## Environment Variables & Credentials

1. **Never write `.env` values in documentation**: README, DEVELOPER_README, or any other committed file must NOT contain actual environment variable values (passwords, emails, API keys, connection strings with credentials).
2. **Use `.env.example` as template only**: `.env.example` must contain only variable names with empty values. Never fill in real values.
3. **Credential sharing**: Actual `.env` values are shared via email or other secure channels — never through Git.
4. **No credentials in git history**: If credentials are accidentally committed, they must be removed from the entire git history (using `git filter-repo`), not just deleted in a new commit.

## Code & Configuration

5. **No hardcoded secrets**: Passwords, API keys, tokens, and connection strings must come from environment variables, never hardcoded in source code.
6. **`.env` in `.gitignore`**: The `.env` file must always be listed in `.gitignore`. Never remove it.

## Documentation References

7. **Use variable name references**: When documentation needs to reference a credential (e.g., pgAdmin login), refer to the `.env` variable name instead of the actual value.
   - Good: "Use `DATABASE_PASSWORD` from your `.env` file"
   - Bad: "Password: `***REDACTED***`"
