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

## 5.2 RFQ and Quotation Options

RFQ (`quotation_requests` + `quotation_request_lines`) is the inbound KBI-entered
request before an FDS quotation. It is PO-shaped: supplier, customer SAP PO
reference, incoterm, mode, route, currency, cargo hints, and item lines. It is
not derived from a FDS internal PO.
It has its own lifecycle:

```txt
SUBMITTED -> RECEIVED -> QUOTED -> CONFIRMED
SUBMITTED|RECEIVED|QUOTED -> CANCELLED
```

Rules:

```txt
- RFQ links to quotations through quotations.rfq_id.
- Creating a quotation from an RFQ copies customer_ref, supplier_id, currency_code,
  incoterm_code, mode, origin_port and destination_port, then moves the RFQ to QUOTED.
- A quotation can expose multiple quotation_options with carrier, ETD/ETA,
  transit time, risk warning and headline amount.
- KBI must select one option before a quotation can be confirmed/finalized.
- Confirming a quotation linked to an RFQ moves that RFQ to CONFIRMED.
- `GET /api/v1/currency-rates` returns seeded `{ code, vnd_rate }` rows with
  VND as base `1`; no live bank/API source is used by the mock.
- Quotation charge lines persist `currency_code` and `charge_group`
  (`FREIGHT|ORIGIN|DESTINATION`). The frontend normalizes quote comparison
  totals to VND with the seeded rate table while each line keeps its own currency.
- The FDS internal PO may be created after quotation confirmation; its goods
  lines can be prefilled from the originating RFQ lines.
```

## 5.1 PO lifecycle_status (resolved stage)

Every enriched PO carries a computed `lifecycle_status` — the **laggard
(least-advanced) linked shipment's status**, mapped into the PO stage taxonomy.
A PO is only as far along as its slowest shipment.

```txt
- shipment.status -> PO lifecycle code:
    BOOKING_PENDING|BOOKING_CONFIRMED|CARGO_READY -> CARGO_READY
    PICKED_UP|BL_ISSUED|GATE_IN_POL               -> (same code)
    ATD|IN_TRANSIT                                -> IN_TRANSIT
    ARRIVAL_NOTICE|ARRIVED                        -> ARRIVED
    CUSTOMS_DRAFT|CUSTOMS_CLEARED                 -> (same code)
    DELIVERED                                     -> DELIVERED
- stage order: PROCUREMENT < PRODUCTION < IN_TRANSIT < CUSTOMS < DELIVERED < CANCELLED.
- laggard = the linked shipment with the smallest stage order.
- No active shipment yet -> lifecycle_status = the PO's own status
  (DRAFT/SENT/CONFIRMED/IN_PRODUCTION/READY_TO_SHIP).
- po.status === CANCELLED -> CANCELLED.
```

The frontend reads `lifecycle_status` as the single source of truth for the PO
stage badge (`resolvePoStage`); it only falls back to a client-side timeline
derivation when the field is absent. Keep the mapping in sync with the frontend
`poStageConfig` taxonomy.

---

# 6. LOT Planning Business Rules

## 6.1 Critical Rule: No Slot

There is no Slot in PO LOT Planning.

Backend must not expose active Slot concepts in LOT Planning response.

Deprecated / legacy concepts (do not reintroduce):

```txt
po_delivery_slots
delivery_slot_id
move-slot
delivery-slots
```

