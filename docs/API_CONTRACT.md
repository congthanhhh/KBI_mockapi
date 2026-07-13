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

Master-data compatibility endpoints are mounted under `/api/*` at runtime and keep the list/detail/mutation response shapes used by the frontend:

- list: `{ data, total, pagination }`
- detail: `{ data }`
- mutation: `{ data, message }`

Compatibility CRUD routes:

- `/api/currencies`
- `/api/incoterms`
- `/api/transport-modes`
- `/api/suppliers`
- `/api/item-groups`
- `/api/items`
- `/api/items/:id/tax-profile`
- `/api/charge-codes`
- `/api/uoms`
- `/api/forwarders`
- `/api/carriers`
- `/api/task-templates`

Each collection route supports `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, and `DELETE /:id` unless noted by the current route file. Item groups and items keep their existing `PUT /:id` update compatibility route. Supplier rows use the documented Phase-1 schema (`supplier_name_en`, `supplier_type`, `city`, `contact_person`, `lead_time_production_days`, `bank_info`, `note`) while normalizing legacy `contact_name`, `email`, `phone`, and `lead_time_days`. Supplier logistics roles remain independent in `supplier_roles[]` and are not derived from the documented supplier type. Item rows use the documented Phase-1 schema (`item_name_en`, `item_category`, `base_uom`, `purchase_uom`, `uom_conversion`, `hs_code`, `country_of_origin`, `unit_price_usd`, `barcode`, `note`) while normalizing legacy `unit`, `origin_country`, and `item_description`. Item rows are enriched with `item_group` and `customs_profiles`; tax profiles normalize legacy `preferential_tax_rate` into `preferential_import_duty_rate`.

Charge code rows include both independent taxonomy fields: `group` is one of the seven macro doc sections (`ORIGIN_EXPORT`, `MAIN_FREIGHT`, `FREIGHT_SURCHARGE`, `DOCUMENTATION_FILING`, `DESTINATION_IMPORT`, `ANCILLARY_ACCESSORIAL`, `SERVICE_OTHER`), while `category` is one of the nine row categories (`ORIGIN`, `CUSTOMS`, `DOCUMENTATION`, `FREIGHT`, `SURCHARGE`, `DESTINATION`, `DISBURSEMENT`, `ANCILLARY`, `SERVICE`). UOM rows are seeded from the 26 codes currently present in `06_UOM.html` and do not expose a `category` field. Currency rows expose `currency_code`, `currency_name`, optional `symbol`, `decimal_places`, and `is_active`; exchange rates are transactional and are not stored on the currency master. Incoterm rows expose only `incoterm_code`, `incoterm_name`, `incoterm_name_vn`, `description`, and `is_active`, seeded from the supplier doc references (`EXW`, `FOB`, `CIF`, `DDP`) while retaining quotation-required `FCA` and `CFR`. Transport modes are the referenced modes `SEA`, `AIR`, `ROAD`, and `RAIL`; FCL/LCL remains charge-code applicability rather than a transport-mode row, and `is_international` is not part of the transport-mode DTO.

Forwarder rows include `forwarder_code`, `forwarder_name`, `forwarder_type` (`SEA`, `AIR`, `TRUCKING`, `MULTI`), `country`, `contact_person`, `contact_email`, `contact_phone`, `is_primary`, and `note`. Carrier rows include `carrier_code`, `carrier_name`, `carrier_type` (`SHIPPING_LINE`, `AIRLINE`), `scac_iata_code`, `service_route_note`, `contact_booking`, `contact_email`, and `note`. Task template rows include `group_code`, `group_name`, `task_name`, `task_description`, `milestone_code`, `sla_hours`, `sla_text`, `department`, `assignee_code`, `related_documents`, `note`, and `sort_order`; the seed contains the 20 Phase-1 SOP tasks.

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
- `origin_port`, `destination_port` free-text PO header route defaults
- `total_weight_kg`, `total_containers`, `total_lots`, `lot_ids`
- `delayed_days`
- `lifecycle_status` — resolved laggard-shipment stage (see BE_rule §5.1); the UI's
  source of truth for the PO stage badge
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
- `origin_port`
- `destination_port`
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

`POST /api/v1/purchase-orders` creates a new PO in `DRAFT` status, accepts header `origin_port` / `destination_port`, creates default `LOT-001`, copies those route fields to that LOT, and assigns the initial PO lines to that LOT. The user flow should then move through `Send PO` and Supplier Confirmation instead of skipping directly to `CONFIRMED`.

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
- `lots[]` with per-LOT `origin_port` / `destination_port` route overrides
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
- `GET /api/v1/delivery-orders/screen` — backend-shaped DO screen-DTO list (registered before `:id`)
- `GET /api/v1/delivery-orders/:id`
- `GET /api/v1/delivery-orders/:id/screen` — backend-shaped DO screen-DTO detail
- `POST /api/v1/delivery-orders/from-lots`
- `GET /api/v1/purchase-orders/:id/delivery-orders`
- `GET /api/v1/delivery-orders/:id/lots`
- `GET /api/v1/delivery-orders/:id/lines`
- `POST /api/v1/delivery-orders/:id/ready-for-quotation`
- `POST /api/v1/delivery-orders/:id/cancel`
- `PATCH /api/v1/delivery-orders/:id`

`GET /api/v1/delivery-orders` supports `page`, `limit`, `search`/`q`, `status`, `purchase_order_id`, and `transport_mode_id`. The response meta includes `total` and `pagination`.

`POST /api/v1/delivery-orders/from-lots` accepts `lot_ids`, optional `delivery_order_no`, `requested_pickup_date`, `planned_etd`, `planned_eta`, `origin_address`, `destination_address`, and `notes`. Route resolution is request body first, then primary LOT route fields, then PO header route fields, then mock defaults.

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

`GET /api/v1/delivery-orders/screen` and `/:id/screen` return the **DO screen-DTO** the frontend renders directly (the backend owns this shape; the frontend no longer joins lots/lines or synthesizes fields). Each screen object nests `order_info`, `product_details`, `source_lines`, `sap_integration`, `logistics_shipping`, `warehouse_tracking`, `finance_tax`, `flow_tags`, and a **real** `task_summary` (`total_tasks`/`completed_tasks`/`blocked_tasks`/`required_tasks_remaining`) computed from `logistics-tasks` by `do_number`. `logistics_shipping.missing_documents` is derived from REJECTED shipment documents (this is "rejected", NOT "not yet uploaded"), and `warehouse_tracking.actual_entry_date` from a linked DTO that reached `POD_RECEIVED`/`CLOSED`. `logistics_shipping` also carries the document-completeness gate: `required_documents` (codes from the admin-configurable `document-types` catalog where `is_required`), `documents_complete` (every required type has ≥1 usable DO document — status `RECEIVED` or better), `documents_outstanding` (required types with no usable file — blocks DO closure), and `documents_unverified` (required types with file(s) but none `VERIFIED` — soft warning). The same `documents_complete`/`documents_outstanding`/`documents_unverified` triple is mirrored onto `GET /api/v1/shipments/:id` from its parent DO. The required set is owned by the `document-types` master collection (`GET/POST/PATCH/DELETE /api/document-types`, fields `code`/`label_en`/`label_vi`/`is_required`/`sort_order`).

Dashboard Tasks:

- `GET /api/v1/logistics-tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `GET /api/v1/purchase-orders/:id/tasks`
- `PATCH /api/v1/tasks/:id`
- `POST /api/v1/tasks/:id/assign`

