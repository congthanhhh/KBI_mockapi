# PO Module Logic - Mock API eFMS

Tai lieu nay chi mo ta business rule cho module Purchase Order va LOT Planning.
Flow tong the sau PO/LOT duoc mo ta trong `docs/logistics_business_flow.md`.

## Scope

PO module bao gom:

```txt
PO Creation
-> PO Lines
-> Supplier Confirmation
-> Default Slot + Default LOT
-> Split LOT
-> Move LOT between Delivery Slots
-> Reorder LOT
-> Merge / Transfer LOT lines
```

Ngoai scope cua file nay:

```txt
Internal Delivery Order
Quotation Versioning
Shipment
Customs
Carrier DO
DTO
Warehouse Receiving
GRN
Payment
SLA
ERP Sync
```

Internal Delivery Order va Quotation Versioning hien da co schema/API rieng.
Khong dat logic cua cac module nay vao `PO_logic.md`.

---

## Core Business Rule

Moi PO chi co mot supplier/vendor.

Dung relationship:

```txt
suppliers 1-n purchase_orders
purchase_orders 1-n purchase_order_lines
purchase_orders 1-n purchase_order_confirmations
purchase_order_confirmations 1-n purchase_order_confirmation_lines

purchase_orders 1-n po_delivery_slots
purchase_orders 1-n po_lots
po_delivery_slots 1-n po_lots
po_lots 1-n po_lot_lines
purchase_order_lines 1-n po_lot_lines
```

Khong hieu `PO 1-1 supplier` la mot supplier chi co mot PO.
Y nghia dung:

```txt
Mot PO chi duoc chon mot supplier_id.
Mot supplier co the co nhieu PO.
```

---

## Required Tables

PO module su dung cac table:

```txt
purchase_orders
purchase_order_lines
purchase_order_confirmations
purchase_order_confirmation_lines
po_delivery_slots
po_lots
po_lot_lines
```

Master data reference:

```txt
suppliers
currencies
incoterms
transport_modes
item_master
item_customs_profiles
```

---

## purchase_orders

Header PO.

Fields chinh:

```txt
po_no
contract_no
supplier_id
currency_id
incoterm_id
transport_mode_id
po_type
payment_term
exchange_rate
expected_etd
expected_eta
status
sent_at
confirmed_at
cancelled_at
cancel_reason
notes
```

Status:

```txt
DRAFT
SENT
CONFIRMED
IN_PRODUCTION
READY_TO_SHIP
SHIPPED
RECEIVED
CLOSED
CANCELLED
```

Core transitions:

```txt
DRAFT -> SENT -> CONFIRMED -> IN_PRODUCTION -> READY_TO_SHIP
DRAFT/SENT -> CANCELLED
```

Rule:

```txt
Chi duoc update/delete PO khi status = DRAFT.
Chi tao Internal DO khi PO status IN (CONFIRMED, IN_PRODUCTION, READY_TO_SHIP).
```

---

## purchase_order_lines

Item trong PO.

Fields chinh:

```txt
purchase_order_id
item_id
item_customs_profile_id
line_no
item_description
qty_ordered
unit
unit_price
tax_rate
discount_pct
qty_confirmed
qty_lotted
qty_shipped
qty_received
expected_eta_line
notes
```

Rule:

```txt
qty_ordered > 0
unit is required
line_no unique trong cung purchase_order_id neu is_delete = false
unit_price >= 0
tax_rate va discount_pct trong khoang 0..100
```

Khong dat `item_id` truc tiep trong `purchase_orders`.

---

## Supplier Confirmation

Supplier xac nhan PO qua:

```txt
purchase_order_confirmations
purchase_order_confirmation_lines
```

Header confirmation:

```txt
purchase_order_id
confirmed_by
confirmed_at
supplier_ref_no
is_full_shipment
allow_partial_shipment
note
```

Line confirmation:

```txt
purchase_order_confirmation_id
purchase_order_line_id
confirmed_qty
cargo_ready_date
can_fulfill
allow_partial_shipment
note
```

Rule:

```txt
confirmed_qty >= 0
confirmed_qty <= purchase_order_lines.qty_ordered
can_fulfill = false => confirmed_qty = 0
```

Khi confirm thanh cong:

```txt
purchase_orders.status = CONFIRMED
purchase_orders.confirmed_at = now()
purchase_order_lines.qty_confirmed = sum(confirmed_qty)
```

---

## Default Slot + Default LOT

Ngay sau khi tao PO thanh cong, system tu dong tao:

```txt
SLOT-001
LOT-001
```

Toan bo PO lines ban dau duoc dua vao `LOT-001`.

Vi du:

```txt
PO Line A qty 1000
PO Line B qty 500

Auto create:

SLOT-001
  LOT-001
    A qty 1000
    B qty 500
```

---

## po_delivery_slots

Delivery slot la ke hoach giao hang.

Fields chinh:

```txt
purchase_order_id
slot_no
slot_name
planned_cargo_ready_date
planned_etd
planned_eta
delivery_address
warehouse_name
status
sort_order
notes
```

Status:

```txt
PLANNED
CONFIRMED
CANCELLED
```

---

## po_lots

LOT la nhom hang se duoc giao theo mot slot.

Fields chinh:

```txt
purchase_order_id
delivery_slot_id
lot_no
lot_name
status
planned_cargo_ready_date
planned_etd
planned_eta
sort_order
notes
```

Status:

```txt
PLANNED
READY
ASSIGNED_TO_SHIPMENT
SHIPPED
CANCELLED
```

