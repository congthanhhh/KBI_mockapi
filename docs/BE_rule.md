# BACKEND BUSINESS LOGIC RULES

> Purpose: This document defines backend business rules for AI/Codex when modifying the eFMS Mock API backend.

---

## 1. Current Backend Direction

The backend is now a **Mock API server**.

The backend must support frontend UI flow without depending on PostgreSQL.

Runtime direction:

```txt
Frontend
→ REST API
→ Backend Mock API
→ mock-data/screens/*.json or in-memory mock state
```

The backend must not require database setup for current UI work.

---

## 2. Data Source Rule

Use environment variable:

```txt
DATA_SOURCE=mock
```

When `DATA_SOURCE=mock`:

```txt
- Do not initialize PostgreSQL connection.
- Do not run migrations.
- Do not use SQL functions.
- Do not use FK/trigger logic.
- Do not require DATABASE_URL.
- Do not crash if PostgreSQL is unavailable.
```

Existing database files are reference only.

Do not delete database files unless explicitly requested.

---

## 3. Mock Strategy

Current mock strategy is **screen-first**, not table-first.

Prefer:

```txt
mock-data/screens/po-lot-planning-po_001.json
mock-data/screens/shipment-detail-shp_001.json
```

Over:

```txt
mock-data/purchase-orders.json
mock-data/purchase-order-lines.json
mock-data/po-lots.json
mock-data/po-lot-lines.json
```

Reason:

```txt
Frontend needs screen-ready DTOs.
UI flow is still changing.
Database relationship is not final.
```

Backend can still internally split screen data later, but current priority is UI flow.

---

## 4. Standard Response Format

All endpoints must return:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

Error response:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    {
      "error_code": "VALIDATION_ERROR",
      "message": "Invalid input",
      "details": {}
    }
  ]
}
```

Allowed error codes:

```txt
VALIDATION_ERROR
NOT_FOUND
STATE_CONFLICT
BUSINESS_RULE_VIOLATION
INTERNAL_ERROR
```

---

## 5. Core Business Flow

Backend must follow this flow:

```txt
PO
→ Supplier Confirmation
→ LOT Planning
→ Internal DO
→ Quotation
→ Shipment
→ Customs Clearance
→ Carrier DO / Cargo Release
→ DTO
```

Out of scope:

```txt
PR / Approval
Warehouse Receiving
GRN
ERP sync
Real payment
Detailed SLA engine
RBAC/users
```

---

# 6. LOT Planning Business Rules

## 6.1 Critical Rule: No Slot

There is no Slot in PO LOT Planning.

Backend must not expose active Slot concepts in LOT Planning response.

Deprecated / legacy concepts:

```txt
po_delivery_slots
delivery_slot_id
move-slot
delivery-slots
```

If old routes exist, backend should either:

```txt
- remove them
- or return 410 Gone
```

Suggested 410 message:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    {
      "error_code": "STATE_CONFLICT",
      "message": "Slot planning is deprecated. Use LOT item move/split APIs.",
      "details": {}
    }
  ]
}
```

---

## 6.2 Correct LOT Model

Correct model:

```txt
purchase_order
  1 → n lots
lot
  1 → n lot item lines
purchase_order_line
  1 → n lot item lines
```

A PO line can appear in multiple LOTs when quantity is split.

---

## 6.3 Default LOT Rule

When a PO exists, it must have at least one LOT.

Default LOT:

```txt
LOT-001
```

Initial behavior:

```txt
- All PO lines belong to LOT-001.
- User can create more LOTs.
- User can move/split item lines between LOTs.
```

---

## 6.4 LOT Planning Response

Endpoint:

```txt
GET /api/v1/purchase-orders/:id/lot-planning
```

Must return screen-ready DTO:

