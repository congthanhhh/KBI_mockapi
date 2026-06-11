# KBI Mock API Documentation

## Overview

- Local base URL: `http://localhost:3001`
- Production base URL: `https://kbi-mockapi.onrender.com`
- API prefix: `/api`
- Content type: `application/json`
- Database: PostgreSQL
- ORM: Prisma

## Endpoint Summary

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database status |
| `GET` | `/api/currencies` | List currencies |
| `GET` | `/api/currencies/:id` | Get currency detail |
| `POST` | `/api/currencies` | Create currency |
| `PATCH` | `/api/currencies/:id` | Update currency |
| `DELETE` | `/api/currencies/:id` | Soft delete currency |
| `GET` | `/api/incoterms` | List incoterms |
| `GET` | `/api/incoterms/:id` | Get incoterm detail |
| `POST` | `/api/incoterms` | Create incoterm |
| `PATCH` | `/api/incoterms/:id` | Update incoterm |
| `DELETE` | `/api/incoterms/:id` | Soft delete incoterm |
| `GET` | `/api/transport-modes` | List transport modes |
| `GET` | `/api/transport-modes/:id` | Get transport mode detail |
| `POST` | `/api/transport-modes` | Create transport mode |
| `PATCH` | `/api/transport-modes/:id` | Update transport mode |
| `DELETE` | `/api/transport-modes/:id` | Soft delete transport mode |
| `GET` | `/api/suppliers` | List suppliers |
| `GET` | `/api/suppliers/:id` | Get supplier detail |
| `POST` | `/api/suppliers` | Create supplier |
| `PATCH` | `/api/suppliers/:id` | Update supplier |
| `DELETE` | `/api/suppliers/:id` | Soft delete supplier |
| `GET` | `/api/options` | Dropdown options for UI |
| `GET` | `/api/item-groups` | List item groups |
| `GET` | `/api/item-groups/:id` | Get item group detail |
| `GET` | `/api/item-groups/:id/items` | List items in an item group |
| `POST` | `/api/item-groups` | Create item group |
| `PUT` | `/api/item-groups/:id` | Update item group |
| `DELETE` | `/api/item-groups/:id` | Soft delete item group |
| `GET` | `/api/items` | List items |
| `GET` | `/api/items/:id` | Get item detail |
| `POST` | `/api/items` | Create item |
| `PUT` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Soft delete item and customs profiles |
| `GET` | `/api/items/:id/tax-profile` | List item customs profiles |
| `POST` | `/api/items/:id/tax-profile` | Create item customs profile |
| `PUT` | `/api/item-tax-profiles/:id` | Update item customs profile |
| `DELETE` | `/api/item-tax-profiles/:id` | Soft delete item customs profile |
| `GET` | `/api/v1/purchase-orders` | List purchase orders |
| `GET` | `/api/v1/purchase-orders/:id` | Get purchase order detail |
| `POST` | `/api/v1/purchase-orders` | Create purchase order with default slot and LOT |
| `PATCH` | `/api/v1/purchase-orders/:id` | Update draft purchase order |
| `DELETE` | `/api/v1/purchase-orders/:id` | Soft delete draft purchase order |
| `POST` | `/api/v1/purchase-orders/:id/send` | Send draft purchase order |
| `POST` | `/api/v1/purchase-orders/:id/confirm` | Supplier confirmation |
| `POST` | `/api/v1/purchase-orders/:id/cancel` | Cancel draft or sent purchase order |
| `POST` | `/api/v1/purchase-orders/:id/mark-in-production` | Mark confirmed purchase order in production |
| `POST` | `/api/v1/purchase-orders/:id/mark-ready-to-ship` | Mark in-production purchase order ready to ship |
| `GET` | `/api/v1/purchase-orders/:id/lines` | List purchase order lines |
| `POST` | `/api/v1/purchase-orders/:id/lines` | Create purchase order line |
| `PATCH` | `/api/v1/purchase-order-lines/:lineId` | Update purchase order line |
| `DELETE` | `/api/v1/purchase-order-lines/:lineId` | Soft delete purchase order line |
| `GET` | `/api/v1/purchase-orders/:id/lot-planning` | Get LOT planning board data |
| `POST` | `/api/v1/purchase-orders/:id/lot-planning/reset-default` | Reset LOT planning to SLOT-001 and LOT-001 |
| `POST` | `/api/v1/purchase-orders/:id/delivery-slots` | Create delivery slot |
| `PATCH` | `/api/v1/po-delivery-slots/:slotId` | Update delivery slot |
| `DELETE` | `/api/v1/po-delivery-slots/:slotId` | Soft delete empty delivery slot |
| `POST` | `/api/v1/purchase-orders/:id/lots` | Create empty LOT manually |
| `PATCH` | `/api/v1/po-lots/:lotId` | Update LOT metadata or status |
| `DELETE` | `/api/v1/po-lots/:lotId` | Soft delete empty LOT |
| `POST` | `/api/v1/po-lots/:lotId/split` | Split LOT |
| `POST` | `/api/v1/po-lots/:lotId/merge-back-default` | Merge a split LOT back into LOT-001 |
| `POST` | `/api/v1/po-lots/:lotId/merge` | Merge source LOTs into target LOT |
| `POST` | `/api/v1/po-lots/:lotId/transfer-lines` | Transfer item quantities between LOTs |
| `PATCH` | `/api/v1/po-lots/:lotId/move-slot` | Move LOT to another delivery slot |
| `PATCH` | `/api/v1/po-lots/reorder` | Reorder LOT cards |
| `GET` | `/api/v1/delivery-orders` | List internal delivery orders |
| `GET` | `/api/v1/delivery-orders/:id` | Get internal delivery order detail |
| `POST` | `/api/v1/delivery-orders` | Create internal delivery order header |
| `POST` | `/api/v1/delivery-orders/from-lots` | Create internal delivery order from selected LOTs |
| `PATCH` | `/api/v1/delivery-orders/:id` | Update unlocked internal delivery order |
| `DELETE` | `/api/v1/delivery-orders/:id` | Soft delete unlocked internal delivery order |
| `POST` | `/api/v1/delivery-orders/:id/ready-for-quotation` | Mark delivery order ready for quotation |
| `POST` | `/api/v1/delivery-orders/:id/confirm-quotation` | Confirm delivery order quotation |
| `POST` | `/api/v1/delivery-orders/:id/assign-to-shipment` | Assign delivery order to shipment |
| `POST` | `/api/v1/delivery-orders/:id/cancel` | Cancel delivery order |
| `POST` | `/api/v1/delivery-orders/:id/close` | Close delivery order |
| `GET` | `/api/v1/purchase-orders/:id/delivery-orders` | List delivery orders for a purchase order |
| `GET` | `/api/v1/delivery-orders/:id/lots` | List delivery order LOTs |
| `GET` | `/api/v1/delivery-orders/:id/lines` | List delivery order lines |
| `GET` | `/api/v1/delivery-orders/:deliveryOrderId/quotations` | List quotations for a delivery order |
| `POST` | `/api/v1/delivery-orders/:deliveryOrderId/quotations` | Create quotation for a delivery order |
| `GET` | `/api/v1/quotations` | List quotations |
| `GET` | `/api/v1/quotations/:quotationId` | Get quotation detail |
| `PATCH` | `/api/v1/quotations/:quotationId` | Update unlocked quotation header |
| `DELETE` | `/api/v1/quotations/:quotationId` | Soft delete unlocked quotation |
| `POST` | `/api/v1/quotations/:quotationId/request` | Mark quotation requested |
| `POST` | `/api/v1/quotations/:quotationId/receive` | Mark quotation received |
| `POST` | `/api/v1/quotations/:quotationId/submit-to-kbi` | Submit quotation to KBI |
| `POST` | `/api/v1/quotations/:quotationId/confirm-by-kbi` | Confirm quotation and mark final |
| `POST` | `/api/v1/quotations/:quotationId/reject` | Reject quotation |
| `POST` | `/api/v1/quotations/:quotationId/cancel` | Cancel quotation |
| `POST` | `/api/v1/quotations/:quotationId/expire` | Expire quotation |
| `POST` | `/api/v1/quotations/:quotationId/create-version` | Create new quotation version |
| `GET` | `/api/v1/quotations/:quotationId/versions` | List quotation versions in same group |
| `GET` | `/api/v1/quotations/:quotationId/charge-lines` | List quotation charge lines |
| `POST` | `/api/v1/quotations/:quotationId/charge-lines` | Create quotation charge line |
| `PATCH` | `/api/v1/quotation-charge-lines/:lineId` | Update quotation charge line |
| `DELETE` | `/api/v1/quotation-charge-lines/:lineId` | Soft delete quotation charge line |
| `GET` | `/api/v1/quotations/:quotationId/events` | List quotation audit events |
| `POST` | `/api/v1/shipments/from-delivery-order` | Create shipment from quotation-confirmed delivery order |
| `GET` | `/api/v1/shipments` | List shipments |
| `GET` | `/api/v1/shipments/:id` | Get shipment detail |
| `PATCH` | `/api/v1/shipments/:id` | Update unlocked shipment header |
| `POST` | `/api/v1/shipments/:id/cancel` | Cancel shipment |
| `GET` | `/api/v1/shipments/:id/lines` | List shipment lines |
| `GET` | `/api/v1/shipments/:id/milestones` | List shipment milestones |
| `POST` | `/api/v1/shipments/:id/milestones/:milestoneCode/done` | Mark shipment milestone done |
| `GET` | `/api/v1/shipments/:id/documents` | List shipment documents |
| `POST` | `/api/v1/shipments/:id/documents` | Create shipment document |
| `PATCH` | `/api/v1/shipment-documents/:documentId` | Update shipment document |
| `DELETE` | `/api/v1/shipment-documents/:documentId` | Soft delete shipment document |