The legacy `po-delivery-slots` collection has been **removed** from the seed, mock-data, and
`collections`/alias maps — it is no longer part of the runtime schema.

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
  "lot_ids": ["lot_001", "lot_002"],
  "delivery_order_no": "DO-KBI-2026-001",
  "requested_pickup_date": "2026-07-01",
  "planned_etd": "2026-07-03",
  "planned_eta": "2026-07-10",
  "origin_address": "Shanghai Port",
  "destination_address": "Cat Lai Port",
  "notes": "Created from PO LOT Planning"
}
```

Rules:

```txt
- lot_ids must not be empty.
- all LOTs must belong to the same PO.
- selected LOTs must not be locked.
- one active LOT should not belong to more than one active DO.
- route resolution for DO origin/destination is request body first, then primary LOT origin_port/destination_port, then PO header origin_port/destination_port, then mock defaults.
- copy LOT item lines into delivery_order_lines.
- create delivery_order_lots snapshots.
```

PO / LOT route fields:

```txt
- purchase_orders accept free-text `origin_port` and `destination_port`.
- PO create copies those fields into the default LOT.
- po_lots accept per-LOT `origin_port` and `destination_port` overrides.
- Country is not stored here; frontend derives origin country from supplier.country and displays destination country as VN.
```

After creating DO:

```txt
delivery_order.status = READY_FOR_QUOTATION or DRAFT
```

Return DO detail screen DTO.

## DO screen-DTO (backend-owned)

The backend serves the DO screen-DTO the frontend renders directly:

```txt
GET /api/v1/delivery-orders/screen        (list)
GET /api/v1/delivery-orders/:id/screen    (detail)
```

The frontend no longer synthesizes screen fields; the backend computes the real values:

```txt
- task_summary       : from logistics-tasks matched by do_number
                       (total / completed / blocked / required_tasks_remaining).
- missing_documents  : REJECTED shipment documents of the DO's linked shipment(s).
                       NOTE: this is "rejected", NOT "not yet uploaded". For the
                       upload-completeness gate use documents_outstanding below.
- required_documents : codes from the admin-configurable `document-types` catalog
                       where is_required = true (falls back to Invoice / Packing List
                       / B/L / CO when the catalog is empty).
- documents_complete : true when every required type has >= 1 usable DO document
                       (status RECEIVED or better; REJECTED/CANCELLED ignored).
- documents_outstanding : required types with NO usable file (blocks DO closure).
- documents_unverified  : required types that have file(s) but none VERIFIED
                          (soft warning only; RECEIVED still opens the gate).
- actual_entry_date  : from a linked DTO that reached POD_RECEIVED / CLOSED.
- order_info.status  : derived (see below) — NOT the raw delivery_order.status.
```

The same `documents_complete` / `documents_outstanding` / `documents_unverified`
signal is mirrored onto the shipment record (`GET /api/v1/shipments/:id`) from its
parent DO so the shipment milestone panel can show the badge without recomputing it.

### document-types (master data)

`document-types` is a reference master collection (`GET/POST/PATCH/DELETE
/api/document-types`) — the admin-configurable catalog that owns which DO document
types are required (`is_required`), mirroring the Task Template `is_required_for_closure`
pattern. Fields: `code` (matches DO `document_type`), `label_en`, `label_vi`,
`is_required`, `sort_order`, `is_active`. It is the single source for the required set;
`REQUIRED_DO_DOCUMENT_TYPES` remains only as an empty-catalog fallback.

### DO screen status is derived from the linked shipment

The runtime flow only advances the DO record up to `ASSIGNED_TO_SHIPMENT` (set when
a shipment is created from the DO). The transit/customs/delivered journey lives on
the **shipment**, not the DO, so the screen-DTO `order_info.status` is derived — the
DO status is not stored twice:

```txt
- DO own status CANCELLED or CLOSED -> keep it (terminal).
- No active linked shipment -> the DO's own status (e.g. DRAFT / WAREHOUSE_PENDING).
  (READY_FOR_QUOTATION / QUOTATION_CONFIRMED are legacy — quotation is decoupled from
  the DO in the reversed flow.)
- Otherwise -> the LAGGARD (least-advanced) linked shipment's status, mapped to the
  DO taxonomy:
    BOOKING_*/CARGO_READY              -> ASSIGNED_TO_SHIPMENT
    PICKED_UP/BL_ISSUED/GATE_IN_POL/ATD/IN_TRANSIT -> IN_TRANSIT
    ARRIVAL_NOTICE/ARRIVED             -> ARRIVED_PORT
    CUSTOMS_DRAFT                      -> CUSTOMS_PROCESSING
    CUSTOMS_CLEARED                    -> CUSTOMS_CLEARED
    DELIVERED                          -> DELIVERED