```json
{
  "data": {
    "purchase_order": {},
    "po_lines": [],
    "lots": [
      {
        "id": "lot_001",
        "lot_no": "LOT-001",
        "lot_name": "Default Lot",
        "status": "PLANNED",
        "sort_order": 1,
        "items": []
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

Do not return Slot columns.

Do not require frontend to join table-like data.

---

## 6.5 Create LOT

Endpoint:

```txt
POST /api/v1/purchase-orders/:id/lots
```

Request:

```json
{
  "lot_no": "LOT-002",
  "lot_name": "Second Lot",
  "planned_cargo_ready_date": "2026-07-01",
  "planned_etd": "2026-07-03",
  "planned_eta": "2026-07-10"
}
```

Rules:

```txt
- purchase_order_id must exist.
- lot_no must be unique within PO.
- new LOT starts empty.
- status default = PLANNED.
- sort_order = last sort_order + 1.
```

Return full refreshed LOT Planning board.

---

## 6.6 Move LOT Item Line

Endpoint:

```txt
POST /api/v1/po-lot-lines/:lineId/move
```

Request:

```json
{
  "target_lot_id": "lot_002",
  "target_sort_order": 1
}
```

Rules:

```txt
- Source line must exist.
- Target LOT must exist.
- Source LOT and target LOT must belong to the same PO.
- Source LOT must not be locked.
- Target LOT must not be locked.
- Move the full qty_lotted to target LOT.
- If target LOT already has same purchase_order_line_id, merge quantity.
- Remove or soft-delete source line after merge.
```

Return full refreshed LOT Planning board.

---

## 6.7 Split LOT Item Line

Endpoint:

```txt
POST /api/v1/po-lot-lines/:lineId/split
```

Request:

```json
{
  "target_lot_id": "lot_002",
  "split_qty": 40
}
```

Rules:

```txt
- Source line must exist.
- Target LOT must exist.
- Source LOT and target LOT must belong to same PO.
- Source LOT must not be locked.
- Target LOT must not be locked.
- split_qty > 0.
- split_qty < source qty_lotted.
- Source qty_lotted is reduced by split_qty.
- Target receives split_qty.
- If target already has same purchase_order_line_id, merge quantity.
```

Return full refreshed LOT Planning board.

---

## 6.8 Quantity Validation

For every purchase_order_line:

```txt
sum(qty_lotted across all LOTs) <= qty_ordered
```

Backend must block over-planning.

Error:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    {
      "error_code": "BUSINESS_RULE_VIOLATION",
      "message": "Total LOT quantity exceeds PO line quantity.",
      "details": {
        "purchase_order_line_id": "po_line_001"
      }
    }
  ]
}
```

---

## 6.9 Locked LOT Rule

Locked LOT statuses:

```txt
ASSIGNED_TO_SHIPMENT
SHIPPED
CANCELLED
```

Backend must reject:

```txt
- move
- split
- delete
- reorder item lines
```

for locked LOTs.

---

## 6.10 Delete LOT Rule

Endpoint:

```txt
DELETE /api/v1/po-lots/:lotId
```

Allowed only when:

```txt
- LOT exists.
- LOT has no items.
- LOT is not locked.
- LOT is not the last LOT of the PO.
```

Return full refreshed LOT Planning board.

---

# 7. Internal DO Rules

Internal DO is created from selected LOTs.

Internal DO is not Carrier DO.

Internal DO is not DTO.

Endpoint:

```txt
POST /api/v1/delivery-orders/from-lots
```

Request:

```json
{
  "purchase_order_id": "po_001",
  "lot_ids": ["lot_001", "lot_002"],
  "do_no": "DO-KBI-2026-001"
}
```

Rules:

```txt
- purchase_order_id must exist.
- lot_ids must not be empty.
- all LOTs must belong to the same PO.
- selected LOTs must not be locked.
- one active LOT should not belong to more than one active DO.
- copy LOT item lines into delivery_order_lines.
- create delivery_order_lots snapshots.
```

After creating DO:

```txt
delivery_order.status = READY_FOR_QUOTATION or DRAFT
```

Return DO detail screen DTO.

---

# 8. Quotation Rules

Quotation is attached to Internal DO.

Endpoints:

```txt
POST /api/v1/delivery-orders/:id/quotations
POST /api/v1/quotations/:id/create-version
POST /api/v1/quotations/:id/mark-final
```

Rules:

```txt
- Do not mutate old price directly when price changes.
- Create a new quotation version.
- Versions share quotation_group_id.
- Only one quotation in a group can be final.
```

When marking final:

```txt
quotation.status = CONFIRMED_BY_KBI
quotation.is_final = true
delivery_order.status = QUOTATION_CONFIRMED
```

Return quotation detail DTO.

---

# 9. Shipment Rules

Shipment is created from Internal DO after quotation final.

Endpoint:

```txt
POST /api/v1/shipments/from-delivery-order
```

Rules:

```txt
- delivery_order must exist.
- delivery_order.status must be QUOTATION_CONFIRMED.
- copy delivery_order_lines into shipment_lines.
- create 10 default milestones.
- update delivery_order.status = ASSIGNED_TO_SHIPMENT.
```

Shipment statuses:

```txt
BOOKING_PENDING
BOOKING_CONFIRMED
CARGO_READY
PICKED_UP
BL_ISSUED
GATE_IN_POL
IN_TRANSIT
ARRIVED
CUSTOMS_DRAFT
CUSTOMS_CLEARED
DELIVERED
CANCELLED
```

