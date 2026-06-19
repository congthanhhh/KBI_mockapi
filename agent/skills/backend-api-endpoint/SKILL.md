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
- `kbi-mock-api/docs/BE_rule.md` — **canonical business rules** (flow, statuses, per-endpoint validation). When a rule here conflicts with this skill or AGENTS.md, `BE_rule.md` wins.
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

## Data/Contract Change Workflow

Use this sequence when adding or changing a collection, field, relationship,
seed record shape, endpoint payload, or frontend-visible API surface:

1. Identify the business entity first - decide which entity owns the data and
   whether it needs a business endpoint or only generic mock collection access.
2. Update `docs/API_CONTRACT.md` when a route, request, response, entity field,
   or example payload changes.
3. Update `docs/MOCK_JSON_RUNTIME.md` when a collection, relationship,
   generated JSON file, or runtime mock rule changes.
3b. Update `docs/BE_rule.md` when a business rule, status flow, validation, or
   status-gate changes — it is the canonical business-rule reference.
4. Update `scripts/seed-mock-data.js` as the source of truth; do not treat
   `mock-data/*.json` hand edits as durable because `npm run mock:seed`
   regenerates them.
5. Run `npm run mock:seed` after seed changes so runtime JSON matches the
   source data.
6. Update `mockV1` route/controller/service only for real business behavior;
   update `mockMasterData` only for compatibility master-data behavior.
7. Validate cross-record references, for example PO lines to items, LOT lines to
   PO lines, delivery orders to LOTs, and shipments to delivery orders.
8. Run `npm run mock:smoke` for flow-impacting changes.
9. Update frontend DTOs, clients, or pages in `PROJECT-PRODUCT/frontend` when
   the API surface changes.

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

## Business Rules (LOT, DO, Quotation, Shipment, Customs, Carrier DO, DTO)

`docs/BE_rule.md` is the single source of truth for per-entity flow, statuses,
and validation — read it before changing any business behavior. Do not restate
its rules here; keep them in one place to avoid drift.

Hard guardrails (safety invariants, even if the doc is not open):

- LOT Planning has **no Slot runtime** — never expose/require `slot_id`,
  `delivery_slot_id`, `/delivery-slots`, or `/move-slot` in active LOT logic
  (`po-delivery-slots.json` is legacy table coverage only).
- Every PO has a default `LOT-001`; a PO line appears in multiple LOTs only via
  split; `sum(qty_lotted)` per `purchase_order_line_id` must not exceed
  `qty_ordered`.
- Locked LOT statuses (`ASSIGNED_TO_SHIPMENT`, `SHIPPED`, `CANCELLED`) reject
  move/split/delete/reorder.
- Status-gated creation: Carrier DO and DTO require `shipment.status =
  CUSTOMS_CLEARED`; Shipment requires `delivery_order.status =
  QUOTATION_CONFIRMED`. For exact transitions and payloads, see `BE_rule.md`.

## Workflow

1. Read the contract and existing implementation - inspect the docs, route file,
   controller, service, repository, and affected mock JSON files. Apply
   `docs/BE_rule.md` for the affected entity (flow, statuses, validation) before
   designing behavior; treat it as the source of truth on any conflict.
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
   `docs/API_CONTRACT.md`, or `docs/MOCK_JSON_RUNTIME.md` when routes, fields,
   data, or flows change. **Update `docs/BE_rule.md` whenever a business rule,
   status flow, validation, or status-gate changes** — it is the canonical rules
   doc and must not fall behind the implementation.
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
| Rules aligned | Behavior follows `BE_rule.md`; that doc is updated if a rule/flow changed |
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
