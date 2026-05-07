# Branch Workflow

## Default workflow

Use `main` as the only production branch.

Create a short-lived branch for each feature, fix, or schema change.

Examples:

- `feature/packing-label-refresh`
- `fix/auth-preview-login`
- `chore/prisma-cleanup`

## Day-to-day flow

1. Pull the latest `main`
2. Create a new branch
3. Run Docker locally for the database
4. Make the change and test locally
5. Push the branch
6. Validate the Vercel preview deployment
7. Open a pull request
8. Merge to `main` only after the checklist passes
9. Let Vercel deploy production from `main`

## Database change rules

- Create schema changes locally first
- Test migrations against local Docker Postgres
- Validate branch behavior in preview before merge
- Back up production before risky schema changes

## Environment rules

- Local development uses Docker Postgres and local env values
- Preview deployments use the preview hosted database
- Production uses the production hosted database
- Never point preview or local work at production unless a one-off incident requires it

## Deployment rules

- `main` must stay deployable
- Do not merge broken builds into `main`
- Do not rely on local-only services for Vercel deployments
- Keep feature branches short-lived to reduce merge drift

## When to use a longer-lived branch

Only introduce a shared integration branch if multiple large changes must be combined before production. For the current size of this app, `main` plus short-lived feature branches is the preferred default.
