# KBI Mock API Documentation

## Overview

- Base URL local: `http://localhost:3001`
- Base URL production: `https://kbi-mockapi.onrender.com`
- API prefix: `/api`
- Content type: `application/json`
- Database: PostgreSQL
- ORM: Prisma

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database status |
| `GET` | `/api/item-groups` | Get item group list with pagination |
| `GET` | `/api/item-groups/:id` | Get item group detail |
| `GET` | `/api/item-groups/:id/items` | Get items in an item group |
| `POST` | `/api/item-groups` | Create item group |
| `PUT` | `/api/item-groups/:id` | Update item group |
| `DELETE` | `/api/item-groups/:id` | Soft delete item group |
| `GET` | `/api/items` | Get item list with pagination |
| `GET` | `/api/items/:id` | Get item detail |
| `POST` | `/api/items` | Create item |
| `PUT` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Soft delete item and customs profiles |
| `GET` | `/api/items/:id/tax-profile` | Get item customs profiles |
| `POST` | `/api/items/:id/tax-profile` | Create item customs profile |
| `PUT` | `/api/item-tax-profiles/:id` | Update item customs profile |
| `DELETE` | `/api/item-tax-profiles/:id` | Soft delete item customs profile |

## Common Responses

### Error

```json
{
    "message": "Item not found"
}
```

### Not Found Route

```json
{
    "message": "Route not found"
}
```

## Health

### GET `/api/health`

#### Response `200`

```json
{
    "status": "ok",
    "service": "eFMS API",
    "database": "connected"
}
```

#### Response `503`

```json
{
    "status": "error",
    "service": "eFMS API",
    "database": "disconnected",
    "message": "Connection error message"
}
```

## Item Groups

### Item Group Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Auto | Item group ID |
| `group_code` | `string` | No | Unique group code |
| `group_name` | `string` | Yes | Group name |
| `description` | `string` | No | Group description |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |

### GET `/api/item-groups`

- Returns item groups where `is_delete = false`.
- Supports pagination and keyword search.
- Search fields: `group_code`, `group_name`, `description`.

#### Query Parameters

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `20` | Items per page, max `100` |
| `q` | `string` | None | Search keyword |

#### Example

```http
GET /api/item-groups?page=1&limit=10&q=hardware
```

#### Response `200`

```json
{
    "data": [
        {
            "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
            "group_code": "GRP001",
            "group_name": "Hardware",
            "description": "Hardware items",
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

### GET `/api/item-groups/:id`

#### Response `200`

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_code": "GRP001",
        "group_name": "Hardware",
        "description": "Hardware items",
        "is_delete": false
    }
}
```

#### Response `404`

```json
{
    "message": "Item group not found"
}
```

### GET `/api/item-groups/:id/items`

- Returns active items in an item group.
- Supports pagination and keyword search.
- Uses the same response shape as `GET /api/items`.

#### Query Parameters

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `20` | Items per page, max `100` |
| `q` | `string` | None | Search keyword |

#### Example

```http
GET /api/item-groups/f99139ff-119a-4d2a-b654-71427c4167ed/items?page=1&limit=10&q=steel
```

#### Response `200`

```json
{
    "data": [
        {
            "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "item_code": "ITEM001",
            "item_name": "Steel bolt",
            "item_group_id": "f99139ff-119a-4d2a-b654-71427c4167ed",
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

#### Response `404`

```json
{
    "message": "Item group not found"
}
```

### POST `/api/item-groups`

- Creates a new item group.
- Required fields: `group_name`.
- Unknown fields are ignored.

#### Request Body

```json
{
    "group_code": "GRP001",
    "group_name": "Hardware",
    "description": "Hardware items"
}
```

#### Response `201`

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_code": "GRP001",
        "group_name": "Hardware"
    },
    "message": "Created successfully"
}
```

#### Response `400`

```json
{
    "message": "group_name is required"
}
```

### PUT `/api/item-groups/:id`

- Updates an active item group.
- At least one valid item group field is required.

#### Request Body

```json
{
    "group_name": "Hardware updated",
    "description": "Updated description"
}
```

#### Response `200`

```json
{
    "data": {
        "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
        "group_name": "Hardware updated",
        "description": "Updated description"
    },
    "message": "Updated successfully"
}
```

### DELETE `/api/item-groups/:id`

- Soft deletes an item group.

#### Response `200`

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

### Item Fields

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
| `lead_time_days` | `number` | No | Lead time in days |
| `moq` | `decimal` | No | Minimum order quantity |
| `is_active` | `boolean` | No | Active flag |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |
| `item_group` | `object` | Auto | Related item group |

### GET `/api/items`

- Returns active items where `is_delete = false`.
- Supports pagination and keyword search.
- Search fields: `item_code`, `item_name`, `item_description`, `unit`, `item_type`, `origin_country`.
- Supports filtering by item group with `item_group_id`.

#### Query Parameters

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `20` | Items per page, max `100` |
| `q` | `string` | None | Search keyword |
| `item_group_id` | `uuid` | None | Filter items by item group |

#### Example

```http
GET /api/items?page=1&limit=10&q=steel
```

```http
GET /api/items?item_group_id=f99139ff-119a-4d2a-b654-71427c4167ed&page=1&limit=10
```

#### Response `200`

