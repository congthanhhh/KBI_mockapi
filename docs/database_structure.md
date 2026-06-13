# Database Structure

This document describes the current mock data structure in `kbi-mock-api/mock-data/`.
It does not export sample data; it only lists mock tables/files and their fields.

## Schema Reading Rules

- Each `*.json` file in `mock-data/` is treated as one mock table.
- Data types are inferred from all records currently present in each file.
- `required`: the field appears in every record and no current value is `null`.
- `nullable`: the field appears in every record and at least one current value is `null`.
- `optional`: the field does not appear in every record.
- FK notes are inferred from field names; mock JSON does not enforce database constraints.

## Table Overview

| Mock table | File | Mock records |
| --- | --- | ---: |
| `carrier-delivery-orders` | `mock-data/carrier-delivery-orders.json` | 14 |
| `currencies` | `mock-data/currencies.json` | 4 |
| `customs-declaration-lines` | `mock-data/customs-declaration-lines.json` | 14 |
| `customs-declarations` | `mock-data/customs-declarations.json` | 14 |
| `delivery-order-lines` | `mock-data/delivery-order-lines.json` | 14 |
| `delivery-order-lots` | `mock-data/delivery-order-lots.json` | 14 |
| `delivery-orders` | `mock-data/delivery-orders.json` | 14 |
| `domestic-transport-order-lines` | `mock-data/domestic-transport-order-lines.json` | 14 |
| `domestic-transport-orders` | `mock-data/domestic-transport-orders.json` | 14 |
| `incoterms` | `mock-data/incoterms.json` | 4 |
| `item-customs-profiles` | `mock-data/item-customs-profiles.json` | 14 |
| `item-groups` | `mock-data/item-groups.json` | 4 |
| `item-master` | `mock-data/item-master.json` | 14 |
| `logistics-tasks` | `mock-data/logistics-tasks.json` | 10 |
| `po-delivery-slots` | `mock-data/po-delivery-slots.json` | 4 |
| `po-lot-lines` | `mock-data/po-lot-lines.json` | 19 |
| `po-lots` | `mock-data/po-lots.json` | 15 |
| `purchase-order-confirmation-lines` | `mock-data/purchase-order-confirmation-lines.json` | 17 |
| `purchase-order-confirmations` | `mock-data/purchase-order-confirmations.json` | 14 |
| `purchase-order-lines` | `mock-data/purchase-order-lines.json` | 17 |
| `purchase-orders` | `mock-data/purchase-orders.json` | 14 |
| `quotation-charge-lines` | `mock-data/quotation-charge-lines.json` | 17 |
| `quotation-events` | `mock-data/quotation-events.json` | 14 |
| `quotations` | `mock-data/quotations.json` | 15 |
| `shipment-documents` | `mock-data/shipment-documents.json` | 14 |
| `shipment-lines` | `mock-data/shipment-lines.json` | 14 |
| `shipment-milestones` | `mock-data/shipment-milestones.json` | 140 |
| `shipments` | `mock-data/shipments.json` | 14 |
| `screens/po-tasks-po_001` | `mock-data/screens/po-tasks-po_001.json` | 1 screen |
| `screens/task-detail-task_001` | `mock-data/screens/task-detail-task_001.json` | 1 screen |
| `screens/task-list` | `mock-data/screens/task-list.json` | 1 screen / 8 task items |
| `supplier-transport-modes` | `mock-data/supplier-transport-modes.json` | 5 |
| `suppliers` | `mock-data/suppliers.json` | 4 |
| `transport-modes` | `mock-data/transport-modes.json` | 5 |

## Field Details

### carrier-delivery-orders

