# Preview Database Runbook

This app should use three separate environments:

1. Local development: Docker Postgres on your machine
2. Preview deployments: a separate hosted Postgres database
3. Production: the live hosted Postgres database used by Vercel production

## Why this split matters

- Local work stays fast and safe
- Preview deployments can exercise real backend code without touching production data
- Production remains stable and isolated from feature work

Do not point Vercel preview deployments at a local Docker database. Vercel needs a reachable hosted database.

## Recommended preview setup

Use a separate hosted Postgres instance for preview, ideally in the same provider family as production.

Recommended options:

- A second Supabase project dedicated to preview
- A small Neon or Render Postgres database dedicated to preview

## Vercel environment layout

Set the same variable names in each Vercel environment, but give Preview and Production different values.

Required backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` if checkout is being tested in preview

Required frontend variables when preview needs Easyship or Supabase client access:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EASYSHIP_SAND`

## Setup steps

### 1. Create the preview database

- Provision a dedicated hosted Postgres database
- Run the existing Prisma migrations against it
- Seed it with a safe preview dataset if needed

### 2. Configure Vercel Preview variables

In Vercel, add the variables above to the Preview environment only.

Use:

- Preview `DATABASE_URL` -> preview database connection string
- Preview `JWT_SECRET` -> preview-only JWT secret
- Production `DATABASE_URL` -> production database connection string
- Production `JWT_SECRET` -> production-only JWT secret

### 3. Validate the preview environment

After pushing a feature branch and letting Vercel build a preview deployment:

- Open `/health`
- Log in through the preview app
- Load dashboard data
- Test one protected API request
- Confirm no production records were changed

## Local development

Keep local development on Docker and local env variables.

Use local-only values for:

- `LOCAL_USER`
- `LOCAL_HOST`
- `LOCAL_DATABASE`
- `LOCAL_PASSWORD`
- `LOCAL_PORT`
- `JWT_SECRET`

## Promotion rules

- Local branch work uses Docker locally
- Preview deploys use the preview hosted database
- Production deploys only happen from `main`
- Never reuse production credentials in preview

## Suggested first cut

If you want the least operational overhead, create one preview database and reuse it for all feature-branch Vercel previews. Keep it as disposable data.