## Common Response Shapes

### Paginated List

```json
{
    "data": [],
    "total": 0,
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 0,
        "totalPages": 0,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

### Detail

```json
{
    "data": {}
}
```

### Mutation

```json
{
    "data": {},
    "message": "Created successfully"
}
```

### Error

```json
{
    "message": "Item not found"
}
```

## Pagination

Supported by:

- `GET /api/currencies`
- `GET /api/incoterms`
- `GET /api/transport-modes`
- `GET /api/suppliers`
- `GET /api/item-groups`
- `GET /api/item-groups/:id/items`
- `GET /api/items`

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page, minimum `1` |
| `limit` | `number` | `20` | Items per page, minimum `1`, maximum `100` |

Example:

```http
GET /api/items?page=1&limit=20
```

## Health

### `GET /api/health`

Response `200`:

```json
{
    "status": "ok",
    "service": "eFMS API",
    "database": "connected"
}
```

Response `503`:

```json
{
    "status": "error",
    "service": "eFMS API",
    "database": "disconnected",
    "message": "Connection error message"
}
```

## Currencies

Database table: `currencies`

Fields: `id`, `currency_code`, `currency_name`, `symbol`, `decimal_places`, `is_active`, `create_at`, `update_at`, `delete_at`, `is_delete`.

### `GET /api/currencies`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `search` or `q`.
- Search fields: `currency_code`, `currency_name`, `symbol`.
- Supports `is_active=true|false`.

Example:

```http
GET /api/currencies?search=usd&is_active=true&page=1&limit=20
```

Response `200`:

```json
{
    "data": [
        {
            "id": "9dd63789-ded0-450c-9809-6015c9c3d72e",
            "currency_code": "USD",
            "currency_name": "US Dollar",
            "symbol": "$",
            "decimal_places": 2,
            "is_active": true,
            "create_at": "2026-06-10T10:00:00.000Z",
            "update_at": "2026-06-10T10:00:00.000Z",
            "delete_at": null,
            "is_delete": false
        }
    ],
    "total": 1,
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

### `GET /api/currencies/:id`

Response `200`:

```json
{
    "data": {
        "id": "9dd63789-ded0-450c-9809-6015c9c3d72e",
        "currency_code": "USD",
        "currency_name": "US Dollar",
        "symbol": "$",
        "decimal_places": 2,
        "is_active": true,
        "delete_at": null,
        "is_delete": false
    }
}
```

### `POST /api/currencies`

- Required fields: `currency_code`, `currency_name`.
- `decimal_places` must be an integer from `0` to `6`.
- Unknown fields are ignored.

Request body:

```json
{
    "currency_code": "USD",
    "currency_name": "US Dollar",
    "symbol": "$",
    "decimal_places": 2,
    "is_active": true
}
```

Response `201`:

```json
{
    "data": {
        "id": "9dd63789-ded0-450c-9809-6015c9c3d72e",
        "currency_code": "USD",
        "currency_name": "US Dollar",
        "symbol": "$",
        "decimal_places": 2,
        "is_active": true
    },
    "message": "Created successfully"
}
```

### `PATCH /api/currencies/:id`

Allowed fields: `currency_code`, `currency_name`, `symbol`, `decimal_places`, `is_active`.

`decimal_places` must be an integer from `0` to `6`.

### `DELETE /api/currencies/:id`

Soft deletes a currency by setting `is_delete = true` and `delete_at`.

## Incoterms

Database table: `incoterms`

Fields: `id`, `incoterm_code`, `incoterm_name`, `description`, `is_active`, `create_at`, `update_at`, `delete_at`, `is_delete`.

### `GET /api/incoterms`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `search` or `q`.
- Search fields: `incoterm_code`, `incoterm_name`, `description`.
- Supports `is_active=true|false`.

Example:

```http
GET /api/incoterms?search=fob&is_active=true
```

### `GET /api/incoterms/:id`

Returns one active incoterm.

### `POST /api/incoterms`

- Required fields: `incoterm_code`, `incoterm_name`.
- Unknown fields are ignored.

Request body:

```json
{
    "incoterm_code": "FOB",
    "incoterm_name": "Free On Board",
    "description": "Seller delivers goods on board the vessel",
    "is_active": true
}
```

### `PATCH /api/incoterms/:id`

Allowed fields: `incoterm_code`, `incoterm_name`, `description`, `is_active`.

### `DELETE /api/incoterms/:id`

Soft deletes an incoterm by setting `is_delete = true` and `delete_at`.

## Transport Modes

Database table: `transport_modes`

Fields: `id`, `mode_code`, `mode_name`, `mode_type`, `description`, `is_international`, `is_active`, `create_at`, `update_at`, `delete_at`, `is_delete`.

### `GET /api/transport-modes`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `search` or `q`.
- Search fields: `mode_code`, `mode_name`, `mode_type`, `description`.
- Supports `mode_type`, `is_international=true|false`, and `is_active=true|false`.

Example:

```http
GET /api/transport-modes?mode_type=SEA&is_international=true&is_active=true
```

### `GET /api/transport-modes/:id`

Returns one active transport mode.

### `POST /api/transport-modes`

- Required fields: `mode_code`, `mode_name`, `mode_type`.
- `mode_type` must be one of `SEA`, `AIR`, `ROAD`, `RAIL`, `MULTIMODAL`, `TRUCKING`, or `OTHER`.
- Unknown fields are ignored.

Request body:

```json
{
    "mode_code": "SEA_FCL",
    "mode_name": "Sea Freight - FCL",
    "mode_type": "SEA",
    "description": "Full container load",
    "is_international": true,
    "is_active": true
}
```

### `PATCH /api/transport-modes/:id`

Allowed fields: `mode_code`, `mode_name`, `mode_type`, `description`, `is_international`, `is_active`.

`mode_type` must be one of `SEA`, `AIR`, `ROAD`, `RAIL`, `MULTIMODAL`, `TRUCKING`, or `OTHER`.

### `DELETE /api/transport-modes/:id`

Soft deletes a transport mode by setting `is_delete = true` and `delete_at`.

## Suppliers

Database table: `suppliers`

Fields: `id`, `supplier_code`, `supplier_name`, `supplier_roles`, `country`, `address`, `contact_name`, `contact_email`, `contact_phone`, `payment_term`, `default_currency_code`, `default_incoterm_code`, `default_currency_id`, `default_incoterm_id`, `lead_time_days`, `is_active`, `create_at`, `update_at`, `delete_at`, `is_delete`.

### `GET /api/suppliers`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `search` or `q`.
- Search fields: `supplier_code`, `supplier_name`, `country`, `address`, `contact_name`, `contact_email`, `contact_phone`, `payment_term`, `default_currency_code`, `default_incoterm_code`.
- Supports `role`, `country`, and `is_active=true|false`.
- Response includes `default_currency`, `default_incoterm`, and active `supplier_transport_modes`.
- `default_currency_id` and `default_incoterm_id` are the normalized relationship fields.
- `default_currency_code` and `default_incoterm_code` are still returned for backward compatibility.

Examples:

```http
GET /api/suppliers?search=seal
GET /api/suppliers?role=FORWARDER
GET /api/suppliers?role=TRUCKING_VENDOR
GET /api/suppliers?role=SUPPLIER&country=China
```

### `GET /api/suppliers/:id`

Returns one active supplier with `default_currency`, `default_incoterm`, and active `supplier_transport_modes`.

### `POST /api/suppliers`

- Required fields: `supplier_code`, `supplier_name`.
- `lead_time_days` must be a non-negative integer.
- Unknown fields are ignored.

Request body:

```json
{
    "supplier_code": "SUP001",
    "supplier_name": "SHANGHAI NEW POWER AUTOMOTIVE TECHNOLOGY CO.,LTD",
    "supplier_roles": ["SUPPLIER", "SHIPPER"],
    "country": "China",
    "address": "Shanghai",
    "contact_name": "Sales",
    "contact_email": "sales@example.com",
    "contact_phone": "+86 123456",
    "payment_term": "T/T",
    "default_currency_id": "9dd63789-ded0-450c-9809-6015c9c3d72e",
    "default_incoterm_id": "c1b6f2d8-7f28-42ab-a9d3-04128f1c9640",
    "transport_mode_ids": ["5d51ff5a-e4d8-44ad-a8bc-0b2e17bb2968"],
    "default_transport_mode_id": "5d51ff5a-e4d8-44ad-a8bc-0b2e17bb2968",
    "lead_time_days": 7,
    "is_active": true
}
```

`default_currency_code` and `default_incoterm_code` are also accepted as legacy request fields. When a matching currency/incoterm exists, the API resolves and stores the related `*_id` fields.

### `PATCH /api/suppliers/:id`

Allowed fields: `supplier_code`, `supplier_name`, `supplier_roles`, `country`, `address`, `contact_name`, `contact_email`, `contact_phone`, `payment_term`, `default_currency_code`, `default_incoterm_code`, `default_currency_id`, `default_incoterm_id`, `transport_mode_ids`, `default_transport_mode_id`, `lead_time_days`, `is_active`.

`lead_time_days` must be a non-negative integer.

### `DELETE /api/suppliers/:id`

Soft deletes a supplier by setting `is_delete = true` and `delete_at`.

## Options

### `GET /api/options`

- Returns active, non-deleted options for dropdown UI.
- Supports `types=currencies,incoterms,transport_modes,suppliers`.
- Supports `role` when `types` includes `suppliers`.
- If `types` is omitted, all option groups are returned.

Examples:

```http
GET /api/options
GET /api/options?types=currencies,incoterms,transport_modes
GET /api/options?types=suppliers&role=FORWARDER
```

Response `200`:

```json
{
    "data": {
        "currencies": [
            { "label": "USD", "value": "USD" },
            { "label": "VND", "value": "VND" }
        ],
        "incoterms": [
            { "label": "FOB", "value": "FOB" },
            { "label": "CIF", "value": "CIF" }
        ],
        "transport_modes": [
            { "label": "Sea Freight - FCL", "value": "SEA_FCL" },
            { "label": "Air Freight", "value": "AIR" }
        ],
        "suppliers": [
            {
                "label": "SHANGHAI NEW POWER AUTOMOTIVE TECHNOLOGY CO.,LTD",
                "value": "4e71f73d-706a-4ca8-b887-66cc2a077f17"
            }
        ]
    },
    "meta": {},
    "errors": []
}
```

## Item Groups

Database table: `item_groups`

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Auto | Item group ID |
| `group_code` | `string` | No | Unique group code |
| `group_name` | `string` | Yes | Group name |
| `description` | `string` | No | Group description |
| `default_hs_code` | `string` | No | Default/header HS code for the group |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |

### `GET /api/item-groups`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `q`.
- Search fields: `group_code`, `group_name`, `description`, `default_hs_code`.

Query parameters:

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `20` | Items per page |
| `q` | `string` | None | Search keyword |

Example:

```http
GET /api/item-groups?page=1&limit=10&q=850440
```

Response `200`:

```json
{
    "data": [
        {
            "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
            "group_code": "GRP001",
            "group_name": "Dong co dau SDEC 4Z2.3-G21",
            "description": "Engine related items",
            "default_hs_code": "850440",
            "create_at": "2026-06-09T10:00:00.000Z",
            "update_at": "2026-06-09T10:00:00.000Z",
            "delete_at": null,
            "is_delete": false
        }
    ],
    "total": 1,
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

### `GET /api/item-groups/:id`

Response `200`:

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_code": "GRP001",
        "group_name": "Dong co dau SDEC 4Z2.3-G21",
        "description": "Engine related items",
        "default_hs_code": "850440",
        "is_delete": false
    }
}
```

Response `404`:

```json
{
    "message": "Item group not found"
}
```

### `GET /api/item-groups/:id/items`

- Returns items where `item_group_id = :id` and `is_delete = false`.
- Returns `404` if the item group does not exist or was deleted.
- Supports the same query parameters and response shape as `GET /api/items`.

Example:

```http
GET /api/item-groups/f99139ff-119a-4d2a-b654-71427c4167ed/items?page=1&limit=10&q=SDEC
```

### `POST /api/item-groups`

- Required fields: `group_name`.
- Unknown fields are ignored.

Request body:

```json
{
    "group_code": "GRP001",
    "group_name": "Dong co dau SDEC 4Z2.3-G21",
    "description": "Engine related items",
    "default_hs_code": "850440"
}
```

Response `201`:

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_code": "GRP001",
        "group_name": "Dong co dau SDEC 4Z2.3-G21",
        "description": "Engine related items",
        "default_hs_code": "850440"
    },
    "message": "Created successfully"
}
```

Response `400`:

```json
{
    "message": "group_name is required"
}
```

### `PUT /api/item-groups/:id`

- Updates an active item group.
- At least one valid item group field is required.

Allowed fields:

- `group_code`
- `group_name`
- `description`
- `default_hs_code`

Request body:

```json
{
    "group_name": "Dong co dau SDEC updated",
    "default_hs_code": "850300"
}
```

Response `200`:

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_name": "Dong co dau SDEC updated",
        "default_hs_code": "850300"
    },
    "message": "Updated successfully"
}
```