Rule:

```txt
Khong cho split/move/reorder/merge/transfer LOT neu status IN:
- ASSIGNED_TO_SHIPMENT
- SHIPPED
- CANCELLED
```

---

## po_lot_lines

LOT line la item quantity nam trong LOT.

Fields chinh:

```txt
po_lot_id
purchase_order_line_id
item_id
qty_lotted
unit
notes
```

Rule quan trong:

```txt
For each purchase_order_line_id:
sum(po_lot_lines.qty_lotted) <= purchase_order_lines.qty_ordered
```

Khong cho tong so luong LOT vuot qua so luong PO line.

---

## Split LOT Rule

Input:

```txt
source_lot_id
new_lot_no
target_slot_id
lines: [
  purchase_order_line_id,
  split_qty
]
```

System phai:

```txt
1. Validate source LOT chua assigned shipment/chua shipped/chua cancelled.
2. Validate target slot cung PO voi source LOT.
3. Validate new_lot_no unique trong PO.
4. Validate split_qty > 0.
5. Validate split_qty <= qty hien co trong source LOT line.
6. Tru split_qty khoi source LOT line.
7. Tao po_lots moi.
8. Tao po_lot_lines moi cho LOT moi.
9. Neu source LOT line con qty = 0 thi co the soft delete line do.
```

---

## Move LOT Between Slots Rule

Khi move LOT:

```txt
Update po_lots.delivery_slot_id = target_slot_id
Update po_lots.sort_order = new_sort_order
```

Khong thay doi quantity.

Khong cho move neu LOT da:

```txt
ASSIGNED_TO_SHIPMENT
SHIPPED
CANCELLED
```

---

## Merge / Transfer Rule

Merge LOT:

```txt
POST /api/v1/po-lots/:lotId/merge
POST /api/v1/po-lots/:lotId/merge-back-default
```

Rule:

```txt
target LOT va source LOTs phai cung purchase_order_id.
target/source LOT khong duoc locked.
Neu delete_empty_source_lots != false thi soft delete source LOT rong sau merge.
```

Transfer LOT lines:

```txt
POST /api/v1/po-lots/:lotId/transfer-lines
```

Rule:

```txt
source LOT va target LOT phai cung purchase_order_id.
transfer_qty > 0.
transfer_qty <= qty_lotted cua source LOT line.
```

---

## API Endpoints Required

### PO

```txt
GET    /api/v1/purchase-orders
GET    /api/v1/purchase-orders/:id
POST   /api/v1/purchase-orders
PATCH  /api/v1/purchase-orders/:id
DELETE /api/v1/purchase-orders/:id
```

### PO actions

```txt
POST /api/v1/purchase-orders/:id/send
POST /api/v1/purchase-orders/:id/confirm
POST /api/v1/purchase-orders/:id/cancel
POST /api/v1/purchase-orders/:id/mark-in-production
POST /api/v1/purchase-orders/:id/mark-ready-to-ship
```

### PO lines

```txt
GET    /api/v1/purchase-orders/:id/lines
POST   /api/v1/purchase-orders/:id/lines
PATCH  /api/v1/purchase-order-lines/:lineId
DELETE /api/v1/purchase-order-lines/:lineId
```

Only allow line create/update/delete when PO status = DRAFT.

### LOT planning

```txt
GET  /api/v1/purchase-orders/:id/lot-planning
POST /api/v1/purchase-orders/:id/lot-planning/reset-default
POST /api/v1/purchase-orders/:id/delivery-slots
POST /api/v1/purchase-orders/:id/lots
POST /api/v1/po-lots/:lotId/split
POST /api/v1/po-lots/:lotId/merge
POST /api/v1/po-lots/:lotId/merge-back-default
POST /api/v1/po-lots/:lotId/transfer-lines
PATCH /api/v1/po-lots/:lotId/move-slot
PATCH /api/v1/po-lots/reorder
```

---

## Frontend Requirements

PO screens:

```txt
1. PO List
2. PO Detail
3. Create/Edit PO form
4. Supplier Confirmation form
5. LOT Planning board
```

LOT Planning board must display:

```txt
Delivery Slots as columns
Lots as draggable cards
Lot lines/items inside each lot card
```

Drag/drop behavior:

```txt
Dragging LOT card between slot columns calls:
PATCH /api/v1/po-lots/:lotId/move-slot
```

Split behavior:

```txt
User clicks Split LOT
Enter new LOT no, target slot, split qty per PO line
Submit calls:
POST /api/v1/po-lots/:lotId/split
```

---

## Response Format

All V1 API responses follow:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

---

## Error Rules

Return error when:

```txt
400 VALIDATION_ERROR
- required fields missing
- invalid qty
- invalid status

409 STATE_CONFLICT
- update PO not in DRAFT
- send PO not in DRAFT
- confirm PO not in SENT
- move/split/merge/transfer LOT already assigned/shipped/cancelled

422 BUSINESS_RULE_VIOLATION
- confirmed_qty > qty_ordered
- total qty_lotted > qty_ordered
- split_qty > source LOT line qty
- transfer_qty > source LOT line qty
```

---

## Implementation Priority

Current implemented PO/LOT priority:

```txt
1. purchase_orders
2. purchase_order_lines
3. auto create SLOT-001 + LOT-001 after PO creation
4. purchase_order_confirmations
5. purchase_order_confirmation_lines
6. GET lot-planning
7. split LOT
8. move LOT between slots
9. reorder LOT
10. merge LOTs
11. transfer LOT lines
```