- Source: `mock-data/carrier-delivery-orders.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `carrier_do_no` | `string` | required |  |
| `forwarder_id` | `string` | required | Inferred FK -> suppliers.id |
| `issued_date` | `string` | required |  |
| `expired_date` | `string` | required |  |
| `release_location` | `string` | required |  |
| `container_no` | `string | null` | nullable |  |
| `local_charge_amount` | `number` | required |  |
| `currency_code` | `string` | required | Inferred FK -> currencies.currency_code |
| `status` | `string` | required |  |
| `note` | `string | null` | nullable |  |

### currencies

- Source: `mock-data/currencies.json`
- Current mock records: 4

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `currency_code` | `string` | required |  |
| `currency_name` | `string` | required |  |
| `symbol` | `string` | required |  |
| `exchange_rate_to_vnd` | `number` | required |  |
| `is_active` | `boolean` | required |  |

### customs-declaration-lines

- Source: `mock-data/customs-declaration-lines.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `customs_declaration_id` | `string` | required | Inferred FK -> customs-declarations.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `hs_code` | `string` | required |  |
| `item_description` | `string` | required |  |
| `quantity` | `number` | required |  |
| `unit` | `string` | required |  |
| `customs_value` | `number` | required |  |
| `import_duty_rate` | `number` | required |  |
| `vat_rate` | `number` | required |  |
| `co_form` | `string` | required |  |
| `preferential_tax_rate` | `number` | required |  |

### customs-declarations

- Source: `mock-data/customs-declarations.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `declaration_no` | `string` | required |  |
| `customs_type` | `string` | required |  |
| `customs_channel` | `string` | required |  |
| `draft_opened_at` | `string` | required |  |
| `official_opened_at` | `string | null` | nullable |  |
| `cleared_at` | `string | null` | nullable |  |
| `status` | `string` | required |  |
| `note` | `string | null` | nullable |  |

### delivery-order-lines

- Source: `mock-data/delivery-order-lines.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `string | null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `delivery_order_id` | `string` | required | Inferred FK -> delivery-orders.id |
| `po_lot_id` | `string` | required | Inferred FK -> po-lots.id |
| `purchase_order_line_id` | `string` | required | Inferred FK -> purchase-order-lines.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `qty` | `number` | required |  |
| `unit` | `string` | required |  |
| `sort_order` | `number` | required |  |

### delivery-order-lots

- Source: `mock-data/delivery-order-lots.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `string | null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `delivery_order_id` | `string` | required | Inferred FK -> delivery-orders.id |
| `po_lot_id` | `string` | required | Inferred FK -> po-lots.id |
| `sort_order` | `number` | required |  |

### delivery-orders

- Source: `mock-data/delivery-orders.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `string | null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `delivery_order_no` | `string` | required |  |
| `purchase_order_id` | `string` | required | Inferred FK -> purchase-orders.id |
| `transport_mode_id` | `string` | required | Inferred FK -> transport-modes.id |
| `status` | `string` | required |  |
| `requested_pickup_date` | `string` | required |  |
| `planned_cargo_ready_date` | `string` | required |  |
| `planned_etd` | `string` | required |  |
| `planned_eta` | `string` | required |  |
| `origin_address` | `string` | required |  |
| `destination_address` | `string` | required |  |
| `warehouse_name` | `string` | required |  |
| `notes` | `string` | required |  |

### domestic-transport-order-lines

- Source: `mock-data/domestic-transport-order-lines.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `domestic_transport_order_id` | `string` | required | Inferred FK -> domestic-transport-orders.id |
| `purchase_order_line_id` | `string` | required | Inferred FK -> purchase-order-lines.id |
| `po_lot_id` | `string` | required | Inferred FK -> po-lots.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `qty` | `number` | required |  |
| `unit` | `string` | required |  |
| `sort_order` | `number` | required |  |

### domestic-transport-orders