```

A DO is only as far along as its slowest shipment. This mirrors the PO
`lifecycle_status` rule (§5.1); keep the mapping in sync with the frontend
`deliveryOrderStatusTabs` taxonomy.

---

# 8. Quotation Rules (reversed flow)

Quotation is a **standalone pre-PO freight quotation** (FDS → customer). It is created
independently of any DO/PO, carrying its own `customer_ref` + `incoterm_code` + `mode` +
freight `charge_lines`; `ref_type`/`ref_id` are nullable. Confirming a quotation unlocks
PO creation (see §6 Purchase Orders).

Endpoints:

```txt
POST /api/v1/quotations                       # standalone create (initial DRAFT)
POST /api/v1/delivery-orders/:id/quotations   # legacy DO-scoped create (back-compat)
POST /api/v1/quotations/:id/create-version
POST /api/v1/quotations/:id/request           # -> REQUEST_FOR_QUOTATION
POST /api/v1/quotations/:id/receive           # REQUEST_FOR_QUOTATION -> DRAFT
POST /api/v1/quotations/:id/submit-to-kbi     # DRAFT -> PENDING_APPROVAL
POST /api/v1/quotations/:id/negotiate         # KBI/FDS line-level price negotiation
POST /api/v1/quotations/:id/mark-final        # -> CONFIRMED
POST /api/v1/quotations/:id/confirm-by-kbi    # -> CONFIRMED
POST /api/v1/quotations/:id/reject            # -> REJECTED, body { reason }
POST /api/v1/quotations/:id/cancel            # -> REJECTED (reason "Cancelled")
```

Rules:

```txt
- Do not mutate old price directly when price changes; create a new version.
- Versions share quotation_group_id; only one quotation in a group can be CONFIRMED.
- reject stores body.reason as reject_reason.
- negotiate stores quotation_line_adjustments rows per changed charge line, updates charge-line unit_price/amount/tax_amount/total_amount, and appends a quotation_events NEGOTIATE event.
- KBI negotiate is allowed only from PENDING_APPROVAL and moves the quotation to PENDING_ADJUSTMENT; FDS negotiate is allowed only from PENDING_ADJUSTMENT and moves it back to PENDING_APPROVAL.
```

5-state forward flow (who acts):

```txt
REQUEST_FOR_QUOTATION (KBI RFQ) -> DRAFT (FDS) -> PENDING_APPROVAL (FDS submits)
  -> CONFIRMED (KBI)        ; any non-terminal -> REJECTED (KBI)
```

```txt
- request / receive / submit-to-kbi each enforce a legal from-state and reject an
  illegal transition with STATE_CONFLICT (409).
- Each transition appends a quotation_events row, mirroring mark-final.
- mark-final/confirm-by-kbi no longer touch any delivery_order status (quotation is
  decoupled from the DO).
```

When marking final:

```txt
quotation.status = CONFIRMED
quotation.is_final = true
(no delivery_order side-effect)
```

Return quotation detail DTO.

---

# 9. Shipment Rules

Shipment is created from an Internal DO (quotation no longer gates the DO).

Endpoint:

```txt
POST /api/v1/shipments/from-delivery-order
```

Rules:

```txt
- delivery_order must exist.
- delivery_order.status must NOT be CANCELLED / CLOSED / ASSIGNED_TO_SHIPMENT
  (the old QUOTATION_CONFIRMED gate is removed).
- copy delivery_order_lines into shipment_lines.
- create 10 default milestones.
- booking info (carrier / bl_awb_no / vessel_flight) is captured on the shipment here.
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
body (optional): { actual_at, notes }
```

Marking a milestone done:
- sets the milestone `actual_at` from `body.actual_at` (falls back to now) and `status = DONE`;
- mirrors the actual date onto the shipment so downstream consumers (PO logistics
  timeline reads `firstShipment.atd/ata`) show it:
  - `ATD` → `shipment.atd`
  - `ARRIVAL_NOTICE` → `shipment.ata`
  - warehouse ATA is NOT set here — it comes from the DTO `actual_delivery_at`.

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
SUBMITTED      (reserved — not produced by the mock yet)
INSPECTION     (reserved — not produced by the mock yet)
CLEARED
CANCELLED
```