---

## 9.1 Shipment Milestones

Each shipment must have 10 milestones:

```txt
1. BOOKING_CONFIRMED
2. CARGO_READY
3. PICKED_UP
4. BL_ISSUED
5. GATE_IN_POL
6. ATD
7. CUSTOMS_DRAFT
8. ARRIVAL_NOTICE
9. CUSTOMS_CLEARED
10. DELIVERED
```

Endpoint:

```txt
POST /api/v1/shipments/:id/milestones/:code/done
```

Status mapping:

```txt
BOOKING_CONFIRMED -> BOOKING_CONFIRMED
CARGO_READY -> CARGO_READY
PICKED_UP -> PICKED_UP
BL_ISSUED -> BL_ISSUED
GATE_IN_POL -> GATE_IN_POL
ATD -> IN_TRANSIT
CUSTOMS_DRAFT -> CUSTOMS_DRAFT
ARRIVAL_NOTICE -> ARRIVED
CUSTOMS_CLEARED -> CUSTOMS_CLEARED
DELIVERED -> DELIVERED
```

Return shipment detail DTO.

---

# 10. Shipment Documents Rules

In mock mode, file upload can be simulated with JSON.

Endpoint:

```txt
POST /api/v1/shipments/:id/documents
```

Request:

```json
{
  "document_type": "BILL_OF_LADING",
  "document_no": "BL123456",
  "file_url": "/mock-files/bl123456.pdf",
  "file_name": "bl123456.pdf"
}
```

Allowed document types:

```txt
COMMERCIAL_INVOICE
PACKING_LIST
CONTRACT
BOOKING_CONFIRMATION
BILL_OF_LADING
AIR_WAYBILL
ARRIVAL_NOTICE
CERTIFICATE_OF_ORIGIN
INSURANCE
CUSTOMS_DECLARATION
EDO
POD
OTHER
```

---

# 11. Customs Rules

Customs declaration is created from Shipment.

Endpoint:

```txt
POST /api/v1/shipments/:shipmentId/customs-declarations
```

Rules:

```txt
- shipment must exist.
- shipment must not be CANCELLED.
- copy shipment_lines into customs_declaration_lines.
- enrich customs lines with item customs data if available:
  hs_code
  import_duty_rate
  vat_rate
  co_form
  preferential_tax_rate
```

Customs statuses:

```txt
DRAFT
DRAFT_OPENED
OFFICIAL_OPENED
SUBMITTED
INSPECTION
CLEARED
CANCELLED
```

---

## 11.1 Clear Customs

Endpoint:

```txt
POST /api/v1/customs-declarations/:id/clear
```

Rules:

```txt
- customs declaration must exist.
- customs declaration must have at least one line.
- status must not be CLEARED or CANCELLED.
```

When cleared:

```txt
customs_declaration.status = CLEARED
shipment.status = CUSTOMS_CLEARED
shipment milestone CUSTOMS_CLEARED = DONE
```

After this step backend may allow:

```txt
Carrier DO creation
DTO creation
```

---

# 12. Carrier DO Rules

Carrier DO is for carrier/forwarder cargo release.

Carrier DO is different from:

```txt
Internal DO
DTO
```

Endpoint:

```txt
POST /api/v1/shipments/:shipmentId/carrier-delivery-orders
```

Rules:

```txt
- shipment must exist.
- shipment.status must be CUSTOMS_CLEARED.
```

Carrier DO statuses:

```txt
PENDING
ISSUED
RELEASED
EXPIRED
CANCELLED
```

Release rule:

```txt
PENDING -> ISSUED -> RELEASED
```

Return Carrier DO detail DTO.

---

# 13. DTO Rules

DTO means Domestic Transport Order.

DTO is for inland trucking from port/airport to KBI warehouse.

## 13.1 Shipment ↔ DTO Relationship (n:n)

The relationship between Shipment and DTO is **many-to-many (n:n)**:

- One Shipment can have **multiple DTOs** (multiple truck runs, partial delivery, delivery to different warehouses).
- One DTO can serve **multiple Shipments** (LCL consolidation: one truck picks up cargo from multiple shipments in a single run).

This is modeled via a junction collection `shipment-dto-links`:

```txt
shipment-dto-links
  id           (sdl_001)
  shipment_id  → shipments.id
  dto_id       → domestic-transport-orders.id
```

Each DTO also retains a `shipment_id` FK (the primary/first shipment) for backward compatibility. Enriched DTO responses include a `shipments[]` array with all linked shipments.

