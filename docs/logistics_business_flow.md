# Logistics Business Flow - Mock API eFMS

Tai lieu nay la business flow tong the cho mock API eFMS/logistics/import.
Cac module-level rule chi tiet nam o cac file rieng:

```txt
PO/LOT: docs/PO_logic.md
API contract: docs/api_doc.md
Database schema: docs/database.sql
Suggested next endpoint: docs/suggested_endpoint.md
```

## Current Implemented Flow

```txt
Master Data
-> Purchase Order
-> Supplier Confirmation
-> LOT Planning
-> Internal Delivery Order
-> Quotation Versioning
-> Ready for Shipment Booking
```

## Module Ownership

| Module | Ownership | Status |
| --- | --- | --- |
| Master Data | suppliers, items, currencies, incoterms, transport modes | Implemented |
| Purchase Order | PO header, PO lines, supplier confirmation | Implemented |
| LOT Planning | slots, LOTs, LOT lines, split/move/reorder/merge/transfer | Implemented |
| Internal Delivery Order | internal DO header, DO lots, DO lines | Implemented |
| Quotation Versioning | quotations, charge lines, events, version/final rule | Implemented |
| Shipment Booking | shipment header/detail from final quotation and DO | Future |
| Customs | declaration/customs processing | Future |
| Carrier DO / DTO | carrier delivery order and trucking/delivery task order | Future |
| Warehouse Receiving / GRN | receiving confirmation and goods receipt note | Future |
| Payment / SLA / ERP Sync | post-operation integration and control | Future |

## End-to-End State Flow

```txt
PO.DRAFT
-> PO.SENT
-> PO.CONFIRMED
-> PO.IN_PRODUCTION
-> PO.READY_TO_SHIP
-> DO.DRAFT
-> DO.READY_FOR_QUOTATION
-> QUOTATION.REQUESTED
-> QUOTATION.RECEIVED
-> QUOTATION.SUBMITTED_TO_KBI
-> QUOTATION.CONFIRMED_BY_KBI
-> DO.QUOTATION_CONFIRMED
-> DO.ASSIGNED_TO_SHIPMENT
```

Notes:

```txt
PO can be cancelled from DRAFT/SENT.
DO can be cancelled before ASSIGNED_TO_SHIPMENT.
Quotation can be cancelled/rejected/expired before terminal success.
```

## Master Data

Master data must exist before transactional flow:

```txt
suppliers
currencies
incoterms
transport_modes
item_groups
item_master
item_customs_profiles
```

Rules:

```txt
Only active supplier/currency should be used in new transactions.
Supplier can have many roles: SUPPLIER, SHIPPER, VENDOR, FORWARDER, TRUCKING_VENDOR, CUSTOMS_BROKER.
Item customs profile stores HS code, duty/VAT rates, CO form, customs type, reference docs.
```

## Purchase Order

PO is the commercial purchase plan.

Core flow:

```txt
Create PO with lines
-> auto create SLOT-001
-> auto create LOT-001
-> send PO to supplier
-> supplier confirmation
-> mark in production
-> mark ready to ship
```

Important rules:

```txt
One PO has one supplier_id.
PO lines own item_id and qty_ordered.
PO can be edited only in DRAFT.
Supplier confirmation updates qty_confirmed.
```

## LOT Planning

LOT Planning groups PO quantities into delivery batches.

Core operations:

```txt
Split LOT
Move LOT between delivery slots
Reorder LOTs
Merge LOTs
Transfer LOT line quantities
Reset to default planning
```

Important rules:

```txt
sum(po_lot_lines.qty_lotted) <= purchase_order_lines.qty_ordered
Locked LOT statuses: ASSIGNED_TO_SHIPMENT, SHIPPED, CANCELLED
Locked LOTs cannot be split/moved/reordered/merged/transferred.
```

## Internal Delivery Order

Internal DO is KBI internal planning from selected LOTs.

Core flow:

```txt
Create DO from selected LOTs
-> copy LOT links to delivery_order_lots
-> copy active LOT lines to delivery_order_lines
-> mark ready for quotation
```

Important rules:

```txt
Can create DO only when PO status IN (CONFIRMED, IN_PRODUCTION, READY_TO_SHIP).
Selected LOTs must belong to the same PO.
Selected LOTs must not be locked.
Selected LOTs must not already belong to another active DO.
```

DO statuses:

```txt
DRAFT
READY_FOR_QUOTATION
QUOTATION_CONFIRMED
ASSIGNED_TO_SHIPMENT
CANCELLED
CLOSED
```

## Quotation Versioning

Quotation is the vendor/forwarder cost offer for a reference object, currently mainly `DELIVERY_ORDER`.

Core flow:

```txt
Create quotation from DO
-> add charge lines
-> request quotation
-> receive quotation
-> submit to KBI
-> confirm by KBI / mark final
-> DO.status = QUOTATION_CONFIRMED
```

Important rules:

```txt
Do not mutate old price as a revision.
Create a new version with the same quotation_group_id.
Only one active quotation in the same group can be final.
Final quotation must have at least one active charge line.
When final quotation ref_type = DELIVERY_ORDER, linked DO becomes QUOTATION_CONFIRMED.
```

Quotation statuses:

```txt
DRAFT
REQUESTED
RECEIVED
SUBMITTED_TO_KBI
CONFIRMED_BY_KBI
REJECTED
CANCELLED
EXPIRED
```

Locked quotation statuses:

```txt
SUBMITTED_TO_KBI
CONFIRMED_BY_KBI
REJECTED
CANCELLED
EXPIRED
```

Locked quotations cannot change charge lines.

## Shipment Booking - Future

Shipment should be created only after:

```txt
DO.status = QUOTATION_CONFIRMED
Quotation.status = CONFIRMED_BY_KBI
Quotation.is_final = true
```

Expected future ownership:

```txt
shipments
shipment_delivery_orders
shipment_lots
shipment_lines
shipment_events
```

Expected transition:

```txt
DO.QUOTATION_CONFIRMED
-> Shipment Booking
-> DO.ASSIGNED_TO_SHIPMENT
-> PO LOT.ASSIGNED_TO_SHIPMENT
```

## Customs - Future

Customs should use:

```txt
item_customs_profiles
shipment lines
supplier/country/origin data
incoterm/currency data
```

Expected responsibilities:

```txt
HS code confirmation
Import duty/VAT calculation
CO form preference
Declaration status tracking
Document/reference numbers
```

## Carrier DO / DTO - Future

Carrier DO / DTO should be downstream from shipment/customs.

Expected responsibilities:

```txt
Carrier delivery order
Trucking vendor assignment
Pickup/delivery schedule
Warehouse destination
Proof of delivery
```

## Data Integrity Principles

The system should keep these rules across modules:

```txt
Use UUID primary keys.
Use create_at/update_at/delete_at/is_delete on transactional tables.
Use active-only unique indexes for soft-delete friendly uniqueness.
Keep status as VARCHAR + CHECK, not PostgreSQL enum.
Use Prisma for runtime API access.
Use database triggers/functions for cross-row integrity and aggregate refreshes where useful.
Service layer should still validate business rules before calling DB.
```

## Agent Guidance

When implementing next backend APIs:

```txt
1. Read docs/database.sql first.
2. Read module-level logic doc if one exists.
3. Confirm Prisma schema matches database.sql and real DB.
4. Use existing route/controller/service/repository/constants pattern.
5. Update docs/api_doc.md after endpoint behavior changes.
6. Run node --check, npm run prisma:generate if schema changes, and npm run prisma:check.
```
