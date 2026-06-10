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
- API paths keep `/tax-profile` and `/item-tax-profiles` for backward compatibility.
- Delete APIs use soft delete with `is_delete = true` and `delete_at`.
- Decimal values from Prisma may be serialized as strings in JSON responses.
- Unknown request body fields are ignored by create and update APIs.