Transitions (each persists its action payload — do not drop the body):

```txt
POST /customs-declarations/:id/open-draft     DRAFT       -> DRAFT_OPENED      (draft_opened_at)
POST /customs-declarations/:id/open-official   DRAFT|DRAFT_OPENED -> OFFICIAL_OPENED
                                               (official_opened_at, + customs_channel, declaration_no if sent)
POST /customs-declarations/:id/clear           OFFICIAL_OPENED -> CLEARED       (cleared_at, + note)
POST /customs-declarations/:id/cancel          (any non-terminal) -> CANCELLED  (cancel_reason, note)
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

Endpoints:

```txt
GET    /api/v1/shipments/:shipmentId/carrier-delivery-orders   (list for a shipment)
POST   /api/v1/shipments/:shipmentId/carrier-delivery-orders   (create, requires CUSTOMS_CLEARED)
GET    /api/v1/carrier-delivery-orders/:id
POST   /api/v1/carrier-delivery-orders/:id/issue               (PENDING -> ISSUED)
POST   /api/v1/carrier-delivery-orders/:id/release             (ISSUED -> RELEASED)
POST   /api/v1/carrier-delivery-orders/:id/cancel
```

Create rules:

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

Optional body fields (used by the shared container-aware create modal):

```txt
- container_ids[]   : containers of THIS shipment to allocate to the new DTO. Each must belong
                      to the shipment (else VALIDATION_ERROR); selected containers get dto_id set
                      and their container_no copied onto the DTO.