### `DELETE /api/item-groups/:id`

- Soft deletes an item group by setting `is_delete = true` and `delete_at`.

Response `200`:

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "is_delete": true,
        "delete_at": "2026-06-09T10:00:00.000Z"
    },
    "message": "Deleted successfully"
}
```

## Items

Database table: `item_master`

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Auto | Item ID |
| `item_code` | `string` | Yes | Unique item code |
| `item_name` | `string` | Yes | Item name |
| `item_description` | `string` | No | Item description |
| `item_group_id` | `uuid` | No | Related item group ID |
| `unit` | `string` | No | Unit |
| `item_type` | `string` | No | Item type |
| `origin_country` | `string` | No | Origin country |
| `brand` | `string` | No | Brand from item description or source data |
| `model` | `string` | No | Model or technical code |
| `is_new` | `boolean` | No | Whether item is new, default `true` |
| `lead_time_days` | `number` | No | Lead time in days |
| `moq` | `decimal` | No | Minimum order quantity |
| `is_active` | `boolean` | No | Active flag |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |
| `item_group` | `object` | Auto | Related item group |
| `customs_profiles` | `array` | Auto | Active customs profiles related to the item |

### `GET /api/items`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports keyword search with `q`.
- Search fields: `item_code`, `item_name`, `item_description`, `unit`, `item_type`, `origin_country`, `brand`, `model`.
- Related customs profile search fields: `hs_code`, `co_form`, `co_tax_note`, `customs_type`, `customs_note`, `reference_doc_no`, `location_code`, `tax_note`.
- Supports filtering by `item_group_id`.

Query parameters:

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `20` | Items per page |
| `q` | `string` | None | Search keyword |
| `item_group_id` | `uuid` | None | Filter by item group |

Example:

```http
GET /api/items?page=1&limit=10&q=SDEC
```

Response `200`:

```json
{
    "data": [
        {
            "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "item_code": "ITEM001",
            "item_name": "Dong co dau SDEC 4Z2.3-G21",
            "item_description": "Hang moi 100%",
            "item_group_id": "f99139ff-119a-4d2a-b654-71427c4167ed",
            "unit": "PCS",
            "item_type": "MATERIAL",
            "origin_country": "China",
            "brand": "SDEC",
            "model": "4Z2.3-G21",
            "is_new": true,
            "lead_time_days": 7,
            "moq": "1.0000",
            "is_active": true,
            "create_at": "2026-06-09T10:00:00.000Z",
            "update_at": "2026-06-09T10:00:00.000Z",
            "delete_at": null,
            "is_delete": false,
            "item_group": {
                "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
                "group_code": "GRP001",
                "group_name": "Dong co dau SDEC 4Z2.3-G21",
                "description": "Engine related items",
                "default_hs_code": "850440",
                "create_at": "2026-06-09T10:00:00.000Z",
                "update_at": "2026-06-09T10:00:00.000Z",
                "delete_at": null,
                "is_delete": false
            },
            "customs_profiles": [
                {
                    "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
                    "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
                    "hs_code": "85030090",
                    "import_duty_rate": "5.00",
                    "vat_rate": "10.00",
                    "co_form": "FORM E",
                    "co_tax_note": "CO FORM E = 0%",
                    "customs_type": "A12",
                    "customs_note": "Normal import",
                    "reference_doc_no": "VB245",
                    "location_code": "B05",
                    "tax_note": "Thue suat: C",
                    "preferential_import_duty_rate": "0.00",
                    "is_default": true,
                    "create_at": "2026-06-09T10:00:00.000Z",
                    "update_at": "2026-06-09T10:00:00.000Z",
                    "delete_at": null,
                    "is_delete": false
                }
            ]
        }
    ],
    "total": 1,
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

### `GET /api/items/:id`

Response `200`:

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "item_code": "ITEM001",
        "item_name": "Dong co dau SDEC 4Z2.3-G21",
        "brand": "SDEC",
        "model": "4Z2.3-G21",
        "is_new": true,
        "is_active": true,
        "is_delete": false,
        "customs_profiles": [
            {
                "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
                "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
                "hs_code": "85030090",
                "import_duty_rate": "5.00",
                "vat_rate": "10.00",
                "co_form": "FORM E",
                "co_tax_note": "CO FORM E = 0%",
                "customs_type": "A12",
                "customs_note": "Normal import",
                "reference_doc_no": "VB245",
                "location_code": "B05",
                "tax_note": "Thue suat: C",
                "preferential_import_duty_rate": "0.00",
                "is_default": true,
                "create_at": "2026-06-09T10:00:00.000Z",
                "update_at": "2026-06-09T10:00:00.000Z",
                "delete_at": null,
                "is_delete": false
            }
        ]
    }
}
```

Response `404`:

```json
{
    "message": "Item not found"
}
```

### `POST /api/items`

- Required fields: `item_code`, `item_name`.
- `lead_time_days` must be a non-negative integer.
- `moq` must be greater than or equal to `0`.
- Unknown fields are ignored.

Request body:

```json
{
    "item_code": "ITEM001",
    "item_name": "Dong co dau SDEC 4Z2.3-G21",
    "item_description": "Hang moi 100%",
    "item_group_id": "f99139ff-119a-4d2a-b654-71427c4167ed",
    "unit": "PCS",
    "item_type": "MATERIAL",
    "origin_country": "China",
    "brand": "SDEC",
    "model": "4Z2.3-G21",
    "is_new": true,
    "lead_time_days": 7,
    "moq": 1,
    "is_active": true
}
```

Response `201`:

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "item_code": "ITEM001",
        "item_name": "Dong co dau SDEC 4Z2.3-G21",
        "brand": "SDEC",
        "model": "4Z2.3-G21",
        "is_new": true
    },
    "message": "Created successfully"
}
```