- Source: `mock-data/domestic-transport-orders.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `dto_no` | `string` | required |  |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `carrier_delivery_order_id` | `string` | required | Inferred FK -> carrier-delivery-orders.id |
| `truck_vendor_id` | `string` | required | Inferred FK -> suppliers.id |
| `origin` | `string` | required |  |
| `destination` | `string` | required |  |
| `warehouse` | `string` | required |  |
| `vehicle_type` | `string` | required |  |
| `vehicle_plate` | `string | null` | nullable |  |
| `driver_name` | `string | null` | nullable |  |
| `driver_phone` | `string | null` | nullable |  |
| `scheduled_pickup_at` | `string` | required |  |
| `actual_pickup_at` | `string` | required |  |
| `scheduled_delivery_at` | `string` | required |  |
| `actual_delivery_at` | `string` | required |  |
| `pod_document_ref` | `string | null` | nullable |  |
| `status` | `string` | required |  |
| `note` | `string | null` | nullable |  |
| `delayed_days` | `number` | optional |  |

### incoterms

- Source: `mock-data/incoterms.json`
- Current mock records: 4

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `incoterm_code` | `string` | required |  |
| `incoterm_name` | `string` | required |  |
| `description` | `string` | required |  |
| `is_active` | `boolean` | required |  |

### item-customs-profiles

- Source: `mock-data/item-customs-profiles.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `hs_code` | `string` | required |  |
| `import_duty_rate` | `number` | required |  |
| `vat_rate` | `number` | required |  |
| `co_form` | `string` | required |  |
| `preferential_tax_rate` | `number` | required |  |

### item-groups

- Source: `mock-data/item-groups.json`
- Current mock records: 4

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `group_code` | `string` | required |  |
| `group_name` | `string` | required |  |
| `is_active` | `boolean` | required |  |

### item-master

