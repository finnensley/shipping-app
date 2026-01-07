# Copilot Instructions for shipping-app

## Project Architecture

- **Frontend:** React (Vite, TailwindCSS), Redux for app state, React Router for navigation. UI logic is in `src/components`, pages in `src/pages`, and Redux slices in `src/features/*`.
- **Backend:** Node.js/Express API (`src/server.js`), routes in `src/routes`, controllers in `src/controllers`, services in `src/services`. Data access via Prisma ORM and direct SQL for some operations.
- **Database:** PostgreSQL (via Docker), Prisma schema in `prisma/schema.prisma`. Data files and CSVs in `src/data`.
- **Testing:** Jest, Supertest, React Testing Library. Tests in `__tests__`.

## Developer Workflows

- **Start backend:** `node src/server.js` or `npx nodemon src/server.js` (auto-reload)
- **Start frontend:** `npm run dev`
- **Start database:** `docker-compose up postgres` (requires Docker Desktop)
- **Prisma:**
  - Generate client: `npx prisma generate` (set `DATABASE_URL` in env)
  - Open studio: `npx prisma studio`
- **Testing:**
  - Run all tests: `npm test`
  - Test installs: see README for required dev dependencies

## Key Patterns & Conventions

- **Redux:**
  - Use Redux for shared/business state, useState only for local UI state
  - State updates via `dispatch(action())`, reads via `useSelector()`
- **Data Flow:**
  - Frontend uses Axios (see `useFetchData.jsx`) to call Express API endpoints
  - Backend controllers/services handle business logic and DB updates
- **Order & Inventory Logic:**
  - Orders and inventory are tightly coupled; order creation/deduction logic in backend
  - Statuses: `open`, `staged`, `packed`, `shipped`, etc. (see order logic in server/controllers)
  - Picking/packing flows: items move to staging, then packing, then update inventory
- **CSV Import:**
  - Use psql `\copy` for bulk CSV import (see README for command)
- **Easyship Integration:**
  - SDK used for carrier rates, API key in `.env` as `EASYSHIP_SAND`

## Troubleshooting & Tips

- **Prisma issues:**
  - If CLI not found, reinstall locally: `npm install prisma --save-dev`
  - Always set `DATABASE_URL` before running Prisma commands
- **Permissions:**
  - Docker/Postgres may require manual chown or direct env export
- **Syncing DB/UI:**
  - If DB updated directly, run manual SQL to sync UI/backend (see README for query)

## References

- See [README.md](../README.md) for full setup, DB commands, and workflow details
- Key files: `src/server.js`, `src/routes/*`, `src/controllers/*`, `src/features/*`, `prisma/schema.prisma`, `src/data/*`, `__tests__/*`

---

_Iterate and update this file as new patterns emerge or workflows change. Ask for feedback if any section is unclear or incomplete._