Response `400`:

```json
{
    "message": "item_code is required"
}
```

```json
{
    "message": "item_name is required"
}
```

### `PUT /api/items/:id`

- Updates an active item.
- At least one valid item field is required.
- `lead_time_days` must be a non-negative integer when provided.
- `moq` must be greater than or equal to `0` when provided.

Allowed fields:

- `item_code`
- `item_name`
- `item_description`
- `item_group_id`
- `unit`
- `item_type`
- `origin_country`
- `brand`
- `model`
- `is_new`
- `lead_time_days`
- `moq`
- `is_active`

Request body:

```json
{
    "brand": "SDEC",
    "model": "4Z2.3-G21",
    "lead_time_days": 10,
    "is_active": false
}
```

Response `200`:

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "brand": "SDEC",
        "model": "4Z2.3-G21",
        "lead_time_days": 10,
        "is_active": false
    },
    "message": "Updated successfully"
}
```

### `DELETE /api/items/:id`

- Soft deletes an item.
- Also soft deletes active customs profiles linked to that item.

Response `200`:

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "is_delete": true,
        "delete_at": "2026-06-09T10:00:00.000Z",
        "deleted_tax_profiles": 2
    },
    "message": "Deleted successfully"
}
```

## Item Customs Profiles

Database table: `item_customs_profiles`

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Auto | Customs profile ID |
| `item_id` | `uuid` | Auto from path | Item ID |
| `hs_code` | `string` | No | Item/detail HS code |
| `import_duty_rate` | `decimal` | No | Import duty rate |
| `vat_rate` | `decimal` | No | VAT rate |
| `co_form` | `string` | No | C/O form |
| `co_tax_note` | `string` | No | C/O tax note |
| `customs_type` | `string` | No | Customs type |
| `customs_note` | `string` | No | Customs note |
| `reference_doc_no` | `string` | No | Reference document number |
| `location_code` | `string` | No | Location, warehouse, or internal code |
| `tax_note` | `string` | No | Tax note |
| `preferential_import_duty_rate` | `decimal` | No | Preferential import duty rate from C/O |
| `is_default` | `boolean` | No | Default profile flag |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |

### `GET /api/items/:id/tax-profile`

- Returns active customs profiles for an active item.
- Returns `404` if the item does not exist or was deleted.

Response `200`:

```json
{
    "data": [
        {
            "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
            "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "hs_code": "85030090",
            "import_duty_rate": "5.00",
            "vat_rate": "10.00",
            "co_form": "FORM E",
            "co_tax_note": "CO FORM E = 0%",
            "customs_type": "A12",
            "customs_note": "Normal import",
            "reference_doc_no": "VB245",
            "location_code": "B05",
            "tax_note": "Thue suat: C",
            "preferential_import_duty_rate": "0.00",
            "is_default": true,
            "create_at": "2026-06-09T10:00:00.000Z",
            "update_at": "2026-06-09T10:00:00.000Z",
            "delete_at": null,
            "is_delete": false
        }
    ],
    "total": 1
}
```