`logistics-tasks` is the single SOP-native runtime task pool. Its rows carry
`task_template_id`, template snapshots (`milestone_code`, `group_code`,
`group_name`, `department`, `assignee_code`, SLA and documents), assignee name,
and DO/PO task state. All task endpoints project or mutate this collection.

`GET /api/v1/tasks` returns screen-ready Task DTO rows projected from
`logistics-tasks`:

- `items[]`
- `summary`
- `filters`

Supported query filters:

- `status`
- `priority`
- `stage`
- `department`
- `ref_type`
- `ref_id`
- `assignee_id`

`GET /api/v1/purchase-orders/:id/tasks` returns task groups by SOP group
(`GR1` … `GR8`) or milestone.

`PATCH /api/v1/tasks/:id` mutates the runtime collection, including:

- `status`
- `note`
- `progress`
- `completed_at`
- `blocked_reason`
- `priority`
- `due_at`
- `department`
- `assignee_code`

`POST /api/v1/tasks/:id/assign` updates only mock task assignee:

```json
{
  "assignee": {
    "name": "Mai Anh",
    "department": "FDS_OPS",
    "code": "O01"
  }
}
```

Quotations:

- `GET /api/v1/quotation-requests`
- `GET /api/v1/quotation-requests/:id`
- `POST /api/v1/quotation-requests`
- `POST /api/v1/quotation-requests/:id/receive`
- `POST /api/v1/quotation-requests/:id/cancel`
- `POST /api/v1/quotation-requests/:id/quotations`
- `GET /api/v1/currency-rates`
- `GET /api/v1/quotations`
- `GET /api/v1/quotations/:id`
- `GET /api/v1/delivery-orders/:id/quotations`
- `POST /api/v1/delivery-orders/:id/quotations`
- `POST /api/v1/quotations/:id/create-version`
- `POST /api/v1/quotations/:id/mark-final`
- `POST /api/v1/quotations/:id/confirm-by-kbi`
- `POST /api/v1/quotations/:id/reject`
- `POST /api/v1/quotations/:id/cancel`
- `POST /api/v1/quotations/:id/request` — forward transition DRAFT → REQUESTED
- `POST /api/v1/quotations/:id/receive` — forward transition DRAFT|REQUESTED → RECEIVED
- `POST /api/v1/quotations/:id/submit-to-kbi` — forward transition RECEIVED → SUBMITTED_TO_KBI
- `GET /api/v1/quotations/:id/options`
- `POST /api/v1/quotations/:id/options`
- `POST /api/v1/quotations/:id/select-option`
- `PATCH /api/v1/quotation-options/:optionId`
- `DELETE /api/v1/quotation-options/:optionId`
- `GET /api/v1/quotations/:id/charge-lines`
- `POST /api/v1/quotations/:id/charge-lines`
- `PATCH /api/v1/quotation-charge-lines/:lineId`
- `DELETE /api/v1/quotation-charge-lines/:lineId`
- `GET /api/v1/quotations/:id/events`

