---
name: backend-api-endpoint
description: >
  Builds and updates backend API endpoints for the kbi-mock-api Express/Prisma
  service. Use whenever the user asks to add an endpoint, implement a suggested
  API, create a CRUD resource, extend backend routes, or update API behavior.
  Trigger on: "add endpoint", "write backend API", "implement API", "CRUD API",
  "suggested endpoint", "route/controller/service/repository", or any request
  to turn API docs into working backend code.
---

# Backend API Endpoint

Creates consistent Express + Prisma API modules for `kbi-mock-api` using the
repo's route/controller/service/repository pattern.

## When to Use

- A user asks to implement endpoints from `docs/suggested_endpoint.md`.
- A new CRUD resource must be added under `/api`.
- Existing route behavior, filtering, pagination, validation, or soft delete must change.
- Prisma schema, SQL docs, and API docs need to stay aligned with endpoint behavior.

## Inputs

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| endpoint_scope | YES | string | Resource or route group, such as `currencies` or `options` |
| api_contract | optional | markdown/text | Request, response, query, and error requirements |
| schema_source | optional | path | Defaults to `prisma/schema.prisma` and `docs/database.sql` |
| docs_source | optional | path | Defaults to `docs/api_doc.md` and `docs/suggested_endpoint.md` |
| verification_level | optional | string | Syntax, Prisma generate/check, or local endpoint exercise |

## Outputs

- A module under `src/modules/<feature>/` with routes, controller, service,
  repository, and constants files when the scope is resource-based.
- Registration in `src/routes/index.js`.
- Prisma schema and `docs/database.sql` updates when data model changes are required.
- `docs/api_doc.md` updates for routes, fields, query params, responses, and errors.
- Verification notes listing commands run and any environment-limited checks.

## Workflow

1. Read repository guidance - inspect `AGENTS.md`, current module files, utilities,
   Prisma schema, `docs/api_doc.md`, and `docs/suggested_endpoint.md`.
2. Extract contract - define methods, paths, body fields, query params, response
   shapes, status codes, search/filter behavior, and soft-delete expectations.
3. Confirm model fit - map the resource to an existing Prisma model or add/update
   schema and SQL docs before writing runtime code.
4. Create module files - add `<feature>.routes.js`, controller, service,
   repository, and constants following existing naming and import style.
5. Wire routes - keep route files thin, wrap handlers with `asyncHandler`, and mount
   the feature under `/api` through `src/routes/index.js`.
6. Implement controller layer - parse `req.params`, `req.query`, and `req.body`,
   call services, and return the repo-standard JSON shapes.
7. Implement service layer - validate required fields, ignore unknown fields with
   `pickAllowedFields`, enforce business rules, and throw `httpError` for expected failures.
8. Implement repository layer - keep Prisma queries only here, apply `is_delete: false`
   filters, stable ordering, search/filter `where` clauses, and soft-delete updates.
9. Add pagination - use `parsePagination` and `buildPaginationMeta` for list endpoints
   unless the contract explicitly defines a non-paginated options endpoint.
10. Update docs - reflect actual paths, methods, fields, query examples, success
    responses, and error responses in `docs/api_doc.md`.
11. Verify changes - run `node --check` on changed JS files; run
    `npm run prisma:generate` after schema edits; run `npm run prisma:check` or
    exercise endpoints locally when practical.

## Rules

- Use ES modules with explicit `.js` imports, 4-space indentation, double quotes,
  semicolons, and named exports.
- Keep route files limited to HTTP path wiring; controllers shape HTTP responses;
  services own validation/business rules; repositories own Prisma calls.
- Preserve response shapes: list `{ data, total, pagination }`, detail `{ data }`,
  mutation `{ data, message }`, error `{ message }`.
- Use `POST` for create, `DELETE` for soft delete, and follow the relevant docs for
  `PUT` versus `PATCH`; note any intentional divergence in `docs/api_doc.md`.
- Never restore legacy raw SQL pool files or import backend code outside established layers.
- Do not invent columns or relations; derive them from Prisma/schema docs or ask when
  the data model cannot be inferred safely.
- Do not perform destructive database operations without explicit user approval.

## Validation Checklist

| Check | Pass Criteria |
|-------|---------------|
| Module pattern | Routes, controller, service, repository, constants are present or intentionally unnecessary |
| Route mounted | `src/routes/index.js` exposes the endpoint under `/api` |
| Response shape | Success and error JSON match repo conventions |
| Filtering | Search/filter params from docs are implemented in Prisma `where` clauses |
| Soft delete | Delete endpoints set `is_delete` and `delete_at` when the model supports them |
| Docs aligned | `docs/api_doc.md` matches implemented paths and examples |
| Verification | Syntax checks and required Prisma commands are reported |

## Error Handling

| Situation | Action |
|-----------|--------|
| Endpoint scope is vague | Implement the smallest coherent resource and state the assumption |
| Prisma model is missing | Update schema/docs first or ask if model ownership is unclear |
| Required field is absent | Throw `httpError(400, "<field> is required")` from service layer |
| Record is missing/deleted | Throw `httpError(404, "<Resource> not found")` |
| No valid update fields | Throw `httpError(400, "No valid fields to update")` |
| Local DB is unavailable | Complete static checks and report that DB/API exercise was blocked |

## Example

**User request:** "Implement the suggested currencies endpoints."

**Expected agent output:**

- Read `docs/suggested_endpoint.md`, `docs/api_doc.md`, `prisma/schema.prisma`,
  and an existing module such as `src/modules/itemGroups`.
- Add or confirm a `Currency` Prisma model mapped to the database table, then update
  `docs/database.sql` if schema changes are required.
- Create `src/modules/currencies/currencies.routes.js`,
  `currencies.controller.js`, `currencies.service.js`,
  `currencies.repository.js`, and `currencies.constants.js`.
- Implement `GET /api/currencies`, `GET /api/currencies/:id`,
  `POST /api/currencies`, `PATCH /api/currencies/:id`, and
  `DELETE /api/currencies/:id` with `search` and `is_active` filters.
- Register `router.use("/currencies", currenciesRouter)` in `src/routes/index.js`.
- Document request fields, query examples, response bodies, and 400/404 errors in
  `docs/api_doc.md`.
- Run `node --check` for changed JS files and run Prisma verification when the schema changed.