### `POST /api/items/:id/tax-profile`

- Creates a customs profile for an active item.
- Rate fields `import_duty_rate`, `vat_rate`, and `preferential_import_duty_rate` must be between `0` and `100` when provided.
- Unknown fields are ignored.

Request body:

```json
{
    "hs_code": "85030090",
    "import_duty_rate": 5,
    "vat_rate": 10,
    "co_form": "FORM E",
    "co_tax_note": "CO FORM E = 0%",
    "customs_type": "A12",
    "customs_note": "Normal import",
    "reference_doc_no": "VB245",
    "location_code": "B05",
    "tax_note": "Thue suat: C",
    "preferential_import_duty_rate": 0,
    "is_default": true
}
```

Response `201`:

```json
{
    "data": {
        "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
        "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "hs_code": "85030090",
        "import_duty_rate": "5.00",
        "vat_rate": "10.00",
        "preferential_import_duty_rate": "0.00"
    },
    "message": "Created successfully"
}
```

Response `404`:

```json
{
    "message": "Item not found"
}
```

### `PUT /api/item-tax-profiles/:id`

- Updates an active customs profile.
- At least one valid customs profile field is required.
- Rate fields `import_duty_rate`, `vat_rate`, and `preferential_import_duty_rate` must be between `0` and `100` when provided.

Allowed fields:

- `hs_code`
- `import_duty_rate`
- `vat_rate`
- `co_form`
- `co_tax_note`
- `customs_type`
- `customs_note`
- `reference_doc_no`
- `location_code`
- `tax_note`
- `preferential_import_duty_rate`
- `is_default`

Request body:

```json
{
    "import_duty_rate": 7.5,
    "preferential_import_duty_rate": 0,
    "reference_doc_no": "VB245",
    "tax_note": "Updated tax note"
}
```

Response `200`:

```json
{
    "data": {
        "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
        "import_duty_rate": "7.50",
        "preferential_import_duty_rate": "0.00",
        "reference_doc_no": "VB245",
        "tax_note": "Updated tax note"
    },
    "message": "Updated successfully"
}
```

Response `404`:

```json
{
    "message": "Item tax profile not found"
}
```

### `DELETE /api/item-tax-profiles/:id`

- Soft deletes an active customs profile.

Response `200`:

```json
{
    "data": {
        "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
        "is_delete": true,
        "delete_at": "2026-06-09T10:00:00.000Z"
    },
    "message": "Deleted successfully"
}
```

## Notes

- `item_groups` maps to Prisma model `ItemGroup`.
- `item_master` maps to Prisma model `ItemMaster`.
- `item_customs_profiles` maps to Prisma model `ItemCustomsProfile`.
- `currencies` maps to Prisma model `Currency`.
- `incoterms` maps to Prisma model `Incoterm`.
- `transport_modes` maps to Prisma model `TransportMode`.
- `suppliers` maps to Prisma model `Supplier`.
- `supplier_transport_modes` maps to Prisma model `SupplierTransportMode`.
- API paths keep `/tax-profile` and `/item-tax-profiles` for backward compatibility.
- Delete APIs use soft delete with `is_delete = true` and `delete_at`.
- Decimal values from Prisma may be serialized as strings in JSON responses.
- Unknown request body fields are ignored by create and update APIs.

## Purchase Orders V1

Database tables: `purchase_orders`, `purchase_order_lines`, `purchase_order_confirmations`, `purchase_order_confirmation_lines`, `po_delivery_slots`, `po_lots`, `po_lot_lines`.

All `/api/v1/*` responses use:

```json
{
    "data": {},
    "meta": {},
    "errors": []
}
```

Errors use `errors[0].code` values: `VALIDATION_ERROR`, `STATE_CONFLICT`, or `BUSINESS_RULE_VIOLATION`.

### `GET /api/v1/purchase-orders`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports `search` or `q`, `status`, and `supplier_id`.

Example:

```http
GET /api/v1/purchase-orders?status=DRAFT&page=1&limit=20
```

### `POST /api/v1/purchase-orders`

- Required fields: `po_no`, `supplier_id`.
- Optional header fields: `contract_no`, `currency_id`, `incoterm_id`, `transport_mode_id`, `po_type`, `payment_term`, `exchange_rate`, `expected_etd`, `expected_eta`, `notes`.
- `po_type` must be `SEA`, `AIR`, or `DOMESTIC` when provided.
- `exchange_rate` must be greater than `0`.
- Optional `lines` array creates initial PO lines.
- Each line requires `item_id`, `line_no`, `qty_ordered`, and `unit`.
- Line `unit_price` must be greater than or equal to `0`; `tax_rate` and `discount_pct` must be between `0` and `100`.
- After create, the API creates `SLOT-001`, `LOT-001`, and puts all initial lines into `LOT-001`.

Request body:

```json
{
    "po_no": "PO-2026-0001",
    "supplier_id": "4e71f73d-706a-4ca8-b887-66cc2a077f17",
    "currency_id": "9dd63789-ded0-450c-9809-6015c9c3d72e",
    "incoterm_id": "c1b6f2d8-7f28-42ab-a9d3-04128f1c9640",
    "transport_mode_id": "5d51ff5a-e4d8-44ad-a8bc-0b2e17bb2968",
    "payment_term": "T/T",
    "lines": [
        {
            "line_no": 1,
            "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "item_customs_profile_id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
            "qty_ordered": 1000,
            "unit": "PCS",
            "unit_price": 12.5
        }
    ]
}
```

### `PATCH /api/v1/purchase-orders/:id`

- Only allowed when `status = DRAFT`.
- Allowed fields are the same header fields as create, except `status`.
- `po_type` must be `SEA`, `AIR`, or `DOMESTIC` when provided.
- `exchange_rate` must be greater than `0` when provided.

### `DELETE /api/v1/purchase-orders/:id`

- Only allowed when `status = DRAFT`.
- Soft deletes PO and related lines, confirmations, delivery slots, lots, and lot lines.

### PO Actions

`POST /api/v1/purchase-orders/:id/send`

- Requires `status = DRAFT`.
- Sets `status = SENT` and `sent_at = now()`.

`POST /api/v1/purchase-orders/:id/cancel`

- Requires `status = DRAFT` or `SENT`.
- Sets `status = CANCELLED`, `cancelled_at = now()`, and optional `cancel_reason`.

`POST /api/v1/purchase-orders/:id/mark-in-production`

- Requires `status = CONFIRMED`.
- Sets `status = IN_PRODUCTION`.

`POST /api/v1/purchase-orders/:id/mark-ready-to-ship`

- Requires `status = IN_PRODUCTION`.
- Sets `status = READY_TO_SHIP`.

`POST /api/v1/purchase-orders/:id/confirm`

- Requires `status = SENT`.
- Creates supplier confirmation header and lines.
- Updates `purchase_orders.status = CONFIRMED`, `confirmed_at = now()`, and each line `qty_confirmed = sum(confirmed_qty)`.
- `confirmed_qty` must be greater than or equal to `0`.
- When `can_fulfill = false`, `confirmed_qty` must be `0`.
- Rejects `confirmed_qty > qty_ordered`.

Request body:

```json
{
    "confirmed_by": "Supplier Sales",
    "supplier_ref_no": "SUP-REF-001",
    "is_full_shipment": true,
    "allow_partial_shipment": false,
    "lines": [
        {
            "purchase_order_line_id": "7cf45e4d-6d1d-4836-a32a-ae934d313e54",
            "confirmed_qty": 1000,
            "cargo_ready_date": "2026-07-01",
            "can_fulfill": true
        }
    ]
}
```

### PO Lines

