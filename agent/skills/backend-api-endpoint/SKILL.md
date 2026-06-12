---
name: backend-api-endpoint
description: >
  Build, refactor, or review mock-only Express API endpoints in kbi-mock-api.
  Use when Codex must add a route, change controller/service behavior, update
  MockJsonRepository usage, align backend responses with frontend DTOs, extend
  mock-data collections, or sync docs with the current API contract. Trigger on
  "add backend endpoint", "fix mock API", "implement /api/v1", "update
  route/controller/service", "wire frontend DTO", "mock JSON endpoint", or
  requests involving kbi-mock-api endpoint behavior.
---

# Backend API Endpoint

Implement contract-first backend behavior for the mock-only `kbi-mock-api`
Express server.

## Project Sources

Read these first when the task touches API behavior:

- `kbi-mock-api/AGENTS.md`
- `kbi-mock-api/docs/API_CONTRACT.md`
- `kbi-mock-api/docs/MOCK_JSON_RUNTIME.md`
- `kbi-mock-api/src/routes/mock.js`
- `kbi-mock-api/src/repositories/MockJsonRepository.js`
- Relevant files in `kbi-mock-api/src/modules/mockV1`
- Relevant files in `kbi-mock-api/src/modules/mockMasterData`
- Relevant JSON files in `kbi-mock-api/mock-data`

## Runtime Contract

- Runtime is mock JSON only.
- Do not add PostgreSQL, Prisma, TypeORM, Sequelize, Knex, SQL migrations,
  database pools, database URLs, or `src/db/prisma.js`.
- Server entrypoint is `src/server.js`; root API router is `src/routes/mock.js`.
- Business endpoints are mounted under `/api/v1`.
- Master-data compatibility endpoints are mounted under `/api`.
- Generic mock debug endpoints are mounted under `/api/v1/mock`.
- All runtime persistence must go through `MockJsonRepository`.

## Response Rules

Use this shape for `/api/v1/*`:

```json
{ "data": {}, "meta": {}, "errors": [] }
```

Expected errors must use:

```json
{
  "data": null,
  "meta": {},
  "errors": [{ "error_code": "VALIDATION_ERROR", "message": "...", "details": {} }]
}
```

Use these error codes only unless the contract is extended:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `STATE_CONFLICT`
- `BUSINESS_RULE_VIOLATION`
- `INTERNAL_ERROR`

Master-data compatibility endpoints may keep current frontend shapes:

- list: `{ data, total, pagination }`
- detail: `{ data }`
- mutation: `{ data, message }`

## Mock Data Rules

- Keep deterministic string IDs such as `po_001`, `lot_001`, `do_001`,
  `qt_001`, `shp_001`, `cd_001`, `cdo_001`, and `dto_001`.
- Core PO-to-DTO seed collections have at least 9 realistic records;
  `shipment-milestones.json` has 90 records for 9 shipments.
- Keep system fields on records: `create_at`, `update_at`, `delete_at`,
  `is_delete`.
- Add or update seed data in `scripts/seed-mock-data.js`, then regenerate JSON
  with `npm run mock:seed`.
- Use table-style collection names in generic routes when helpful, such as
  `purchase_orders`, while repository files remain kebab-case JSON files.

## Endpoint Families

Prefer business endpoints from `API_CONTRACT.md`.

Use `/api/v1/mock/:collection` only for debug or fallback CRUD when no business
endpoint exists:

- `GET /api/v1/mock/:collection`
- `GET /api/v1/mock/:collection/:id`
- `POST /api/v1/mock/:collection`
- `PATCH /api/v1/mock/:collection/:id`
- `DELETE /api/v1/mock/:collection/:id`
- `POST /api/v1/mock/reset`
- `POST /api/v1/mock/reload`
- `GET /api/v1/mock/health`

Do not invent old database-first action routes such as `/move-slot`,
`/delivery-slots`, `/submit-to-kbi`, `/confirm-quotation`,
`/assign-to-shipment`, or `/mark-ready-to-ship` unless the contract is updated.

## LOT Rules

- Active LOT Planning has no Slot runtime.
- `po-delivery-slots.json` may exist only as legacy table coverage.
- Do not expose slots in `GET /api/v1/purchase-orders/:id/lot-planning`.
- Do not require or write `delivery_slot_id` or `slot_id` in active LOT logic.
- A new PO creates default `LOT-001`.
- Initial PO lines belong to `LOT-001`.
- A PO line can appear in multiple LOTs only through split quantity.
- Move line: move the full LOT line to target LOT and merge quantities when the
  target already has the same `purchase_order_line_id`.
- Split line: `split_qty > 0`, `split_qty < source.qty_lotted`, source and
  target LOTs must be unlocked, then reduce source and create or merge target.
- Total `qty_lotted` by `purchase_order_line_id` must not exceed `qty_ordered`.
- Locked LOT statuses are `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, and `CANCELLED`.

## Workflow

1. Read the contract and existing implementation - inspect the docs, route file,
   controller, service, repository, and affected mock JSON files.
2. Choose the endpoint family - use `/api/v1` business routes when present;
   use `/api` only for compatibility master data; use `/api/v1/mock` only as
   documented fallback/debug behavior.
3. Update routes thinly - wire HTTP paths to controller functions and wrap async
   handlers with `asyncHandler`.
4. Update controllers narrowly - parse params, query, and body; call service
   functions; return `success(data, meta)` or compatibility shapes as appropriate.
5. Implement service rules - validate required fields, enforce state transitions,
   preserve UI flow behavior, and throw `error(error_code, message, details,
   statusCode)` for expected failures.
6. Persist through repository - use `MockJsonRepository` for all JSON reads and
   writes; keep file I/O out of controllers.
7. Update seed and docs - change `scripts/seed-mock-data.js`,
   `docs/API_CONTRACT.md`, `docs/MOCK_JSON_RUNTIME.md`, or
   `docs/API_CONTRACT.md` when routes, fields, data, or flows change.
8. Validate - run syntax checks for changed JS files, run `npm run mock:seed`
   when seed changed, and run `npm run mock:smoke` for flow-impacting changes.

## Validation Checklist

| Check | Pass Criteria |
|---|---|
| Runtime clean | No PostgreSQL/Prisma/database code is added or executed |
| Route mounted | Endpoint is reachable through `src/routes/mock.js` |
| Response aligned | `/api/v1` uses `{ data, meta, errors }` |
| Data persisted | Mutations update mock JSON through `MockJsonRepository` |
| LOT safe | No active slot fields/routes are introduced |
| Seed stable | Required collections and deterministic IDs are preserved |
| Docs aligned | Contract docs match implemented routes and payloads |
| Verified | `node --check` and relevant mock smoke checks are reported |

## Example

Task: "Add a mock endpoint to release a Carrier DO."

Expected approach:

1. Read `API_CONTRACT.md`, `mockV1.routes.js`, `mockV1.controller.js`,
   `mockV1.service.js`, and `mock-data/carrier-delivery-orders.json`.
2. Confirm the route exists in contract:
   `POST /api/v1/carrier-delivery-orders/:id/release`.
3. Add or adjust route/controller/service behavior using `MockJsonRepository`.
4. Validate state flow, for example `ISSUED -> RELEASED`.
5. Return `/api/v1` response shape.
6. Run `node --check` on changed files and `npm run mock:smoke` if the flow is
   covered or impacted.
