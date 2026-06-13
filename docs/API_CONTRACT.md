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

Purchase Orders:

- `GET /api/v1/purchase-orders`
- `POST /api/v1/purchase-orders`
- `GET /api/v1/purchase-orders/:id`
- `GET /api/v1/purchase-orders/:id/lines`
- `POST /api/v1/purchase-orders/:id/send`
- `POST /api/v1/purchase-orders/:id/confirm`
- `POST /api/v1/purchase-orders/:id/cancel`

`GET /api/v1/purchase-orders` and `GET /api/v1/purchase-orders/:id` enrich each purchase order with:

- `supplier`, `currency`, `incoterm`, `transport_mode`
- `total_weight_kg`, `total_containers`, `total_lots`, `lot_ids`
- `delayed_days`
- `lot_summary: { total_weight_kg, total_containers, total_lots, lot_ids }`
- `logistics_timeline.loading_port: { etd, atd }`
- `logistics_timeline.unloading_port: { eta, ata }`
- `logistics_timeline.warehouse: { eta, ata }`

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

Dashboard Tasks:

- `GET /api/v1/logistics-tasks`

`GET /api/v1/logistics-tasks` returns frontend-ready task rows for dashboard urgency, overdue task grouping, task role progress, and monthly completed-task throughput.

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

Shipments:

- `GET /api/v1/shipments`
- `GET /api/v1/shipments/:id`
- `POST /api/v1/shipments/from-delivery-order`
- `GET /api/v1/shipments/:id/lines`
- `GET /api/v1/shipments/:id/milestones`
- `POST /api/v1/shipments/:id/milestones/:code/done`
- `GET /api/v1/shipments/:id/documents`
- `POST /api/v1/shipments/:id/documents`
- `PATCH /api/v1/shipment-documents/:documentId`
- `DELETE /api/v1/shipment-documents/:documentId`
- `POST /api/v1/shipments/:id/cancel`

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
- `POST /api/v1/shipments/:shipmentId/carrier-delivery-orders`
- `POST /api/v1/carrier-delivery-orders/:id/issue`
- `POST /api/v1/carrier-delivery-orders/:id/release`
- `POST /api/v1/carrier-delivery-orders/:id/cancel`

DTO:

- `GET /api/v1/domestic-transport-orders`
- `GET /api/v1/domestic-transport-orders/:id`
- `POST /api/v1/shipments/:shipmentId/domestic-transport-orders`
- `PATCH /api/v1/domestic-transport-orders/:id`
- `POST /api/v1/domestic-transport-orders/:id/quote-pending`
- `POST /api/v1/domestic-transport-orders/:id/confirm-quote`
- `POST /api/v1/domestic-transport-orders/:id/dispatch`
- `POST /api/v1/domestic-transport-orders/:id/start-transit`
- `POST /api/v1/domestic-transport-orders/:id/deliver`
- `POST /api/v1/domestic-transport-orders/:id/close`
- `POST /api/v1/domestic-transport-orders/:id/cancel`

Mock Debug:

- `GET /api/v1/mock/health`
- `POST /api/v1/mock/reset`
- `POST /api/v1/mock/reload`
- `GET /api/v1/mock/:collection`
- `GET /api/v1/mock/:collection/:id`
- `POST /api/v1/mock/:collection`
- `PATCH /api/v1/mock/:collection/:id`
- `DELETE /api/v1/mock/:collection/:id`