`GET /api/v1/purchase-orders/:id/lines`

- Lists active lines for a PO.

`POST /api/v1/purchase-orders/:id/lines`

- Only allowed when parent PO is `DRAFT`.
- Required fields: `item_id`, `line_no`, `qty_ordered`, `unit`.
- `qty_ordered` must be greater than `0`.
- `unit_price` must be greater than or equal to `0`; `tax_rate` and `discount_pct` must be between `0` and `100`.
- New lines are added to `LOT-001` by default.

`PATCH /api/v1/purchase-order-lines/:lineId`

- Only allowed when parent PO is `DRAFT`.
- Rejects `qty_ordered` lower than current active LOT quantity.
- `unit` cannot be empty when provided.
- `unit_price` must be greater than or equal to `0`; `tax_rate` and `discount_pct` must be between `0` and `100` when provided.

`DELETE /api/v1/purchase-order-lines/:lineId`

- Only allowed when parent PO is `DRAFT`.
- Soft deletes the line and active LOT lines for that PO line.

### LOT Planning

`GET /api/v1/purchase-orders/:id/lot-planning`

- Returns the PO, lines, delivery slots, lots, and lot lines grouped for board rendering.

`POST /api/v1/purchase-orders/:id/lot-planning/reset-default`

- Resets LOT planning back to the default initial state.
- Re-activates or creates `SLOT-001` and `LOT-001`.
- Moves every active PO line quantity back to `LOT-001`.
- Soft deletes active non-default LOTs, LOT lines, and delivery slots.
- Returns `409 STATE_CONFLICT` when any active LOT is in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.

`POST /api/v1/purchase-orders/:id/delivery-slots`

- Required field: `slot_no`.
- Allowed fields: `slot_no`, `slot_name`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `delivery_address`, `warehouse_name`, `status`, `sort_order`, `notes`.
- `slot_no` must be unique among active delivery slots in the same purchase order.
- Reusing a `slot_no` from a soft-deleted slot is allowed; the API releases the deleted record's old number before creating the new slot.

`PATCH /api/v1/po-delivery-slots/:slotId`

- Updates delivery slot metadata.
- Allowed fields: `slot_no`, `slot_name`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `delivery_address`, `warehouse_name`, `status`, `sort_order`, `notes`.
- `status` must be one of `PLANNED`, `CONFIRMED`, or `CANCELLED`.
- Keeping the current `slot_no` is allowed. Changing to another active slot's `slot_no` returns `409 STATE_CONFLICT`.

`DELETE /api/v1/po-delivery-slots/:slotId`

- Soft deletes a delivery slot by setting `is_delete = true` and `delete_at`.
- Returns `409 STATE_CONFLICT` when the slot still has active LOTs.

`POST /api/v1/purchase-orders/:id/lots`

- Creates an empty LOT manually under an existing delivery slot.
- Required fields: `delivery_slot_id`, `lot_no`.
- Allowed fields: `delivery_slot_id`, `lot_no`, `lot_name`, `status`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `sort_order`, `notes`.
- `delivery_slot_id` must belong to the same purchase order.
- `status` must be one of `PLANNED`, `READY`, `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- `lot_no` must be unique among active LOTs in the same purchase order.
- Reusing a `lot_no` from a soft-deleted LOT is allowed; the API releases the deleted record's old number before creating the new LOT.

Request body:

```json
{
    "delivery_slot_id": "a3382a4d-a6af-4a73-9c09-bf622a7e8e88",
    "lot_no": "LOT-003",
    "lot_name": "Manual split planning lot",
    "status": "PLANNED",
    "sort_order": 3,
    "notes": "Waiting for split quantities"
}
```

`PATCH /api/v1/po-lots/:lotId`

- Updates LOT metadata or status.
- Allowed fields: `lot_no`, `lot_name`, `status`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `sort_order`, `notes`.
- Use `PATCH /api/v1/po-lots/:lotId/move-slot` for drag/drop movement so the UI intent remains explicit.
- Keeping the current `lot_no` is allowed. Changing to another active LOT's `lot_no` returns `409 STATE_CONFLICT`.

Request body:

```json
{
    "lot_name": "Cargo ready batch",
    "status": "READY",
    "planned_cargo_ready_date": "2026-07-01",
    "notes": "Supplier confirmed cargo ready"
}
```

`DELETE /api/v1/po-lots/:lotId`

- Soft deletes an empty LOT by setting `is_delete = true` and `delete_at`.
- Returns `409 STATE_CONFLICT` when the LOT is locked or still has active `po_lot_lines`.
- Locked statuses: `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, `CANCELLED`.

`POST /api/v1/po-lots/:lotId/split`

- Rejects lots in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- Required fields: `new_lot_no`, `target_slot_id`, `lines`.
- Each line requires `purchase_order_line_id` and `split_qty`.
- Rejects `split_qty` greater than the source LOT line quantity.
- `new_lot_no` must be unique among active LOTs in the same purchase order.
- Reusing a `new_lot_no` from a soft-deleted LOT is allowed.

Request body:

```json
{
    "new_lot_no": "LOT-002",
    "target_slot_id": "a3382a4d-a6af-4a73-9c09-bf622a7e8e88",
    "lines": [
        {
            "purchase_order_line_id": "7cf45e4d-6d1d-4836-a32a-ae934d313e54",
            "split_qty": 200
        }
    ]
}
```

`POST /api/v1/po-lots/:lotId/merge`

- Merges source LOTs into the target LOT identified by `:lotId`.
- This is the generic planning merge. For the business action "merge the split LOT back to the original/default LOT", use `POST /api/v1/po-lots/:lotId/merge-back-default` where `:lotId` is the split/source LOT.
- Target and source LOTs must belong to the same purchase order.
- Rejects target/source lots in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- For each source LOT line:
  - If target already has the same `purchase_order_line_id`, quantities are added.
  - If target does not have the line, a new target LOT line is created.
  - Source LOT lines are soft deleted, so their active quantity is treated as 0.
- If `delete_empty_source_lots` is omitted or `true`, source LOTs are soft deleted after merge.
- Total quantity across LOTs does not change.

Request body:

```json
{
    "source_lot_ids": [
        "d5821d79-8f2c-45e0-9531-7a627c89ec50",
        "ec62607a-0d36-4b6e-8743-e96328bc961a"
    ],
    "delete_empty_source_lots": true
}
```

`POST /api/v1/po-lots/:lotId/merge-back-default`

- Merges the split/source LOT identified by `:lotId` back into the purchase order's original `LOT-001`.
- Use this endpoint when undoing a previous split for one LOT.
- Rejects when `:lotId` is already `LOT-001`.
- Rejects source/default lots in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- Source LOT lines are added back to `LOT-001`, then source LOT lines are soft deleted so their active quantity is treated as 0.
- If `delete_empty_source_lots` is omitted or `true`, the source LOT is soft deleted after merge.
- Total quantity across LOTs does not change.

Request body:

```json
{
    "delete_empty_source_lots": true
}
```

`POST /api/v1/po-lots/:lotId/transfer-lines`

- Transfers selected item quantities from the source LOT identified by `:lotId` to `target_lot_id`.
- Source and target LOTs must belong to the same purchase order.
- Rejects source/target lots in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- Rejects `transfer_qty` greater than source LOT line quantity.
- Total quantity across LOTs does not change.

Request body:

```json
{
    "target_lot_id": "a3382a4d-a6af-4a73-9c09-bf622a7e8e88",
    "lines": [
        {
            "purchase_order_line_id": "7cf45e4d-6d1d-4836-a32a-ae934d313e54",
            "transfer_qty": 100
        }
    ]
}
```

`PATCH /api/v1/po-lots/:lotId/move-slot`

