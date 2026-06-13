# Mock JSON Runtime

## Purpose

This backend runs as a mock API server for UI-first eFMS flow testing. Runtime data is read from and written to `mock-data/*.json`; PostgreSQL, Prisma, SQL functions, and migrations are not used by the running app.

Use this mode for:

- Purchase Order flow testing.
- Supplier confirmation.
- LOT drag/drop and split/move behavior.
- Internal Delivery Order.
- Quotation.
- Shipment milestones and documents.
- Customs declaration.
- Carrier Delivery Order.
- Domestic Transport Order.
- Task dashboard and PO task workflow screens.

## Runtime

```txt
DATA_SOURCE=mock
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

`DATA_SOURCE=mock` is the only supported runtime mode in this project. It is kept as an explicit guardrail and documentation signal.

## Run

```bash
npm install
npm run mock:seed
npm start
```

Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run mock:seed
npm.cmd start
```

## Reset Data

CLI:

```bash
npm run mock:seed
```

API:

```http
POST /api/v1/mock/reset
POST /api/v1/mock/reload
GET /api/v1/mock/health
```

`reset` rewrites `mock-data/*.json` from `scripts/seed-mock-data.js`.

## Repository

All mock runtime reads and writes go through `src/repositories/MockJsonRepository.js`.

Generic repository operations:

- `findAll(collectionName, filter?)`
- `findById(collectionName, id)`
- `insert(collectionName, record)`
- `update(collectionName, id, patch)`
- `softDelete(collectionName, id)`
- `replaceAll(collectionName, records)`

## Collections

Core database-table coverage:

- `currencies`
- `customs_declaration_lines`
- `customs_declarations`
- `delivery_order_lines`
- `delivery_order_lots`
- `delivery_orders`
- `logistics_tasks`
- `incoterms`
- `item_customs_profiles`
- `item_groups`
- `item_master`
- `po_delivery_slots`
- `po_lot_lines`
- `po_lots`
- `purchase_order_confirmation_lines`
- `purchase_order_confirmations`
- `purchase_order_lines`
- `purchase_orders`
- `quotation_charge_lines`
- `quotation_events`
- `quotations`
- `shipment_documents`
- `shipment_lines`
- `shipment_milestones`
- `shipments`
- `supplier_transport_modes`
- `suppliers`
- `transport_modes`

Extended mock entities:

- `carrier_delivery_orders`
- `domestic_transport_orders`
- `domestic_transport_order_lines`

Screen DTO files:

- `screens/task-list`
- `screens/task-detail-task_001`
- `screens/po-tasks-po_001`

Core flow collections seed realistic PO-to-DTO scenarios with at least 9 records for item, PO, DO, shipment, customs, carrier DO, and DTO tables. `shipment_milestones` has 90 records for 9 shipments times 10 milestones. Smaller reference collections such as currencies, incoterms, transport modes, suppliers, and item groups remain compact lookup sets.

`logistics_tasks` seeds dashboard-ready work items across quotation, booking, document processing, customs declaration, warehouse delivery, and finance review so urgency cards, overdue task cards, task role progress, and monthly throughput do not render empty in the frontend demo.

Task screen APIs read and write `mock-data/screens/*.json`:

- `GET /api/v1/tasks` reads `screens/task-list`.
- `GET /api/v1/tasks/:id` reads `screens/task-detail-:id` when available and falls back to `screens/task-list`.
- `GET /api/v1/purchase-orders/:id/tasks` reads `screens/po-tasks-:id` when available and falls back to grouped task-list rows.
- `PATCH /api/v1/tasks/:id` updates mock screen state only.
- `POST /api/v1/tasks/:id/assign` updates mock screen assignee only.

Purchase order list/detail responses are enriched at runtime from related mock collections:

- LOT counts and LOT IDs come from `po_lots`.
- Total weight comes from `purchase_order_lines.gross_weight_kg`.
- Container counts and port dates come from linked `shipments`.
- Warehouse dates and PO delay days come from linked `domestic_transport_orders`.
- PO seed records are normalized with `transport_mode_id`, actual port dates, and warehouse ETA/ATA fallback dates so the purchase order UI has complete timeline data even for planning/demo POs without an active shipment.
- Delivery order seed records include route/date/warehouse fields (`planned_etd`, `planned_eta`, `origin_address`, `destination_address`, `warehouse_name`, `transport_mode_id`) and representative statuses for processing, international transit, port arrival, customs, customs-cleared, delivery, and completed tabs.
- Delivery order APIs enrich rows with linked `shipments` and `linked_shipment_number` from `shipments.delivery_order_id` so the DO board can show assigned shipment numbers instead of placeholders.
- Delivery order line APIs enrich line rows with linked item, LOT, purchase-order-line, shipment-line, and shipment data so item names, HS codes, ordered quantity, gross weight, shipment number, container, route, ETD, and ETA render from mock data.
- PO line seed data is normalized before writing JSON so frontend DTO fields such as customs profile, description, confirmed/lotted/shipped/received quantities, line ETA, and gross weight are always present.

## LOT Planning Without Slot

Active LOT Planning does not use delivery slots.

- No active `/delivery-slots` endpoints.
- No active `/move-slot` endpoint.
- `GET /api/v1/purchase-orders/:id/lot-planning` returns `purchase_order`, `po_lines`, and `lots`.
- `lots[].items[]` is enriched at runtime from PO lines, item master, and customs profiles so the frontend can render item code/name, HSCODE, ordered/lotted quantity, weight, and the nested `purchase_order_line` without extra API calls.
- LOT movement uses `POST /api/v1/po-lot-lines/:lineId/move`.
- LOT split uses `POST /api/v1/po-lot-lines/:lineId/split`.
- `po-delivery-slots.json` exists only to cover the legacy table and is ignored by LOT runtime.

Locked LOT statuses:

- `ASSIGNED_TO_SHIPMENT`
- `SHIPPED`
- `CANCELLED`

## Generic Debug API

```http
GET /api/v1/mock/:collection
GET /api/v1/mock/:collection/:id
POST /api/v1/mock/:collection
PATCH /api/v1/mock/:collection/:id
DELETE /api/v1/mock/:collection/:id
```

Collection names accept table-style names such as `purchase_orders` and file-style names such as `purchase-orders`.

## Example

```http
GET /api/v1/purchase-orders/po_001/lot-planning
```

```json
{
  "data": {
    "purchase_order": {
      "id": "po_001",
      "po_no": "PO-KBI-2026-001"
    },
    "po_lines": [],
    "lots": []
  },
  "meta": {},
  "errors": []
}
```