`GET /api/v1/quotations` supports `page`, `limit`, `search`/`q`, `ref_type`, `ref_id`, `status`, `supplier_id`, `from_date`, and `to_date`. The response meta includes `total` and `pagination`.

Currency rates are seeded mock transaction rates, returned by `GET /api/v1/currency-rates` as `{ code, vnd_rate }` rows with VND base `1`; no live bank/API source is used.

Quotation request detail responses include KBI-entered PO-shaped header fields (`customer_po_ref`, `supplier_id`, `currency_code`, route/mode/incoterm), child `lines[]` from `quotation_request_lines`, embedded `supplier`/`item` display data, and responding `quotations`. Creating a quotation from an RFQ accepts optional `{ currency_code, valid_until, charge_lines }`, copies `customer_ref`, `supplier_id`, `incoterm_code`, `mode`, `origin_port`, and `destination_port`, stores `rfq_id`, and moves the RFQ to `QUOTED`.

Quotation detail responses include `supplier`, `currency`, `rfq_id`, `origin_port`, `destination_port`, `selected_option_id`, `options`, `charge_lines`, and `events`. Charge lines are normalized with `line_no`, `unit`, `tax_amount`, `total_amount`, per-line `currency_code`, and `charge_group` (`FREIGHT|ORIGIN|DESTINATION`) so quotation tables can render manual grouped totals even when older mock rows only contain base amounts.

Quotation options compare carrier, vessel/flight, ETD/ETA, transit days, risk warning, headline amount, recommendation flag, and selected flag. `POST /api/v1/quotations/:id/select-option` accepts `{ "option_id": "..." }`, marks exactly one option selected for that quotation, clears sibling selections, and writes `quotation.selected_option_id`.

Charge-line `charge_type` is an open string (unknown values default to `OTHER`), but the Incoterms-aware quotation form emits a known vocabulary so each fee renders as a typed line:

- Freight / origin: `OCEAN_FREIGHT`, `AIR_FREIGHT`, `BREAKBULK_FREIGHT`, `ORIGIN_CHARGE`
- Vietnam local: `DO_FEE`, `HANDLING`, `THC`, `CIC`, `EMC_EMF`, `CLEANING`, `CFS`, `LOCAL_CHARGE`
- Customs & domestic transport: `CUSTOMS_FEE`, `TRUCKING`, `LOWERING_FEE` (Hạ xa), `LOADING_FEE` (bốc xếp xe → pallet)
- Other: `DEMURRAGE`, `DETENTION`, `WAREHOUSE`, `DOCUMENT_FEE`, `OTHER`

