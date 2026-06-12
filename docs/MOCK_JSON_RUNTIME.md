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

Core flow collections seed realistic PO-to-DTO scenarios with at least 9 records for item, PO, DO, shipment, customs, carrier DO, and DTO tables. `shipment_milestones` has 90 records for 9 shipments times 10 milestones. Smaller reference collections such as currencies, incoterms, transport modes, suppliers, and item groups remain compact lookup sets.

## LOT Planning Without Slot

Active LOT Planning does not use delivery slots.

- No active `/delivery-slots` endpoints.
- No active `/move-slot` endpoint.
- `GET /api/v1/purchase-orders/:id/lot-planning` returns `purchase_order`, `po_lines`, and `lots`.
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