## 13.2 DTO Endpoints

### Create DTO from Shipment

```txt
POST /api/v1/shipments/:shipmentId/domestic-transport-orders
```

Rules:

```txt
- shipment must exist.
- shipment.status must be CUSTOMS_CLEARED.
- copy shipment_lines into domestic_transport_order_lines.
- auto-insert a shipment-dto-links record linking the new DTO to the shipment.
```

### List DTOs linked to a Shipment

```txt
GET /api/v1/shipments/:shipmentId/domestic-transport-orders
```

Returns all active DTOs linked to the shipment via the junction table.

### Link an existing DTO to a Shipment

```txt
POST /api/v1/shipments/:shipmentId/domestic-transport-orders/link
Body: { "dto_id": "dto_005" }
```

Rules:

```txt
- shipment must exist.
- dto must exist.
- link must not already exist (no duplicate).
```

Use case: LCL consolidation — one truck DTO is linked to multiple shipments.

### Unlink a DTO from a Shipment

```txt
DELETE /api/v1/shipments/:shipmentId/domestic-transport-orders/:dtoId/unlink
```

Rules:

```txt
- soft-deletes the junction record only.
- does not delete the DTO itself.
- if this was the primary shipment_id on the DTO, the DTO retains the FK for historical reference.
```

## 13.3 DTO Statuses

```txt
DRAFT
QUOTE_PENDING
QUOTED
QUOTE_CONFIRMED
DISPATCHED
IN_TRANSIT
DELIVERED
POD_RECEIVED
CLOSED
CANCELLED
```

Dispatch rule:

```txt
DTO cannot move to DISPATCHED unless status = QUOTE_CONFIRMED.
```

Close rule:

```txt
DTO can close only after POD_RECEIVED or delivery confirmation.
```

## 13.4 DTO Response Enrichment

Every DTO response must include:

```json
{
  "shipment_id": "shp_001",
  "shipment": { ... },
  "shipments": [
    { "id": "shp_001", "shipment_no": "SHP-KBI-2026-001", ... },
    { "id": "shp_003", "shipment_no": "SHP-KBI-2026-003", ... }
  ]
}
```

- `shipment` (single object): primary linked shipment, kept for backward compat.
- `shipments[]` (array): all linked shipments from junction table, unioned with primary FK.

Return DTO detail DTO.

---

# 14. Mock Data Rules

Use deterministic IDs.

Examples:

```txt
po_001
po_line_001
lot_001
lot_line_001
do_001
qt_001
shp_001
cd_001
cdo_001
dto_001
```

Every record should have:

```txt
id
create_at
update_at
delete_at
is_delete
```

Use realistic demo data:

```txt
SDEC Supplier
Shanghai OEM Parts
FDS Forwarder
Vietnam Trucking Vendor
Diesel Engine Assembly
Oil Filter Element
Control Cabinet
Hydraulic Pump
```

---

# 15. Backend Do / Don't

## Do

```txt
- Use DATA_SOURCE=mock.
- Keep backend running without PostgreSQL.
- Return screen-ready DTOs.
- Keep response format consistent.
- Implement business rules in mock service layer.
- Return full refreshed DTO after mutation.
- Keep old database code isolated.
```

## Don't

```txt
- Do not initialize PostgreSQL in mock mode.
- Do not depend on database.sql.
- Do not expose Slot in LOT Planning.
- Do not require frontend to join table-like data.
- Do not build production-grade DB logic now.
- Do not add PR/GRN/ERP/payment unless requested.
```

---

# 16. Acceptance Criteria

Backend implementation is correct when:

```txt
- App starts with DATA_SOURCE=mock and no PostgreSQL.
- All responses follow { data, meta, errors }.
- PO List endpoint works.
- PO Detail endpoint works.
- LOT Planning endpoint works without Slot.
- Create LOT works.
- Move LOT item works.
- Split LOT item works.
- Create Internal DO from LOTs works.
- Quotation mark final updates DO status.
- Shipment creation creates 10 milestones.
- Customs clear updates Shipment to CUSTOMS_CLEARED.
- Carrier DO creation is allowed only after CUSTOMS_CLEARED.
- DTO creation is allowed only after CUSTOMS_CLEARED.
- GET /api/v1/shipments/:id/domestic-transport-orders returns all linked DTOs.
- POST /api/v1/shipments/:id/domestic-transport-orders/link links an existing DTO to a Shipment.
- DELETE /api/v1/shipments/:id/domestic-transport-orders/:dtoId/unlink soft-deletes the junction record.
- DTO response includes shipments[] array with all linked shipments.
```