The quotation UI no longer filters fee rows by Incoterm. Users add active charge codes manually under `FREIGHT`, `ORIGIN`, or `DESTINATION`; `chargeCodeToChargeType` still maps the selected code and mode into `charge_type`. The `unit` field carries the pricing basis (`CONT`, `RT`, `KGS`, `BL`, `DECLARATION`), and the frontend normalizes comparison totals to VND with `/api/v1/currency-rates`.

Marking a quotation final requires `selected_option_id`; missing selection returns `BUSINESS_RULE_VIOLATION`. Finalization sets `quotation.status = CONFIRMED`, `quotation.is_final = true`, clears `is_final` from other quotations in the same `quotation_group_id`, and moves a linked RFQ to `CONFIRMED`. `POST /api/v1/quotations/:id/confirm-by-kbi` follows the same finalization rule for compatibility.

FDS internal purchase orders are created only after a quotation is confirmed. When a confirmed quotation carries `rfq_id`, the frontend can fetch the RFQ detail and prefill PO lines from `quotation_request_lines`; KBI SAP PO remains the free-text `customer_po_ref` on the RFQ.

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

Shipment rows carry `mode` (`SEA`, `AIR`, `ROAD`, `RAIL`, etc.) plus nullable `load_type` (`FCL` | `LCL` | `FTL` | `LTL`). `load_type` is used for Sea FCL/LCL and Road FTL/LTL qualifiers; it is `null` for modes without a load-type qualifier.

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
- `POST /api/v1/domestic-transport-orders/consolidate` — atomically create one DTO serving multiple customs-cleared shipments (registered before `:id`)
- `GET /api/v1/shipments/:shipmentId/domestic-transport-orders` — list all DTOs linked to a shipment (via junction table or primary shipment_id)
- `POST /api/v1/shipments/:shipmentId/domestic-transport-orders/link` — link an existing DTO to a shipment; body `{ dto_id }`
- `DELETE /api/v1/shipments/:shipmentId/domestic-transport-orders/:dtoId/unlink` — unlink a DTO from a shipment
- `PATCH /api/v1/domestic-transport-orders/:id`
- `POST /api/v1/domestic-transport-orders/:id/quote-pending`
- `POST /api/v1/domestic-transport-orders/:id/confirm-quote`
- `POST /api/v1/domestic-transport-orders/:id/dispatch`
- `POST /api/v1/domestic-transport-orders/:id/start-transit`
- `POST /api/v1/domestic-transport-orders/:id/deliver`
- `POST /api/v1/domestic-transport-orders/:id/pod-received` — `DELIVERED` -> `POD_RECEIVED`
- `POST /api/v1/domestic-transport-orders/:id/close`
- `POST /api/v1/domestic-transport-orders/:id/cancel`

The Shipment–DTO relationship is many-to-many (n:n). The junction collection `shipment-dto-links` holds `{ shipment_id, dto_id }` pairs. One Shipment can have many DTOs (multiple truck runs), and one DTO can be linked to multiple Shipments (LCL consolidation). Creating a DTO via `POST /api/v1/shipments/:shipmentId/domestic-transport-orders` automatically inserts a junction record. The source shipment must be `CUSTOMS_CLEARED`.

`POST /api/v1/domestic-transport-orders/consolidate` creates **one** DTO serving several shipments in a single atomic call. Body: `{ shipment_ids: string[], primary_shipment_id?, container_ids?, truck_vendor_id?, warehouse?, scheduled_pickup_at?, note? }`. It requires at least two shipments, validates every shipment is `CUSTOMS_CLEARED` and shares the same `pod` (else `BUSINESS_RULE_VIOLATION`), creates the DTO on the primary shipment, then links the remaining shipments and reassigns their selected containers — replacing the previous client-side multi-call sequence.

`POST /api/v1/domestic-transport-orders/:id/pod-received` moves a DTO from `DELIVERED` to `POD_RECEIVED` (otherwise `BUSINESS_RULE_VIOLATION`). `PATCH /api/v1/domestic-transport-orders/:id` additionally accepts `quote_amount` and `quote_currency` for the inland freight quote.

`POST /api/v1/shipments/from-delivery-order` auto-generates `shipment_no` (e.g. `SHP-KBI-2026-xxxx`) when the field is omitted and accepts nullable `load_type` alongside `mode`.

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