- truck_vendor_id   : trucking vendor (default sup_vn_trucking).
- warehouse         : destination warehouse (default "KBI Main Warehouse").
- scheduled_pickup_at, note, etc.
```

For multi-shipment consolidation (LCL) use the dedicated atomic endpoint:

```txt
POST /api/v1/domestic-transport-orders/consolidate
Body: { shipment_ids[], primary_shipment_id?, container_ids?, truck_vendor_id?, warehouse?, scheduled_pickup_at?, note? }
```

Rules:

```txt
- requires >= 2 shipments; all must be CUSTOMS_CLEARED and share the same pod (else BUSINESS_RULE_VIOLATION).
- creates the DTO on the primary shipment, then links the others and reassigns their selected containers.
- one server-side call replaces the old client-side create + link + container loop (atomic from the UI's view).
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

POD rule:

```txt
POST /api/v1/domestic-transport-orders/:id/pod-received moves DELIVERED -> POD_RECEIVED
(otherwise BUSINESS_RULE_VIOLATION). PATCH also accepts quote_amount / quote_currency
for the inland freight quote.
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
- Quotation create is standalone (no DO); mark-final sets CONFIRMED without any DO side-effect.
- PO create is rejected unless quotation_id references a CONFIRMED quotation.
- Shipment creation creates 10 milestones.
- Customs clear updates Shipment to CUSTOMS_CLEARED.
- Carrier DO creation is allowed only after CUSTOMS_CLEARED.
- GET /api/v1/shipments/:id/carrier-delivery-orders returns the carrier DOs for that shipment.
- DTO creation is allowed only after CUSTOMS_CLEARED.
- GET /api/v1/shipments/:id/domestic-transport-orders returns all linked DTOs.
- POST /api/v1/shipments/:id/domestic-transport-orders/link links an existing DTO to a Shipment.
- DELETE /api/v1/shipments/:id/domestic-transport-orders/:dtoId/unlink soft-deletes the junction record.
- DTO response includes shipments[] array with all linked shipments.
```

---

# 17. Master Data Rules

Master data uses **compatibility endpoints under `/api`** (NOT `/api/v1`) and the
compat response shapes: list `{ data, total, pagination }`, detail `{ data }`,
mutation `{ data, message }`. Handlers live in `src/modules/mockMasterData`.

Collections and deterministic IDs:

```txt
item-master        item_001   (base_uom, country_of_origin, hs_code, item_category,
                               item_type, unit_price_usd, barcode, ...)
suppliers          sup_*      (supplier_type, city, contact_person, bank_info,
                               lead_time_production_days, ...)
forwarders         fwd_*      (forwarder_type SEA|AIR|TRUCKING|MULTI, is_primary)
carriers           carr_*     (carrier_type SHIPPING_LINE|AIRLINE, scac_iata_code)
task-templates     tt_001..tt_020
currencies / incoterms / transport-modes   (reference data)

Currency master data stores identity/display only (`currency_code`, `currency_name`, optional `symbol`, `decimal_places`, `is_active`). Exchange rates are transactional and must remain on cost/quote lines. Incoterm master data is minimal and doc-derived: `incoterm_code`, `incoterm_name`, `incoterm_name_vn`, `description`, `is_active`; no ISO group/mode/insurance fields are part of the mock contract. Shipment `mode` is the transport mode, while nullable `load_type` carries FCL/LCL for sea and FTL/LTL for road/trucking.
```

Rules:

```txt
- Source of truth is scripts/seed-mock-data.js; run `npm run mock:seed` after
  edits, then `npm run mock:smoke`.
- Keep system fields (create_at, update_at, delete_at, is_delete) on every record.
- Endpoints: GET/POST /api/<collection>, GET/PATCH/DELETE /api/<collection>/:id
  for forwarders, carriers, task-templates (mirroring suppliers/items).
- Item/Supplier field renames are entity-scoped; do not touch line-level
  unit / lead_time_* on PO / DO / Shipment lines.
```

---

# 18. Task Template ↔ Runtime Task Linkage

`task-templates` is the SOP catalog (20 tasks). `logistics-tasks` is the sole
runtime task pool; Tasks, the PO task board, and DO summaries project from it.

```txt
- Every row has `task_template_id` and snapshots `milestone_code`, `group_code`,
  `group_name`, `department`, `assignee_code`, `sla_hours`, `sla_text`, and
  `related_documents`.
- Ownership is SOP `department` (DepartmentCode) plus `assignee_code` such as
  `FDS_OPS` + `O01`; synthetic task roles and free-text departments are not used.
- `is_required_for_closure` is a **manually-curated master-data property on the task
  template** — toggled per template via the Task Template form; the generic
  `createRecord`/`updateRecord` persist it verbatim (no whitelist). The reseed formula
  (operational MS1–MS8 tasks except the accounting/settlement group) is only the seed
  DEFAULT. Runtime rows INHERIT it (seed snapshot + `resolveTaskTemplateFields`), never
  set per task instance. `required_tasks_remaining` on the DO summary counts required
  tasks not COMPLETED.
- A blocked row stores `blocked_reason` + `blocked_by_party`
  (`SUPPLIER|CARRIER|CUSTOMER|CUSTOMS|INTERNAL`) — a manual flag (no dependency engine).

Manual create / edit endpoints mutate `logistics-tasks`:

```txt
POST  /api/v1/tasks          create a task; task_name required; optional
                             task_template_id derives milestone/department/sla/
                             related_documents/group via resolveTaskTemplateFields.
PATCH /api/v1/tasks/:id      edit status/progress/note + task_name/department/
                             assignee_code/blocked_reason/blocked_by_party/DO/PO
                             fields; passing task_template_id re-derives the
                             template snapshot (null clears it).
```

```txt
- createTask assigns the next task_XXX id and appends to `logistics-tasks`.
- buildTaskPatch only copies provided fields, so partial PATCH stays safe and
  template fields persist when not edited.
```

Out of scope unless requested: auto-generating runtime tasks per PO/Shipment
from templates, and a real SLA engine.