- Source: `mock-data/item-master.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `item_code` | `string` | required |  |
| `item_name` | `string` | required |  |
| `item_group_id` | `string` | required | Inferred FK -> item-groups.id |
| `unit` | `string` | required |  |
| `origin_country` | `string` | required |  |
| `is_active` | `boolean` | required |  |

### logistics-tasks

- Source: `mock-data/logistics-tasks.json`
- Current mock records: 10

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `task_id` | `string` | required |  |
| `id` | `string` | required | Mock primary key |
| `do_number` | `string` | required |  |
| `hbl_number` | `string | null` | nullable |  |
| `request_code` | `string` | required |  |
| `po_number` | `string` | required |  |
| `production_contract_number` | `string` | required |  |
| `task_name` | `string` | required |  |
| `role` | `string` | required |  |
| `assignee` | `object { user_id: string, name: string, department: string }` | required |  |
| `progress` | `number` | required |  |
| `created_at` | `string` | required | Audit timestamp |
| `assigned_at` | `string` | required |  |
| `completed_at` | `string | null` | nullable |  |
| `status` | `string` | required |  |
| `priority` | `string` | required |  |
| `due_date` | `string` | required |  |
| `notes` | `string` | required |  |
| `is_required_for_do_closure` | `boolean` | required |  |
| `blocked_reason` | `string | null` | nullable |  |

### screens/task-list

- Source: `mock-data/screens/task-list.json`
- Current mock records: 1 screen DTO with 8 task items
- API usage: `GET /api/v1/tasks`

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `items` | `array<object>` | required | Screen-ready task rows for the Tasks page |
| `items[].create_at` | `string` | required | Audit timestamp |
| `items[].update_at` | `string` | required | Audit timestamp |
| `items[].delete_at` | `null` | nullable | Soft delete |
| `items[].is_delete` | `boolean` | required | Soft delete |
| `items[].id` | `string` | required | Mock primary key for task screen item |
| `items[].task_no` | `string` | required | Display task number |
| `items[].task_name` | `string` | required | Display task name |
| `items[].ref_type` | `string` | required | Polymorphic reference type, currently `PURCHASE_ORDER` |
| `items[].ref_id` | `string` | required | Polymorphic reference id, currently purchase order id |
| `items[].ref_no` | `string` | required | Display reference number |
| `items[].stage` | `string` | required | PO flow stage: SUPPLIER_CONFIRMATION, LOT_PLANNING, INTERNAL_DO, QUOTATION, SHIPMENT, CUSTOMS, CARRIER_DO, DTO |
| `items[].role` | `string` | required | Owner role code |
| `items[].assignee` | `object { id: string, name: string, department: string }` | required | Assigned user summary |
| `items[].status` | `string` | required | Task status |
| `items[].priority` | `string` | required | Task priority |
| `items[].due_at` | `string` | required | Due timestamp |
| `items[].completed_at` | `string | null` | nullable | Completion timestamp |
| `items[].progress` | `number` | required | Progress percentage |
| `items[].blocked_reason` | `string | null` | nullable | Blocker note |
| `items[].note` | `string` | required | Operational note |
| `summary` | `object { total: number, pending: number, in_progress: number, blocked: number, completed: number }` | required | Current task list counts |
| `filters` | `object { stages: string[], statuses: string[], priorities: string[] }` | required | Filter option sets for the Tasks page |

### screens/task-detail-task_001

- Source: `mock-data/screens/task-detail-task_001.json`
- Current mock records: 1 task detail screen DTO
- API usage: `GET /api/v1/tasks/task_001`

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key for task detail |
| `task_no` | `string` | required | Display task number |
| `task_name` | `string` | required | Display task name |
| `ref_type` | `string` | required | Polymorphic reference type, currently `PURCHASE_ORDER` |
| `ref_id` | `string` | required | Polymorphic reference id, currently purchase order id |
| `ref_no` | `string` | required | Display reference number |
| `stage` | `string` | required | PO flow stage |
| `role` | `string` | required | Owner role code |
| `assignee` | `object { id: string, name: string, department: string }` | required | Assigned user summary |
| `status` | `string` | required | Task status |
| `priority` | `string` | required | Task priority |
| `due_at` | `string` | required | Due timestamp |
| `completed_at` | `string | null` | nullable | Completion timestamp |
| `progress` | `number` | required | Progress percentage |
| `blocked_reason` | `string | null` | nullable | Blocker note |
| `note` | `string` | required | Operational note |
| `description` | `string` | required | Detail description for task drawer/page |
| `related_records` | `object` | required | Screen-ready related entity summary |
| `related_records.purchase_order` | `object { id: string, po_no: string, status: string }` | required | Related PO summary |
| `activity` | `array<object { event_code: string, event_at: string, note: string }>` | required | Task activity timeline |

### screens/po-tasks-po_001

- Source: `mock-data/screens/po-tasks-po_001.json`
- Current mock records: 1 purchase-order task screen DTO with 8 task groups/items
- API usage: `GET /api/v1/purchase-orders/po_001/tasks`

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `purchase_order` | `object { id: string, po_no: string, status: string }` | required | Screen-ready PO summary |
| `task_groups` | `array<object>` | required | Task groups by PO flow stage |
| `task_groups[].stage` | `string` | required | PO flow stage |
| `task_groups[].tasks` | `array<object>` | required | Tasks in the stage group |
| `task_groups[].tasks[].id` | `string` | required | Mock primary key for task screen item |
| `task_groups[].tasks[].task_no` | `string` | required | Display task number |
| `task_groups[].tasks[].task_name` | `string` | required | Display task name |
| `task_groups[].tasks[].ref_type` | `string` | required | Polymorphic reference type, currently `PURCHASE_ORDER` |
| `task_groups[].tasks[].ref_id` | `string` | required | Polymorphic reference id, currently purchase order id |
| `task_groups[].tasks[].ref_no` | `string` | required | Display reference number |
| `task_groups[].tasks[].stage` | `string` | required | PO flow stage |
| `task_groups[].tasks[].role` | `string` | required | Owner role code |
| `task_groups[].tasks[].assignee` | `object { id: string, name: string, department: string }` | required | Assigned user summary |
| `task_groups[].tasks[].status` | `string` | required | Task status |
| `task_groups[].tasks[].priority` | `string` | required | Task priority |
| `task_groups[].tasks[].due_at` | `string` | required | Due timestamp |
| `task_groups[].tasks[].completed_at` | `string | null` | nullable | Completion timestamp |
| `task_groups[].tasks[].progress` | `number` | required | Progress percentage |
| `task_groups[].tasks[].blocked_reason` | `string | null` | nullable | Blocker note |
| `task_groups[].tasks[].note` | `string` | required | Operational note |

### po-delivery-slots

- Source: `mock-data/po-delivery-slots.json`
- Current mock records: 4

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `purchase_order_id` | `string` | required | Inferred FK -> purchase-orders.id |
| `slot_no` | `string` | required |  |
| `slot_name` | `string` | required |  |
| `status` | `string` | required |  |
| `planned_cargo_ready_date` | `string` | required |  |
| `planned_etd` | `string` | required |  |
| `planned_eta` | `string` | required |  |
| `note` | `string` | required |  |

### po-lot-lines

- Source: `mock-data/po-lot-lines.json`
- Current mock records: 19

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `notes` | `null` | nullable |  |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `po_lot_id` | `string` | required | Inferred FK -> po-lots.id |
| `purchase_order_line_id` | `string` | required | Inferred FK -> purchase-order-lines.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `qty_lotted` | `number` | required |  |
| `unit` | `string` | required |  |
| `sort_order` | `number` | required |  |

### po-lots

- Source: `mock-data/po-lots.json`
- Current mock records: 15

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `purchase_order_id` | `string` | required | Inferred FK -> purchase-orders.id |
| `lot_no` | `string` | required |  |
| `lot_name` | `string` | required |  |
| `status` | `string` | required |  |
| `planned_cargo_ready_date` | `string` | required |  |
| `planned_etd` | `string` | required |  |
| `planned_eta` | `string` | required |  |
| `sort_order` | `number` | required |  |
| `notes` | `string | null` | nullable |  |

### purchase-order-confirmation-lines

- Source: `mock-data/purchase-order-confirmation-lines.json`
- Current mock records: 17

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `purchase_order_confirmation_id` | `string` | required | Inferred FK -> purchase-order-confirmations.id |
| `purchase_order_line_id` | `string` | required | Inferred FK -> purchase-order-lines.id |
| `confirmed_qty` | `number` | required |  |
| `cargo_ready_date` | `string` | required |  |
| `note` | `string | null` | nullable |  |

### purchase-order-confirmations

- Source: `mock-data/purchase-order-confirmations.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `purchase_order_id` | `string` | required | Inferred FK -> purchase-orders.id |
| `confirmed_by` | `string` | required |  |
| `confirmed_at` | `string` | required |  |
| `supplier_ref_no` | `string` | required |  |
| `cargo_ready_date` | `string` | required |  |
| `is_full_shipment` | `boolean` | required |  |
| `allow_partial_shipment` | `boolean` | required |  |
| `note` | `string` | required |  |