- Rejects lots in `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, or `CANCELLED`.
- Updates `delivery_slot_id` and `sort_order`.

Request body:

```json
{
    "target_slot_id": "a3382a4d-a6af-4a73-9c09-bf622a7e8e88",
    "new_sort_order": 2
}
```

`PATCH /api/v1/po-lots/reorder`

Request body:

```json
{
    "lots": [
        {
            "lot_id": "d5821d79-8f2c-45e0-9531-7a627c89ec50",
            "delivery_slot_id": "a3382a4d-a6af-4a73-9c09-bf622a7e8e88",
            "sort_order": 1
        }
    ]
}
```

## Delivery Orders V1

Database tables: `delivery_orders`, `delivery_order_lots`, `delivery_order_lines`.

Internal Delivery Order is the internal handling document created after PO confirmation and LOT planning. It is not a Carrier DO or Domestic Transport Order.

### `GET /api/v1/delivery-orders`

- Returns records where `is_delete = false`.
- Supports pagination.
- Supports `search` or `q`, `status`, `purchase_order_id`, and `transport_mode_id`.

Example:

```http
GET /api/v1/delivery-orders?status=DRAFT&page=1&limit=20
```

### `GET /api/v1/delivery-orders/:id`

- Returns one active delivery order with purchase order, transport mode, lots, and lines.

### `POST /api/v1/delivery-orders`

- Creates a delivery order header without LOTs.
- Required fields: `do_no`, `purchase_order_id`.
- Allowed fields: `transport_mode_id`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `origin_address`, `destination_address`, `warehouse_name`, `requested_by`, `handled_by`, `notes`.
- Parent PO must be `CONFIRMED`, `IN_PRODUCTION`, or `READY_TO_SHIP`.

### `POST /api/v1/delivery-orders/from-lots`

- Creates a delivery order, links selected LOTs, and creates delivery order lines from active `po_lot_lines`.
- Required fields: `do_no`, `purchase_order_id`, `lot_ids`.
- Each selected LOT must belong to the PO, must not be locked, must contain at least one active line, and must not already belong to another active delivery order.
- LOT locked statuses: `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, `CANCELLED`.

Request body:

```json
{
    "do_no": "DO-2026-0001",
    "purchase_order_id": "4f40ce06-e5a9-4f2d-b85f-c7b42c638bb0",
    "lot_ids": [
        "d5821d79-8f2c-45e0-9531-7a627c89ec50"
    ],
    "transport_mode_id": "5d51ff5a-e4d8-44ad-a8bc-0b2e17bb2968",
    "planned_cargo_ready_date": "2026-06-25",
    "planned_etd": "2026-06-28",
    "planned_eta": "2026-07-05",
    "origin_address": "Supplier warehouse",
    "destination_address": "KBI warehouse",
    "warehouse_name": "KBI Main Warehouse",
    "requested_by": "Buyer A",
    "handled_by": "Logistics B",
    "notes": "Create DO from selected lots"
}
```

### `PATCH /api/v1/delivery-orders/:id`

- Updates metadata while the delivery order is not locked.
- Locked statuses: `ASSIGNED_TO_SHIPMENT`, `CANCELLED`, `CLOSED`.
- Allowed fields: `do_no`, `transport_mode_id`, `planned_cargo_ready_date`, `planned_etd`, `planned_eta`, `origin_address`, `destination_address`, `warehouse_name`, `requested_by`, `handled_by`, `notes`.

### `DELETE /api/v1/delivery-orders/:id`

- Soft deletes an unlocked delivery order and its active lots/lines by setting `is_delete = true` and `delete_at`.

### Delivery Order Actions

`POST /api/v1/delivery-orders/:id/ready-for-quotation`

- Requires `status = DRAFT`.
- Sets `status = READY_FOR_QUOTATION`.

`POST /api/v1/delivery-orders/:id/confirm-quotation`

- Requires `status = READY_FOR_QUOTATION`.
- Sets `status = QUOTATION_CONFIRMED`.

`POST /api/v1/delivery-orders/:id/assign-to-shipment`

- Requires `status = QUOTATION_CONFIRMED`.
- Requires at least one active delivery order LOT.
- Sets delivery order `status = ASSIGNED_TO_SHIPMENT`.
- Sets linked active PO LOTs to `ASSIGNED_TO_SHIPMENT`, locking them from split/move/reorder.

`POST /api/v1/delivery-orders/:id/cancel`

- Requires `status = DRAFT`, `READY_FOR_QUOTATION`, or `QUOTATION_CONFIRMED`.
- Sets `status = CANCELLED`.
- Soft deletes active delivery order lots and lines so selected LOTs can be used again.

`POST /api/v1/delivery-orders/:id/close`

- Requires `status = ASSIGNED_TO_SHIPMENT`.
- Sets `status = CLOSED`.

### Delivery Order Sub-Resources

`GET /api/v1/purchase-orders/:id/delivery-orders`

- Lists active delivery orders for a purchase order.

`GET /api/v1/delivery-orders/:id/lots`

- Lists active LOT links for the delivery order.

`GET /api/v1/delivery-orders/:id/lines`

- Lists active item lines for the delivery order.

## Quotations V1

Quotation flow follows:

```txt
Internal DO -> Quotation -> Versioning -> Confirm by KBI -> DO = QUOTATION_CONFIRMED
```

### `GET /api/v1/quotations`

Query params:

- `search`: searches `quotation_no`, `quotation_type`, `status`, and `note`.
- `ref_type`: `DELIVERY_ORDER`, `PO`, `SHIPMENT`, `CARRIER_DO`, or `DTO`.
- `ref_id`: referenced record id.
- `status`: quotation status.
- `supplier_id`: supplier id.
- `from_date`, `to_date`: filters by `create_at`.
- `page`, `limit`: pagination.

### `POST /api/v1/delivery-orders/:deliveryOrderId/quotations`

Creates a quotation for a delivery order. The delivery order cannot be `ASSIGNED_TO_SHIPMENT`, `CANCELLED`, or `CLOSED`.

```json
{
    "quotation_no": "QT-2026-0001",
    "supplier_id": "uuid-forwarder",
    "quotation_type": "FREIGHT",
    "currency_id": "uuid-usd",
    "exchange_rate": 25000,
    "quoted_at": "2026-06-20T09:00:00Z",
    "valid_until": "2026-06-30",
    "note": "Sea freight quotation",
    "charge_lines": [
        {
            "line_no": 1,
            "charge_type": "OCEAN_FREIGHT",
            "description": "Ocean freight Shanghai to Cat Lai",
            "quantity": 1,
            "unit": "SET",
            "unit_price": 1200,
            "tax_rate": 0
        }
    ]
}
```

### `PATCH /api/v1/quotations/:quotationId`

- Updates header fields only: `quotation_no`, `supplier_id`, `quotation_type`, `currency_id`, `exchange_rate`, `quoted_at`, `valid_until`, `note`.
- Not allowed when quotation is `SUBMITTED_TO_KBI`, `CONFIRMED_BY_KBI`, `REJECTED`, `CANCELLED`, or `EXPIRED`.
- Price changes should be handled through charge lines or a new version.

### Quotation Status Actions

`POST /api/v1/quotations/:quotationId/request`

- Requires `status = DRAFT`.
- Sets `status = REQUESTED`.

`POST /api/v1/quotations/:quotationId/receive`

- Requires `status = DRAFT` or `REQUESTED`.
- Sets `status = RECEIVED`.
- Sets `quoted_at` to now when empty.

`POST /api/v1/quotations/:quotationId/submit-to-kbi`

- Requires `status = RECEIVED`.
- Sets `status = SUBMITTED_TO_KBI` and `submitted_at = now()`.

`POST /api/v1/quotations/:quotationId/confirm-by-kbi`

- Requires `status = RECEIVED` or `SUBMITTED_TO_KBI`.
- Requires at least one active charge line.
- Calls `fn_mark_quotation_final`.
- Sets this quotation as the only final version in the group.
- Sets linked delivery order to `QUOTATION_CONFIRMED` for `ref_type = DELIVERY_ORDER`.

