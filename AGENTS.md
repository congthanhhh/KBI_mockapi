# Repository Guidelines

## Response Rules

- Always be concise.
- Use bullet points.
- Do not explain unless asked.
- Prefer Vietnamese when the user writes Vietnamese.

## Project Overview

- Project: `kbi-mock-api`.
- Stack:
  - Node.js
  - Express
  - Mock JSON files
- Runtime data source: mock only.
- API prefix: `/api`.
- Server entrypoint: `src/server.js`.
- Express app config: `src/app.js`.
- Root router: `src/routes/mock.js`.
- Mock data directory: `mock-data/`.
- PostgreSQL and Prisma are not used by runtime endpoints.

## Project Structure

- `src/config/`: environment configuration.
- `src/middlewares/`: Express error and 404 handlers.
- `src/routes/mock.js`: root API router.
- `src/repositories/MockJsonRepository.js`: JSON read/write adapter.
- `src/modules/mockMasterData/`: compatibility master-data APIs.
- `src/modules/mockV1/`: logistics/import flow APIs.
- `src/utils/`: shared helpers.
- `mock-data/`: deterministic demo JSON data.
- `scripts/seed-mock-data.js`: resets mock JSON files.
- `scripts/smoke-mock-api.js`: smoke test for key API flows.
- `docs/API_CONTRACT.md`: mock API contract and runbook.

## Working Rules

- Read existing mock modules before changing behavior.
- Keep API behavior contract-first and UI-flow-first.
- Do not add PostgreSQL, Prisma, migrations, SQL triggers, or database clients.
- Do not reintroduce `src/db/prisma.js`, Prisma repositories, or legacy DB route trees.
- Keep edits scoped to the requested feature or bug.
- Preserve existing user changes; do not revert unrelated files.
- Update docs when API behavior, fields, routes, or run commands change.
- Verify changes with available commands before final response.

## API Style

- Use ES modules with explicit `.js` imports.
- Use 4-space indentation.
- Use double quotes.
- Use semicolons.
- Prefer `const`.
- Route files should only wire HTTP paths to controllers.
- Controllers should parse request data and shape responses.
- Services should own validation and business rules.
- `MockJsonRepository` should own JSON file reads/writes.
- Use `asyncHandler` for async route handlers.
- Use `error(error_code, message, details, httpStatus)` from `src/utils/apiResponse.js` for expected API errors.

## Response Shapes

- `/api/v1` logistics APIs use:
  - success: `{ data, meta, errors: [] }`
  - error: `{ data: null, meta: {}, errors: [{ error_code, message, details }] }`
- Master-data compatibility endpoints keep the current frontend-compatible shapes:
  - list: `{ data, total, pagination }`
  - detail: `{ data }`
  - mutation: `{ data, message }`

## LOT Rules

- No Slot runtime.
- Do not add `/delivery-slots`.
- Do not add `/move-slot`.
- Do not add `po_delivery_slots`, `slot_id`, or `delivery_slot_id` to mock LOT runtime.
- A new PO creates default `LOT-001`.
- Initial PO lines belong to `LOT-001`.
- A PO line can appear in multiple LOTs when quantity is split.
- Total `qty_lotted` by `purchase_order_line_id` must not exceed `qty_ordered`.
- Locked LOT statuses:
  - `ASSIGNED_TO_SHIPMENT`
  - `SHIPPED`
  - `CANCELLED`

## Commands

- `npm install`: install dependencies.
- `npm run dev`: start local API with nodemon.
- `npm start`: start production API with Node.
- `npm run mock:seed`: reset deterministic mock data.
- `npm run mock:smoke`: run smoke test for the mock API flow.

## Verification

- For JavaScript changes:
  - run `node --check <changed-file>`.
- For API behavior changes:
  - run `npm run mock:smoke`.
  - update `docs/API_CONTRACT.md` when needed.
- If a command cannot run due to environment or sandbox limits, report it clearly.

## Deployment Notes

- Backend deploy target: Render or any Node host.
- No database service is required.
- Render build command:
  - `npm ci`
- Render start command:
  - `npm start`
- Required production env:
  - `NODE_ENV=production`
  - `CORS_ORIGIN=*`
- Optional env:
  - `DATA_SOURCE=mock`

## Security

- Do not commit real credentials.
- Do not add database URLs or DB credentials.
- Keep generated `node_modules/` out of commits.