### purchase-order-lines

- Source: `mock-data/purchase-order-lines.json`
- Current mock records: 17

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `item_customs_profile_id` | `string` | required | Inferred FK -> item-customs-profiles.id |
| `item_description` | `string` | required |  |
| `gross_weight_kg` | `number` | required |  |
| `qty_confirmed` | `number` | required |  |
| `qty_lotted` | `number` | required |  |
| `qty_shipped` | `number` | required |  |
| `qty_received` | `number` | required |  |
| `expected_eta_line` | `string` | required |  |
| `notes` | `null` | nullable |  |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `purchase_order_id` | `string` | required | Inferred FK -> purchase-orders.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `line_no` | `number` | required |  |
| `qty_ordered` | `number` | required |  |
| `unit` | `string` | required |  |
| `unit_price` | `number` | required |  |
| `tax_rate` | `number` | required |  |
| `discount_pct` | `number` | required |  |
| `sort_order` | `number` | required |  |

### purchase-orders

- Source: `mock-data/purchase-orders.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `po_no` | `string` | required |  |
| `supplier_id` | `string` | required | Inferred FK -> suppliers.id |
| `po_type` | `string` | required |  |
| `incoterm_id` | `string` | required | Inferred FK -> incoterms.id |
| `payment_term` | `string` | required |  |
| `currency_code` | `string` | required | Inferred FK -> currencies.currency_code |
| `exchange_rate` | `number` | required |  |
| `status` | `string` | required |  |
| `expected_etd` | `string` | required |  |
| `expected_eta` | `string` | required |  |
| `notes` | `string` | required |  |
| `contract_no` | `string` | required |  |
| `transport_mode_id` | `string` | required | Inferred FK -> transport-modes.id |
| `actual_etd` | `string` | required |  |
| `actual_eta` | `string` | required |  |
| `expected_warehouse_eta` | `string` | required |  |
| `actual_warehouse_ata` | `string` | required |  |

### quotation-charge-lines

- Source: `mock-data/quotation-charge-lines.json`
- Current mock records: 17

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `quotation_id` | `string` | required | Inferred FK -> quotations.id |
| `charge_type` | `string` | required |  |
| `description` | `string` | required |  |
| `quantity` | `number` | required |  |
| `unit_price` | `number` | required |  |
| `amount` | `number` | required |  |
| `currency_code` | `string` | required | Inferred FK -> currencies.currency_code |
| `tax_rate` | `number` | required |  |
| `note` | `string | null` | nullable |  |

### quotation-events

- Source: `mock-data/quotation-events.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `quotation_id` | `string` | required | Inferred FK -> quotations.id |
| `event_code` | `string` | required |  |
| `event_at` | `string` | required |  |
| `note` | `string` | required |  |

