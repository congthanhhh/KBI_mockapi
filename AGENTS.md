# Repository Guidelines

## Response Rules

- Always be concise.
- Use bullet points.
- Do not explain unless asked.
- Prefer Vietnamese when the user writes Vietnamese.

## Agentic Working Rules

- Act as a fullstack agentic developer for this repository.
- Read existing code before changing behavior.
- Prefer implementing the requested change end to end.
- Keep edits scoped to the requested feature or bug.
- Preserve existing user changes; do not revert unrelated files.
- Update docs when API behavior, fields, routes, or deployment steps change.
- Verify changes with available commands before final response.
- Report commands run and any failures briefly.

## Project Overview

- Project: `kbi-mock-api`.
- Stack:
  - Node.js
  - Express
  - PostgreSQL
  - Prisma
  - Render
  - Neon
- API prefix: `/api`.
- Server entrypoint: `src/server.js`.
- Express app config: `src/app.js`.
- Prisma client setup: `src/db/prisma.js`.

## Project Structure

- `src/config/`: environment configuration.
- `src/db/`: Prisma database client.
- `src/middlewares/`: Express error and 404 handlers.
- `src/routes/index.js`: root API router.
- `src/utils/`: shared helpers.
- `src/modules/health/`: health check API.
- `src/modules/itemGroups/`: item group APIs.
- `src/modules/items/`: item APIs and nested customs profile create/list routes.
- `src/modules/itemTaxProfiles/`: standalone customs profile update/delete routes.
- `prisma/schema.prisma`: Prisma schema and database model mappings.
- `docs/database.sql`: current SQL schema reference.
- `docs/api_doc.md`: API documentation.
- `scripts/check-prisma.js`: database and Prisma verification script.

## Current Database Models

- `ItemGroup` maps to `item_groups`.
- `ItemMaster` maps to `item_master`.
- `ItemCustomsProfile` maps to `item_customs_profiles`.
- Use soft delete with:
  - `is_delete`
  - `delete_at`
- Do not reintroduce legacy raw SQL pool usage.

## API Modules

- Health:
  - `GET /api/health`
- Item groups:
  - `GET /api/item-groups`
  - `GET /api/item-groups/:id`
  - `GET /api/item-groups/:id/items`
  - `POST /api/item-groups`
  - `PUT /api/item-groups/:id`
  - `DELETE /api/item-groups/:id`
- Items:
  - `GET /api/items`
  - `GET /api/items/:id`
  - `POST /api/items`
  - `PUT /api/items/:id`
  - `DELETE /api/items/:id`
- Item customs profiles:
  - `GET /api/items/:id/tax-profile`
  - `POST /api/items/:id/tax-profile`
  - `PUT /api/item-tax-profiles/:id`
  - `DELETE /api/item-tax-profiles/:id`

## Module Pattern

- Keep each feature under `src/modules/<feature>/`.
- Use this file pattern:
  - `<feature>.routes.js`
  - `<feature>.controller.js`
  - `<feature>.service.js`
  - `<feature>.repository.js`
  - `<feature>.constants.js`
- Route files should only wire HTTP paths to controllers.
- Controllers should parse request data and shape responses.
- Services should handle validation and business rules.
- Repositories should contain Prisma queries only.
- Constants should hold allowed request fields and shared field lists.

## Coding Style

- Use ES modules with explicit `.js` imports.
- Use 4-space indentation.
- Use double quotes.
- Use semicolons.
- Prefer `const`.
- Keep response shape consistent:
  - list: `{ data, total, pagination }`
  - detail: `{ data }`
  - mutation: `{ data, message }`
  - error: `{ message }`
- Use `asyncHandler` for async route handlers.
- Use `httpError(statusCode, message)` for expected API errors.
- Use `pickAllowedFields` to ignore unknown request fields.
- Use `parsePagination` and `buildPaginationMeta` for paginated lists.

## Database Guidelines

- Use Prisma for runtime database access.
- Keep `docs/database.sql` aligned with `prisma/schema.prisma`.
- Run `npm run prisma:generate` after Prisma schema changes.
- Keep `pg` dependency because Prisma adapter uses it.
- Do not restore deleted legacy files:
  - `src/db/pool.js`
  - `scripts/check-db.js`
  - `scripts/init-db.js`

## Commands

- `npm install`: install dependencies.
- `npm run dev`: start local API with nodemon.
- `npm start`: start production API with Node.
- `npm run prisma:generate`: generate Prisma client.
- `npm run prisma:check`: verify Prisma and database access.
- `npm run prisma:studio`: open Prisma Studio.

## Verification

- For JavaScript changes:
  - run `node --check <changed-file>`.
- For Prisma or database behavior changes:
  - run `npm run prisma:generate`.
  - run `npm run prisma:check`.
- For API behavior changes:
  - update `docs/api_doc.md`.
  - exercise affected endpoint locally when practical.
- If a command cannot run due to missing env or sandbox limits, report it clearly.

## Deployment Notes

- Backend deploy target: Render.
- Database target: Neon Postgres.
- Render build command:
  - `npm ci`
- Render start command:
  - `npm start`
- Required production env:
  - `DATABASE_URL=<Neon URL>`
  - `PGSSL=true`
  - `NODE_ENV=production`
  - `CORS_ORIGIN=*`
- Root Directory:
  - leave blank if `package.json` is at repo root.
  - set `kbi-mock-api` if this project is inside a monorepo folder.

## Security

- Do not commit real credentials.
- Use `.env` locally.
- Prefer `DATABASE_URL` for Neon.
- Set `PGSSL=true` only when SSL is required.
- Avoid logging secrets, connection strings, or passwords.

## Commit And PR Notes

- Use clear imperative commit messages.
- Include API changes, database changes, commands run, and sample responses for API PRs.
- Keep generated `node_modules/` out of commits.