`POST /api/v1/quotations/:quotationId/reject`

- Requires `status = REQUESTED`, `RECEIVED`, or `SUBMITTED_TO_KBI`.

`POST /api/v1/quotations/:quotationId/cancel`

- Requires `status = DRAFT`, `REQUESTED`, or `RECEIVED`.

`POST /api/v1/quotations/:quotationId/expire`

- Requires `status = REQUESTED`, `RECEIVED`, or `SUBMITTED_TO_KBI`.

### Quotation Versioning

`POST /api/v1/quotations/:quotationId/create-version`

```json
{
    "new_quotation_no": "QT-2026-0001",
    "actor_name": "KBI user",
    "note": "Vendor revised local charge"
}
```

- Calls `fn_create_quotation_version`.
- Copies active charge lines to the new `DRAFT` version.
- Clears existing final flag within the same quotation group.

`GET /api/v1/quotations/:quotationId/versions`

- Lists active versions in the same `quotation_group_id`.

### Charge Lines

`GET /api/v1/quotations/:quotationId/charge-lines`

- Lists active charge lines.

`POST /api/v1/quotations/:quotationId/charge-lines`

- Creates a charge line.
- Required: `line_no`, `charge_type`, `description`.
- Optional/defaulted: `quantity`, `unit`, `unit_price`, `tax_rate`, `note`.
- Not allowed when quotation is locked.

`PATCH /api/v1/quotation-charge-lines/:lineId`

- Updates charge line fields.
- `line_no` must remain unique in quotation.

`DELETE /api/v1/quotation-charge-lines/:lineId`

- Soft deletes the charge line and refreshes quotation totals through DB trigger.

### Events

`GET /api/v1/quotations/:quotationId/events`

- Lists active audit events for the quotation.

---

## Shipments V1

Database tables: `shipments`, `shipment_lines`, `shipment_milestones`, `shipment_documents`.

### Business Rules

- Create shipment only when `delivery_orders.status = QUOTATION_CONFIRMED`.
- API auto-resolves the final quotation for the delivery order when `final_quotation_id` is omitted.
- Final quotation must be `is_final = true`, `status = CONFIRMED_BY_KBI`, and belong to the same delivery order.
- Creating shipment calls `fn_create_shipment_from_delivery_order`, copies active delivery order lines to shipment lines, initializes 10 milestones, and sets delivery order status to `ASSIGNED_TO_SHIPMENT`.
- Shipment header cannot be updated when status is `DELIVERED` or `CANCELLED`.
- Marking milestone done calls `fn_mark_shipment_milestone_done` and updates shipment status from the milestone code.
- When milestone `CUSTOMS_CLEARED` is done, shipment status becomes `CUSTOMS_CLEARED`; downstream Customs / Carrier DO / DTO modules can start from this status.
- Shipment documents can be added/updated/deleted unless the shipment is `CANCELLED`.

### Shipment Statuses

`BOOKING_PENDING`, `BOOKING_CONFIRMED`, `CARGO_READY`, `PICKED_UP`, `BL_ISSUED`, `GATE_IN_POL`, `IN_TRANSIT`, `ARRIVED`, `CUSTOMS_DRAFT`, `CUSTOMS_CLEARED`, `DELIVERED`, `CANCELLED`.

### Milestone Codes

`BOOKING_CONFIRMED`, `CARGO_READY`, `PICKED_UP`, `BL_ISSUED`, `GATE_IN_POL`, `ATD`, `CUSTOMS_DRAFT`, `ARRIVAL_NOTICE`, `CUSTOMS_CLEARED`, `DELIVERED`.

### `GET /api/v1/shipments`

Query:

- `page`, `limit`
- `search` or `q`: searches shipment number, carrier, mode, status, vessel/flight, voyage, BL/AWB, POL, POD, notes.
- `status`, `mode`
- `delivery_order_id`, `purchase_order_id`, `forwarder_id`, `transport_mode_id`
- `from_date`, `to_date`: filter by `create_at`.

### `POST /api/v1/shipments/from-delivery-order`

Creates shipment from a delivery order.

```json
{
    "shipment_no": "SHP-2026-0001",
    "delivery_order_id": "uuid",
    "final_quotation_id": "uuid",
    "transport_mode_id": "uuid",
    "forwarder_id": "uuid",
    "carrier": "ONE",
    "mode": "SEA",
    "vessel_flight": "ONE HANOI",
    "voyage_no": "001E",
    "bl_awb_no": "BL123456",
    "container_no": ["CONT001"],
    "pol": "Shanghai",
    "pod": "Cat Lai",
    "etd": "2026-06-20",
    "eta": "2026-06-28",
    "notes": "Initial booking"
}
```

- Required: `shipment_no`, `delivery_order_id`.
- Optional: `final_quotation_id`; API resolves the final quotation automatically when omitted.
- Optional/defaulted: `mode` defaults to `SEA`; `transport_mode_id` defaults from delivery order when omitted.

### `PATCH /api/v1/shipments/:id`

Updates unlocked shipment header fields:

`transport_mode_id`, `forwarder_id`, `carrier`, `mode`, `vessel_flight`, `voyage_no`, `bl_awb_no`, `container_no`, `pol`, `pod`, `etd`, `eta`, `atd`, `ata`, `customs_channel`, `package_qty`, `gross_weight`, `net_weight`, `cbm`, `notes`.

Validation:

- `mode`: `SEA`, `AIR`, `ROAD`, `RAIL`, `MULTIMODAL`, `TRUCKING`, `OTHER`.
- `customs_channel`: `GREEN`, `YELLOW`, `RED`.
- Quantity/weight fields must be greater than or equal to 0.

### Shipment Actions

`POST /api/v1/shipments/:id/cancel`

```json
{
    "notes": "Booking cancelled by requester"
}
```

- Not allowed when shipment is already `DELIVERED` or `CANCELLED`.

`POST /api/v1/shipments/:id/milestones/:milestoneCode/done`

```json
{
    "actual_at": "2026-06-21T09:30:00.000Z",
    "notes": "Confirmed by forwarder"
}
```

- `actual_at` defaults to current timestamp.
- Not allowed when shipment is `DELIVERED` or `CANCELLED`.

### Lines And Milestones

`GET /api/v1/shipments/:id/lines`

- Lists active shipment lines copied from delivery order lines.

`GET /api/v1/shipments/:id/milestones`

- Lists 10 active milestones ordered by `sequence_no`.

### Documents

Document types:

`COMMERCIAL_INVOICE`, `PACKING_LIST`, `CONTRACT`, `BOOKING_CONFIRMATION`, `BILL_OF_LADING`, `AIR_WAYBILL`, `ARRIVAL_NOTICE`, `CERTIFICATE_OF_ORIGIN`, `INSURANCE`, `CUSTOMS_DECLARATION`, `EDO`, `POD`, `OTHER`.

Document statuses:

`DRAFT`, `RECEIVED`, `VERIFIED`, `REJECTED`, `CANCELLED`.

`GET /api/v1/shipments/:id/documents`

- Lists active shipment documents.

`POST /api/v1/shipments/:id/documents`

```json
{
    "milestone_code": "BL_ISSUED",
    "document_type": "BILL_OF_LADING",
    "document_no": "BL123456",
    "file_url": "https://example.com/bl.pdf",
    "file_name": "bl.pdf",
    "mime_type": "application/pdf",
    "issued_date": "2026-06-21",
    "received_at": "2026-06-21T10:00:00.000Z",
    "status": "RECEIVED",
    "notes": "Draft BL received"
}
```

- Required: `document_type`.
- Optional: `milestone_id` or `milestone_code`; when both are sent, they must match.
- `status` defaults to `RECEIVED`.

`PATCH /api/v1/shipment-documents/:documentId`

- Updates document metadata and status.
- Accepts the same editable fields as create.

`DELETE /api/v1/shipment-documents/:documentId`

- Soft deletes a shipment document.