### quotations

- Source: `mock-data/quotations.json`
- Current mock records: 15

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `quotation_group_id` | `string` | required | Logical quotation version group id |
| `quotation_no` | `string` | required |  |
| `version` | `number` | required |  |
| `ref_type` | `string` | required |  |
| `ref_id` | `string` | required | Polymorphic reference, read with ref_type |
| `supplier_id` | `string` | required | Inferred FK -> suppliers.id |
| `quotation_type` | `string` | required |  |
| `currency_code` | `string` | required | Inferred FK -> currencies.currency_code |
| `exchange_rate` | `number` | required |  |
| `status` | `string` | required |  |
| `is_final` | `boolean` | required |  |
| `quoted_at` | `string` | required |  |
| `valid_until` | `string` | required |  |
| `note` | `string | null` | nullable |  |

### shipment-documents

- Source: `mock-data/shipment-documents.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `document_type` | `string` | required |  |
| `document_no` | `string` | required |  |
| `file_url` | `string` | required |  |
| `issued_date` | `string` | required |  |
| `received_date` | `string` | required |  |
| `note` | `string | null` | nullable |  |

### shipment-lines

- Source: `mock-data/shipment-lines.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `delivery_order_line_id` | `string` | required | Inferred FK -> delivery-order-lines.id |
| `purchase_order_line_id` | `string` | required | Inferred FK -> purchase-order-lines.id |
| `po_lot_id` | `string` | required | Inferred FK -> po-lots.id |
| `item_id` | `string` | required | Inferred FK -> item-master.id |
| `qty_shipped` | `number` | required |  |
| `unit` | `string` | required |  |
| `sort_order` | `number` | required |  |

### shipment-milestones

