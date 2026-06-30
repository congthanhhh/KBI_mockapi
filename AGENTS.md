# Repository Guidelines

**This is the canonical guide for every AI agent (Claude Code, Codex, and others) working in this repository.** `CLAUDE.md` intentionally contains no duplicated guidance — it only points here, so there is a single source of truth to keep in sync.

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

Inside `src/modules/mockV1/`:

- `mockV1.routes.js`: all domain routes (PO, DO, quotation, shipment, etc.).
- `mockV1.controller.js`: thin controllers — call the service, wrap with `success()`.
- `mockV1.service.js`: all business logic (large file, ~2600 lines).
- `mockV1.constants.js`: domain constants.

Route mounting: everything is under `/api`. Domain routes are at `/api/v1/`; master-data compatibility routes are at `/api/` (no version prefix). `src/routes/mock.js` exposes `/api/health`, `/api/v1/*`, and `/api/*`.

This is an **Express 5** app using **ES modules** (`"type": "module"`) — always use explicit `.js` extensions in imports.

## Data Layer

All persistence is file-based JSON. `MockJsonRepository` (`src/repositories/MockJsonRepository.js`) is the single data-access point. It reads/writes `mock-data/*.json` and supports:

- `findAll(name, filter)` — returns active records (excludes `is_delete: true`).
- `findById`, `insert`, `update`, `softDelete`, `replaceAll`.

Soft-delete is the standard deletion pattern: set `is_delete: true` + a `delete_at` timestamp. Every record carries the base fields `create_at`, `update_at`, `delete_at`, `is_delete`.

### Collection aliases

`mockV1.service.js` defines a `collections` map (snake_case key → kebab-case filename, e.g. `deliveryOrders → "delivery-orders"`). The generic `/api/v1/mock/:collection` endpoint also accepts snake_case names via `collectionAliases`. When writing service code, use the collection keys from the `collections` const.

### Seed data

`scripts/seed-mock-data.js` is the source of truth for initial data; `npm run mock:seed` overwrites all `mock-data/*.json` with the seed. The `mock-data/screens/` subfolder holds pre-built screen-level response fixtures (task list, task detail, PO task board) that the service reads directly when a matching screen file exists.

### ID conventions

IDs follow `<prefix>_<zero-padded-number>` (e.g. `po_001`, `lot_line_019`). New IDs come from `nextId(rows, prefix)`, which finds the current max number and increments. Document numbers use `nextDocumentNo("PREFIX-YYYY", count)`.

## Business Flow

Domain models follow this lifecycle (reversed flow — quotation gates the PO):

1. **Quotation** — standalone pre-PO freight quote (FDS → customer); 5-state
   `REQUEST_FOR_QUOTATION → DRAFT → PENDING_APPROVAL → CONFIRMED` (+ `REJECTED`);
   versioned via `quotation_group_id`. Confirming it unlocks PO creation. See BE_rule §8.
2. **Purchase Order** — created only from a `CONFIRMED` quotation (`quotation_id` required);
   then `DRAFT → SENT → CONFIRMED → READY_TO_SHIP → SHIPPED`.
3. **PO Lots** — group PO lines for shipping; can be split/moved/reordered.
4. **Delivery Order** — created from lots; tracks freight from origin to warehouse.
5. **Shipment** — created from a non-terminal DO (the old `QUOTATION_CONFIRMED` gate is
   removed); progresses through milestones.
6. **Customs Declaration** — linked to a shipment.
7. **Carrier DO** — issued after customs is cleared.
8. **Domestic Transport Order (DTO)** — last-mile delivery to warehouse.

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
  - paginated lists include `meta.page`, `meta.limit`, `meta.total`, `meta.totalPages` (see `src/utils/pagination.js`).
- Master-data compatibility endpoints keep the current frontend-compatible shapes:
  - list: `{ data, total, pagination }`
  - detail: `{ data }`
  - mutation: `{ data, message }`

## Business Rules

**`docs/BE_rule.md` is the canonical, per-entity business-rule reference** (LOT,
DO, Quotation, Shipment, Customs, Carrier DO, DTO — flow, statuses, validation,
exact payloads). Read it before changing business behavior, and update it when a
rule changes. The summaries in this file are orientation only; on any conflict,
`BE_rule.md` wins.

LOT hard invariants (kept here as a safety guardrail):

- No Slot runtime — never add `po_delivery_slots`, `slot_id`, `delivery_slot_id`,
  `/delivery-slots`, or `/move-slot` to mock LOT runtime.
- Default `LOT-001`; a PO line spans multiple LOTs only via split;
  `sum(qty_lotted)` per `purchase_order_line_id` must not exceed `qty_ordered`.
- Locked LOT statuses (`ASSIGNED_TO_SHIPMENT`, `SHIPPED`, `CANCELLED`) are
  read-only. For everything else, see `docs/BE_rule.md`.

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
