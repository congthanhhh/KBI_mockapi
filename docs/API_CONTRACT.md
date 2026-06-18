# API Contract

## Standard Response

Success:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

Error:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    {
      "error_code": "VALIDATION_ERROR",
      "message": "field is required",
      "details": {}
    }
  ]
}
```

Error codes:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `STATE_CONFLICT`
- `BUSINESS_RULE_VIOLATION`
- `INTERNAL_ERROR`

## Flow

```txt
Purchase Order
-> Supplier Confirmation
-> LOT Planning
-> Internal Delivery Order
-> Quotation
-> Shipment
-> Customs
-> Carrier Delivery Order
-> Domestic Transport Order
```

## Business Endpoints

Master Data:

- `GET /api/v1/currencies`
- `GET /api/v1/incoterms`
- `GET /api/v1/transport-modes`
- `GET /api/v1/suppliers`
- `GET /api/v1/suppliers/:id`
- `GET /api/v1/item-groups`
- `GET /api/v1/items`
- `GET /api/v1/items/:id`
- `GET /api/v1/items/:id/customs-profiles`

Master-data compatibility endpoints are mounted under `/api/*` at runtime and keep the list/detail/mutation response shapes used by the frontend. Supplier rows are normalized from legacy seed fields so the UI receives `supplier_roles`, `contact_email`, `contact_phone`, `default_currency`, `default_incoterm`, and `supplier_transport_modes`. Item rows are enriched with `item_group` and `customs_profiles`; tax profiles normalize legacy `preferential_tax_rate` into `preferential_import_duty_rate`.

Purchase Orders:

- `GET /api/v1/purchase-orders`
- `POST /api/v1/purchase-orders`
- `GET /api/v1/purchase-orders/:id`
- `PATCH /api/v1/purchase-orders/:id`
- `GET /api/v1/purchase-orders/:id/lines`
- `POST /api/v1/purchase-orders/:id/send`
- `POST /api/v1/purchase-orders/:id/confirm`
- `POST /api/v1/purchase-orders/:id/cancel`

`GET /api/v1/purchase-orders` and `GET /api/v1/purchase-orders/:id` enrich each purchase order with:

- `supplier`, `currency`, `incoterm`, `transport_mode`
- `total_weight_kg`, `total_containers`, `total_lots`, `lot_ids`
- `delayed_days`
- `lines[]` enriched with `item` and `item_customs_profile`
- `lot_summary: { total_weight_kg, total_containers, total_lots, lot_ids }`
- `logistics_timeline.loading_port: { etd, atd }`
- `logistics_timeline.unloading_port: { eta, ata }`
- `logistics_timeline.warehouse: { eta, ata }`

`GET /api/v1/purchase-orders` supports `page`, `limit`, `search`/`q`, `status`, and `supplier_id`. Search matches PO header fields, supplier, incoterm, transport mode, LOT, PO line, item, and customs profile display fields. The response meta includes `total` and `pagination`.

The mock seed keeps PO timeline fields populated for UI testing:

- `contract_no`
- `transport_mode_id`
- `actual_etd`
- `actual_eta`
- `expected_warehouse_eta`
- `actual_warehouse_ata`

Purchase order lines include frontend-ready logistics quantities:

- `item_customs_profile_id`
- `item_description`
- `gross_weight_kg`
- `qty_confirmed`
- `qty_lotted`
- `qty_shipped`
- `qty_received`
- `expected_eta_line`
- `notes`

`POST /api/v1/purchase-orders` creates a new PO in `DRAFT` status, creates default `LOT-001`, and assigns the initial PO lines to that LOT. The user flow should then move through `Send PO` and Supplier Confirmation instead of skipping directly to `CONFIRMED`.

Supplier Confirmation:

- `GET /api/v1/purchase-orders/:id/confirmations`
- `POST /api/v1/purchase-orders/:id/confirmations`
- `GET /api/v1/purchase-order-confirmations/:id`

LOT Planning:

- `GET /api/v1/purchase-orders/:id/lot-planning`
- `POST /api/v1/purchase-orders/:id/lots`
- `PATCH /api/v1/po-lots/:lotId`
- `DELETE /api/v1/po-lots/:lotId`
- `POST /api/v1/po-lot-lines/:lineId/move`
- `POST /api/v1/po-lot-lines/:lineId/split`
- `PATCH /api/v1/po-lots/reorder`
- `PATCH /api/v1/po-lot-lines/reorder`

`GET /api/v1/purchase-orders/:id/lot-planning` returns:

- `purchase_order`
- `po_lines` enriched like purchase order line responses
- `lots[].items[]` enriched with:
  - `item`
  - `item_code`
  - `item_name`
  - `item_customs_profile`
  - `hs_code`
  - `purchase_order_line`
  - `qty_ordered`
  - `qty_lotted`
  - `gross_weight_kg`
  - `notes`

Delivery Orders:

- `GET /api/v1/delivery-orders`
- `GET /api/v1/delivery-orders/:id`
- `POST /api/v1/delivery-orders/from-lots`
- `GET /api/v1/purchase-orders/:id/delivery-orders`
- `GET /api/v1/delivery-orders/:id/lots`
- `GET /api/v1/delivery-orders/:id/lines`
- `POST /api/v1/delivery-orders/:id/ready-for-quotation`
- `POST /api/v1/delivery-orders/:id/cancel`
- `PATCH /api/v1/delivery-orders/:id`

`GET /api/v1/delivery-orders` supports `page`, `limit`, `search`/`q`, `status`, `purchase_order_id`, and `transport_mode_id`. The response meta includes `total` and `pagination`.

Delivery order rows include frontend-ready logistics fields for the DO board:

- `transport_mode_id`
- `transport_mode`
- `planned_cargo_ready_date`
- `planned_etd`
- `planned_eta`
- `origin_address`
- `destination_address`
- `warehouse_name`
- `linked_shipment_number`
- `shipments`
- `purchase_order`

Delivery order line rows include joined `item`, `purchase_order_line`, `item_code`, `item_name`, `hs_code`, `qty_ordered`, and `gross_weight_kg` so allocation, weight, and item metadata can be rendered without placeholder data. They also include line-level logistics context from linked shipment data: `lot`, `lot_no`, `shipment`, `shipment_line`, `shipment_number`, `container_no`, `route_origin`, `route_destination`, `etd`, and `eta`.

`PATCH /api/v1/delivery-orders/:id` updates editable DO header fields such as `status`, `transport_mode_id`, planned dates, route addresses, `warehouse_name`, and `notes`, then returns the enriched DO detail with lots and lines.

Dashboard Tasks:

- `GET /api/v1/logistics-tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `GET /api/v1/purchase-orders/:id/tasks`
- `PATCH /api/v1/tasks/:id`
- `POST /api/v1/tasks/:id/assign`

`GET /api/v1/logistics-tasks` returns frontend-ready task rows for dashboard urgency, overdue task grouping, task role progress, and monthly completed-task throughput.

`GET /api/v1/tasks` returns screen-ready Task DTO rows from `mock-data/screens/task-list.json`:

- `items[]`
- `summary`
- `filters`

Supported query filters:

- `status`
- `priority`
- `stage`
- `role`
- `ref_type`
- `ref_id`
- `assignee_id`

`GET /api/v1/purchase-orders/:id/tasks` returns task groups by PO flow stage:

- `SUPPLIER_CONFIRMATION`
- `LOT_PLANNING`
- `INTERNAL_DO`
- `QUOTATION`
- `SHIPMENT`
- `CUSTOMS`
- `CARRIER_DO`
- `DTO`

`PATCH /api/v1/tasks/:id` updates only mock task screen state fields:

- `status`
- `note`
- `progress`
- `completed_at`
- `blocked_reason`
- `priority`
- `due_at`

`POST /api/v1/tasks/:id/assign` updates only mock task assignee:

```json
{
  "assignee": {
    "id": "user_buyer_001",
    "name": "Nguyen Van A",
    "department": "Procurement"
  }
}
```

Quotations:

- `GET /api/v1/quotations`
- `GET /api/v1/quotations/:id`
- `GET /api/v1/delivery-orders/:id/quotations`
- `POST /api/v1/delivery-orders/:id/quotations`
- `POST /api/v1/quotations/:id/create-version`
- `POST /api/v1/quotations/:id/mark-final`
- `POST /api/v1/quotations/:id/confirm-by-kbi`
- `POST /api/v1/quotations/:id/reject`
- `POST /api/v1/quotations/:id/cancel`
- `GET /api/v1/quotations/:id/charge-lines`
- `POST /api/v1/quotations/:id/charge-lines`
- `PATCH /api/v1/quotation-charge-lines/:lineId`
- `DELETE /api/v1/quotation-charge-lines/:lineId`
- `GET /api/v1/quotations/:id/events`

`GET /api/v1/quotations` supports `page`, `limit`, `search`/`q`, `ref_type`, `ref_id`, `status`, `supplier_id`, `from_date`, and `to_date`. The response meta includes `total` and `pagination`.

Quotation detail responses include `supplier`, `currency`, `charge_lines`, and `events`. Charge lines are normalized with `line_no`, `unit`, `tax_amount`, and `total_amount` so quotation tables can render totals even when older mock rows only contain base amounts.

Charge-line `charge_type` is an open string (unknown values default to `OTHER`), but the Incoterms-aware quotation form emits a known vocabulary so each fee renders as a typed line:

- Freight / origin: `OCEAN_FREIGHT`, `AIR_FREIGHT`, `BREAKBULK_FREIGHT`, `ORIGIN_CHARGE`
- Vietnam local: `DO_FEE`, `HANDLING`, `THC`, `CIC`, `EMC_EMF`, `CLEANING`, `CFS`, `LOCAL_CHARGE`
- Customs & domestic transport: `CUSTOMS_FEE`, `TRUCKING`, `LOWERING_FEE` (Hạ xa), `LOADING_FEE` (bốc xếp xe → pallet)
- Other: `DEMURRAGE`, `DETENTION`, `WAREHOUSE`, `DOCUMENT_FEE`, `OTHER`

Which fees apply depends on the originating PO Incoterms group (EXW/FCA, FOB, CFR) and the shipping mode (FCL/LCL/AIR); see `docs/quotation_Incoterms.md`. The `unit` field carries the pricing basis (`CONT`, `RT`, `KGS`, `BL`, `DECLARATION`).

Marking a quotation final sets `quotation.status = CONFIRMED_BY_KBI`, `quotation.is_final = true`, clears `is_final` from other quotations in the same `quotation_group_id`, and updates the linked delivery order to `QUOTATION_CONFIRMED`. `POST /api/v1/quotations/:id/confirm-by-kbi` follows the same finalization rule for compatibility.

Shipments:

- `GET /api/v1/shipments`
- `GET /api/v1/shipments/:id`
- `POST /api/v1/shipments/from-delivery-order`
- `PATCH /api/v1/shipments/:id`
- `GET /api/v1/shipments/:id/lines`
- `GET /api/v1/shipments/:id/milestones`
- `POST /api/v1/shipments/:id/milestones/:code/done`
- `GET /api/v1/shipments/:id/documents`
- `POST /api/v1/shipments/:id/documents`
- `PATCH /api/v1/shipment-documents/:documentId`
- `DELETE /api/v1/shipment-documents/:documentId`
- `GET /api/v1/shipments/:id/containers`
- `POST /api/v1/shipments/:id/containers`
- `PATCH /api/v1/shipment-containers/:containerId`
- `DELETE /api/v1/shipment-containers/:containerId`
- `POST /api/v1/shipments/:id/cancel`

Shipment containers model the physical transport units of a shipment. Each container record carries `shipment_id`, `container_no` (required on create), `container_type` (e.g. `20GP`, `40GP`, `40HC`), `seal_no`, `tare_weight_kg`, `gross_weight_kg`, `volume_cbm`, `status`, `note`, and `dto_id` (the DTO currently hauling it, or `null`). `status` is one of `PLANNED` | `STUFFED` | `GATED_IN` | `DISCHARGED` | `RETURNED` (default `PLANNED` on create). `GET /api/v1/shipments/:id` embeds the shipment's `containers` array alongside `lines`, `milestones`, and `documents`.

Shipment documents carry a lifecycle `status` (`DRAFT` | `RECEIVED` | `VERIFIED` | `REJECTED` | `CANCELLED`). `POST .../documents` creates the document with `status = DRAFT` by default. Editable fields on create/update are `milestone_id`, `milestone_code`, `document_type`, `document_no`, `file_url`, `file_name`, `mime_type`, `issued_date`, `received_at`, `status`, and `notes`. The Verify action sets `status = VERIFIED`; the Reject action sets `status = REJECTED` and stores the reason in `notes`.

`GET /api/v1/shipments` supports `page`, `limit`, `search`/`q`, `status`, `mode`, `delivery_order_id`, `purchase_order_id`, `forwarder_id`, `transport_mode_id`, `from_date`, and `to_date`. The response meta includes `total` and `pagination`.

`GET /api/v1/shipments` and `GET /api/v1/shipments/:id` enrich each shipment with `customs_channel` (`GREEN` | `YELLOW` | `RED` | `null`). The value is derived from the shipment's representative customs declaration — the most recently created/cleared non-cancelled declaration linked via `shipment_id`. It is `null` when the shipment has no customs declaration yet. The channel is assigned when a declaration is opened and persists after clearance.

Customs:

- `GET /api/v1/shipments/:shipmentId/customs-declarations`
- `POST /api/v1/shipments/:shipmentId/customs-declarations`
- `GET /api/v1/customs-declarations/:id`
- `PATCH /api/v1/customs-declarations/:id`
- `GET /api/v1/customs-declarations/:id/lines`
- `POST /api/v1/customs-declarations/:id/lines`
- `PATCH /api/v1/customs-declaration-lines/:lineId`
- `DELETE /api/v1/customs-declaration-lines/:lineId`
- `POST /api/v1/customs-declarations/:id/open-draft`
- `POST /api/v1/customs-declarations/:id/open-official`
- `POST /api/v1/customs-declarations/:id/clear`
- `POST /api/v1/customs-declarations/:id/cancel`

Carrier DO:

- `GET /api/v1/carrier-delivery-orders`
- `GET /api/v1/carrier-delivery-orders/:id`
- `GET /api/v1/shipments/:shipmentId/carrier-delivery-orders`
- `POST /api/v1/shipments/:shipmentId/carrier-delivery-orders`
- `POST /api/v1/carrier-delivery-orders/:id/issue`
- `POST /api/v1/carrier-delivery-orders/:id/release`
- `POST /api/v1/carrier-delivery-orders/:id/cancel`

DTO:

- `GET /api/v1/domestic-transport-orders`
- `GET /api/v1/domestic-transport-orders/:id`
- `POST /api/v1/shipments/:shipmentId/domestic-transport-orders`
- `GET /api/v1/shipments/:shipmentId/domestic-transport-orders` — list all DTOs linked to a shipment (via junction table or primary shipment_id)
- `POST /api/v1/shipments/:shipmentId/domestic-transport-orders/link` — link an existing DTO to a shipment; body `{ dto_id }`
- `DELETE /api/v1/shipments/:shipmentId/domestic-transport-orders/:dtoId/unlink` — unlink a DTO from a shipment
- `PATCH /api/v1/domestic-transport-orders/:id`
- `POST /api/v1/domestic-transport-orders/:id/quote-pending`
- `POST /api/v1/domestic-transport-orders/:id/confirm-quote`
- `POST /api/v1/domestic-transport-orders/:id/dispatch`
- `POST /api/v1/domestic-transport-orders/:id/start-transit`
- `POST /api/v1/domestic-transport-orders/:id/deliver`
- `POST /api/v1/domestic-transport-orders/:id/close`
- `POST /api/v1/domestic-transport-orders/:id/cancel`

The Shipment–DTO relationship is many-to-many (n:n). The junction collection `shipment-dto-links` holds `{ shipment_id, dto_id }` pairs. One Shipment can have many DTOs (multiple truck runs), and one DTO can be linked to multiple Shipments (LCL consolidation). Creating a DTO via `POST /api/v1/shipments/:shipmentId/domestic-transport-orders` automatically inserts a junction record. The source shipment must be `CUSTOMS_CLEARED`.

`POST /api/v1/shipments/:shipmentId/domestic-transport-orders` accepts an optional `container_ids: string[]` to allocate specific shipment containers to the new DTO. When supplied, every id must belong to the shipment (otherwise `VALIDATION_ERROR`); the chosen containers have their `dto_id` set to the new DTO and the DTO's `container_no` is populated from their container numbers. When omitted, `container_no` falls back to the request body `container_no` (or `null`).

Domestic transport order list/detail responses include frontend-ready fields for DTO screens:

- `shipment` — primary shipment (backward compat, kept from `shipment_id` FK)
- `shipments[]` — all linked shipments (via junction table; includes primary)
- `carrier_delivery_order`, `truck_vendor`
- `lines[]` enriched with `item`, `purchase_order_line`, `item_customs_profile`, `lot`, `shipment_line`
- line display fields: `item_code`, `item_name`, `item_description`, `hs_code`, `lot_no`, `qty_ordered`, `gross_weight_kg`
- header totals: `total_qty`, `total_gross_weight_kg`

`GET /api/v1/domestic-transport-orders` supports `page`, `limit`, `search`/`q`, `status`, `shipment_id`, and `truck_vendor_id`. The `shipment_id` filter matches both the primary FK and junction-linked DTOs. Search matches DTO number, shipment number, truck vendor, driver, vehicle, origin, destination, and warehouse. The response meta includes `total` and `pagination`.

Mock Debug:

- `GET /api/v1/mock/health`
- `POST /api/v1/mock/reset`
- `POST /api/v1/mock/reload`
- `GET /api/v1/mock/:collection`
- `GET /api/v1/mock/:collection/:id`
- `POST /api/v1/mock/:collection`
- `PATCH /api/v1/mock/:collection/:id`
- `DELETE /api/v1/mock/:collection/:id`