```json
{
    "data": [
        {
            "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "item_code": "ITEM001",
            "item_name": "Steel bolt",
            "item_description": "Industrial steel bolt",
            "item_group_id": "f99139ff-119a-4d2a-b654-71427c4167ed",
            "unit": "PCS",
            "item_type": "MATERIAL",
            "origin_country": "Vietnam",
            "lead_time_days": 7,
            "moq": "100.0000",
            "is_active": true,
            "create_at": "2026-06-09T10:00:00.000Z",
            "update_at": "2026-06-09T10:00:00.000Z",
            "delete_at": null,
            "is_delete": false,
            "item_group": {
                "id": "f99139ff-119a-4d2a-b654-71427c4167ed",
                "group_code": "GRP001",
                "group_name": "Hardware"
            }
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

### GET `/api/items/:id`

#### Response `200`

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "item_code": "ITEM001",
        "item_name": "Steel bolt",
        "item_description": "Industrial steel bolt",
        "is_active": true,
        "is_delete": false
    }
}
```

#### Response `404`

```json
{
    "message": "Item not found"
}
```

### POST `/api/items`

- Creates a new item.
- Required fields: `item_code`, `item_name`.
- Unknown fields are ignored.

#### Request Body

```json
{
    "item_code": "ITEM001",
    "item_name": "Steel bolt",
    "item_description": "Industrial steel bolt",
    "item_group_id": "f99139ff-119a-4d2a-b654-71427c4167ed",
    "unit": "PCS",
    "item_type": "MATERIAL",
    "origin_country": "Vietnam",
    "lead_time_days": 7,
    "moq": 100,
    "is_active": true
}
```

#### Response `201`

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "item_code": "ITEM001",
        "item_name": "Steel bolt"
    },
    "message": "Created successfully"
}
```

#### Response `400`

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

### PUT `/api/items/:id`

- Updates an active item.
- At least one valid item field is required.

#### Request Body

```json
{
    "item_name": "Steel bolt updated",
    "lead_time_days": 10,
    "is_active": false
}
```

#### Response `200`

```json
{
    "data": {
        "id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "item_name": "Steel bolt updated",
        "lead_time_days": 10,
        "is_active": false
    },
    "message": "Updated successfully"
}
```

### DELETE `/api/items/:id`

- Soft deletes an item.
- Also soft deletes active customs profiles linked to that item.

#### Response `200`

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

### Customs Profile Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | Auto | Customs profile ID |
| `item_id` | `uuid` | Auto from path | Item ID |
| `hs_code` | `string` | No | HS code |
| `import_duty_rate` | `decimal` | No | Import duty rate |
| `vat_rate` | `decimal` | No | VAT rate |
| `co_form` | `string` | No | C/O form |
| `co_tax_note` | `string` | No | C/O tax note |
| `customs_type` | `string` | No | Customs type |
| `customs_note` | `string` | No | Customs note |
| `is_default` | `boolean` | No | Default profile flag |
| `create_at` | `datetime` | Auto | Created time |
| `update_at` | `datetime` | Auto | Updated time |
| `delete_at` | `datetime` | Auto | Deleted time |
| `is_delete` | `boolean` | Auto | Soft delete flag |

### GET `/api/items/:id/tax-profile`

- Returns active customs profiles for an item.

#### Response `200`

```json
{
    "data": [
        {
            "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
            "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
            "hs_code": "7318.15",
            "import_duty_rate": "5",
            "vat_rate": "10",
            "co_form": "D",
            "co_tax_note": "Preferential C/O",
            "customs_type": "NORMAL",
            "customs_note": "Sample customs profile",
            "is_default": true,
            "is_delete": false,
            "delete_at": null
        }
    ],
    "total": 1
}
```

### POST `/api/items/:id/tax-profile`

- Creates a customs profile for an active item.

#### Request Body

```json
{
    "hs_code": "7318.15",
    "import_duty_rate": 5,
    "vat_rate": 10,
    "co_form": "D",
    "co_tax_note": "Preferential C/O",
    "customs_type": "NORMAL",
    "customs_note": "Sample customs profile",
    "is_default": true
}
```

#### Response `201`

```json
{
    "data": {
        "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
        "item_id": "2c6a52e1-2e27-4e3f-9c3a-10c57a33df8f",
        "hs_code": "7318.15",
        "import_duty_rate": "5",
        "vat_rate": "10"
    },
    "message": "Created successfully"
}
```

### PUT `/api/item-tax-profiles/:id`

- Updates an active customs profile.
- At least one valid customs profile field is required.

#### Request Body

```json
{
    "import_duty_rate": 7.5,
    "vat_rate": 10,
    "customs_note": "Updated customs note"
}
```

#### Response `200`

```json
{
    "data": {
        "id": "ccf1c640-0864-4dc3-8af5-09c8f1eb11cc",
        "import_duty_rate": "7.5",
        "vat_rate": "10",
        "customs_note": "Updated customs note"
    },
    "message": "Updated successfully"
}
```

### DELETE `/api/item-tax-profiles/:id`

- Soft deletes an active customs profile.

#### Response `200`

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

- Database table `item_master` is mapped to Prisma model `ItemMaster`.
- Database table `item_groups` is mapped to Prisma model `ItemGroup`.
- Database table `item_customs_profiles` is mapped to Prisma model `ItemCustomsProfile`.
- Current API paths still use `/tax-profile` and `/item-tax-profiles` for backward compatibility.
- Delete APIs use soft delete by setting `is_delete = true`.
- Decimal values from Prisma may be serialized as strings in JSON responses.