- Source: `mock-data/shipment-milestones.json`
- Current mock records: 140

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_id` | `string` | required | Inferred FK -> shipments.id |
| `milestone_code` | `string` | required |  |
| `milestone_name` | `string` | required |  |
| `status` | `string` | required |  |
| `planned_at` | `null` | nullable |  |
| `actual_at` | `string | null` | nullable |  |
| `sort_order` | `number` | required |  |

### shipments

- Source: `mock-data/shipments.json`
- Current mock records: 14

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `shipment_no` | `string` | required |  |
| `delivery_order_id` | `string` | required | Inferred FK -> delivery-orders.id |
| `mode` | `string` | required |  |
| `forwarder_id` | `string` | required | Inferred FK -> suppliers.id |
| `carrier` | `string` | required |  |
| `vessel_flight` | `string | null` | nullable |  |
| `bl_awb_no` | `string | null` | nullable |  |
| `container_no` | `string | null` | nullable |  |
| `pol` | `string` | required |  |
| `pod` | `string` | required |  |
| `etd` | `string` | required |  |
| `eta` | `string` | required |  |
| `atd` | `string` | required |  |
| `ata` | `string` | required |  |
| `status` | `string` | required |  |

### supplier-transport-modes

- Source: `mock-data/supplier-transport-modes.json`
- Current mock records: 5

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `supplier_id` | `string` | required | Inferred FK -> suppliers.id |
| `transport_mode_id` | `string` | required | Inferred FK -> transport-modes.id |
| `service_level` | `string` | required |  |
| `is_active` | `boolean` | required |  |

### suppliers

- Source: `mock-data/suppliers.json`
- Current mock records: 4

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `supplier_code` | `string` | required |  |
| `supplier_name` | `string` | required |  |
| `supplier_type` | `string` | required |  |
| `country` | `string` | required |  |
| `contact_name` | `string` | required |  |
| `email` | `string` | required |  |
| `phone` | `string` | required |  |
| `is_active` | `boolean` | required |  |

### transport-modes

- Source: `mock-data/transport-modes.json`
- Current mock records: 5

| Field | Type | Presence | Notes |
| --- | --- | --- | --- |
| `create_at` | `string` | required | Audit timestamp |
| `update_at` | `string` | required | Audit timestamp |
| `delete_at` | `null` | nullable | Soft delete |
| `is_delete` | `boolean` | required | Soft delete |
| `id` | `string` | required | Mock primary key |
| `mode_code` | `string` | required |  |
| `mode_name` | `string` | required |  |
| `is_active` | `boolean` | required |  |

## Main Inferred Relations

| From table | Field | To table.field |
| --- | --- | --- |
| `carrier-delivery-orders` | `shipment_id` | `shipments.id` |
| `carrier-delivery-orders` | `forwarder_id` | `suppliers.id` |
| `carrier-delivery-orders` | `currency_code` | `currencies.currency_code` |
| `customs-declaration-lines` | `customs_declaration_id` | `customs-declarations.id` |
| `customs-declaration-lines` | `item_id` | `item-master.id` |
| `customs-declarations` | `shipment_id` | `shipments.id` |
| `delivery-order-lines` | `delivery_order_id` | `delivery-orders.id` |
| `delivery-order-lines` | `po_lot_id` | `po-lots.id` |
| `delivery-order-lines` | `purchase_order_line_id` | `purchase-order-lines.id` |
| `delivery-order-lines` | `item_id` | `item-master.id` |
| `delivery-order-lots` | `delivery_order_id` | `delivery-orders.id` |
| `delivery-order-lots` | `po_lot_id` | `po-lots.id` |
| `delivery-orders` | `purchase_order_id` | `purchase-orders.id` |
| `delivery-orders` | `transport_mode_id` | `transport-modes.id` |
| `domestic-transport-order-lines` | `domestic_transport_order_id` | `domestic-transport-orders.id` |
| `domestic-transport-order-lines` | `purchase_order_line_id` | `purchase-order-lines.id` |
| `domestic-transport-order-lines` | `po_lot_id` | `po-lots.id` |
| `domestic-transport-order-lines` | `item_id` | `item-master.id` |
| `domestic-transport-orders` | `shipment_id` | `shipments.id` |
| `domestic-transport-orders` | `carrier_delivery_order_id` | `carrier-delivery-orders.id` |
| `domestic-transport-orders` | `truck_vendor_id` | `suppliers.id` |
| `item-customs-profiles` | `item_id` | `item-master.id` |
| `item-master` | `item_group_id` | `item-groups.id` |
| `po-delivery-slots` | `purchase_order_id` | `purchase-orders.id` |
| `po-lot-lines` | `po_lot_id` | `po-lots.id` |
| `po-lot-lines` | `purchase_order_line_id` | `purchase-order-lines.id` |
| `po-lot-lines` | `item_id` | `item-master.id` |
| `po-lots` | `purchase_order_id` | `purchase-orders.id` |
| `purchase-order-confirmation-lines` | `purchase_order_confirmation_id` | `purchase-order-confirmations.id` |
| `purchase-order-confirmation-lines` | `purchase_order_line_id` | `purchase-order-lines.id` |
| `purchase-order-confirmations` | `purchase_order_id` | `purchase-orders.id` |
| `purchase-order-lines` | `item_customs_profile_id` | `item-customs-profiles.id` |
| `purchase-order-lines` | `purchase_order_id` | `purchase-orders.id` |
| `purchase-order-lines` | `item_id` | `item-master.id` |
| `purchase-orders` | `supplier_id` | `suppliers.id` |
| `purchase-orders` | `incoterm_id` | `incoterms.id` |
| `purchase-orders` | `currency_code` | `currencies.currency_code` |
| `purchase-orders` | `transport_mode_id` | `transport-modes.id` |
| `quotation-charge-lines` | `quotation_id` | `quotations.id` |
| `quotation-charge-lines` | `currency_code` | `currencies.currency_code` |
| `quotation-events` | `quotation_id` | `quotations.id` |
| `quotations` | `supplier_id` | `suppliers.id` |
| `quotations` | `currency_code` | `currencies.currency_code` |
| `screens/po-tasks-po_001` | `purchase_order.id` | `purchase-orders.id` |
| `screens/po-tasks-po_001` | `task_groups[].tasks[].ref_id` | `purchase-orders.id` when `ref_type = PURCHASE_ORDER` |
| `screens/task-detail-task_001` | `ref_id` | `purchase-orders.id` when `ref_type = PURCHASE_ORDER` |
| `screens/task-list` | `items[].ref_id` | `purchase-orders.id` when `ref_type = PURCHASE_ORDER` |
| `shipment-documents` | `shipment_id` | `shipments.id` |
| `shipment-lines` | `shipment_id` | `shipments.id` |
| `shipment-lines` | `delivery_order_line_id` | `delivery-order-lines.id` |
| `shipment-lines` | `purchase_order_line_id` | `purchase-order-lines.id` |
| `shipment-lines` | `po_lot_id` | `po-lots.id` |
| `shipment-lines` | `item_id` | `item-master.id` |
| `shipment-milestones` | `shipment_id` | `shipments.id` |
| `shipments` | `delivery_order_id` | `delivery-orders.id` |
| `shipments` | `forwarder_id` | `suppliers.id` |
| `supplier-transport-modes` | `supplier_id` | `suppliers.id` |
| `supplier-transport-modes` | `transport_mode_id` | `transport-modes.id` |

## Data Engineering Notes

- Common audit fields: `create_at`, `update_at`, `delete_at`, `is_delete`.
- Some API/UI flows keep aliases, for example `logistics-tasks` has both `task_id` and `id`.
- Task module uses screen DTO files under `mock-data/screens/` in addition to legacy `logistics-tasks.json`.
- Screen DTO files are not normalized tables; they are frontend-ready payloads persisted as JSON for `GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, and `GET /api/v1/purchase-orders/:id/tasks`.
- `quotations.ref_id` is polymorphic; read it together with `ref_type` to identify the source entity.
- `po-delivery-slots` still exists in mock-data as historical mock data, but current LOT runtime does not use Slot per `AGENTS.md`.
