# SOP Mock API — PO to DTO

## 1. Scope

SOP này chỉ áp dụng cho mockapi từ:

```txt
PO
→ Supplier Confirmation
→ LOT Planning
→ Quotation
→ Shipment
→ Customs Clearance
→ Carrier DO / Cargo Release
→ DTO
```

Chưa xử lý:

* PR / Approval
* Warehouse Receiving
* GRN
* ERP sync
* Payment thực tế
* SLA engine chi tiết

---

## 2. Business Flow Tổng Quát

```txt
Purchase Order
→ Supplier Confirmation
→ PO Line LOT Planning
→ Quotation Versioning
→ Shipment Booking
→ Cargo Ready
→ International Transport
→ Shipping Documents
→ Import Customs
→ Customs Clearance
→ Carrier Delivery Order
→ Domestic Transport Order
```

---

## 3. PO Creation / PO Release

### Mục tiêu

Tạo PO để chốt thông tin mua hàng với supplier.

### Entity chính

```txt
purchase_orders
purchase_order_lines
```

### Dữ liệu chính

`purchase_orders`:

* `po_no`
* `supplier_id`
* `po_type`
* `incoterm_id`
* `payment_term`
* `currency_code`
* `exchange_rate`
* `status`
* `expected_etd`
* `expected_eta`
* `notes`

`purchase_order_lines`:

* `purchase_order_id`
* `item_id`
* `line_no`
* `qty_ordered`
* `unit`
* `unit_price`
* `tax_rate`
* `discount_pct`

### Status đề xuất

```txt
DRAFT
SENT
CONFIRMED
CANCELLED
```

Với mockapi hiện tại, chỉ cần flow tối thiểu:

```txt
DRAFT → SENT → CONFIRMED
```

---

## 4. Supplier Confirmation

### Mục tiêu

Supplier xác nhận PO và khả năng giao hàng.

### Entity chính

Có thể lưu trực tiếp trong `purchase_orders` hoặc tạo bảng riêng nếu cần lịch sử.

Khuyến nghị mockapi:

```txt
purchase_order_confirmations
```

### Dữ liệu chính

* `purchase_order_id`
* `confirmed_by`
* `confirmed_at`
* `supplier_ref_no`
* `cargo_ready_date`
* `confirmed_qty`
* `is_full_shipment`
* `allow_partial_shipment`
* `note`

### Business rule

* PO chỉ được chuyển `CONFIRMED` khi supplier đã xác nhận.
* Nếu `allow_partial_shipment = true` thì được tạo nhiều LOT.

---

## 5. PO Line LOT Planning

### Mục tiêu

Tách PO line thành nhiều LOT để quản lý partial shipment.

### Entity chính

```txt
po_line_lots
```

### Dữ liệu chính

* `purchase_order_line_id`
* `lot_no`
* `lot_qty`
* `cargo_ready_date`
* `planned_etd`
* `planned_eta`
* `status`
* `note`

### Status đề xuất

```txt
PLANNED
READY
ASSIGNED_TO_SHIPMENT
SHIPPED
CANCELLED
```

### Business rule

Tổng qty LOT không được vượt quá qty PO line:

```txt
sum(po_line_lots.lot_qty) <= purchase_order_lines.qty_ordered
```

Ví dụ:

```txt
PO Line Qty 1000
→ LOT-001 Qty 400
→ LOT-002 Qty 600
```

---

## 6. Quotation Versioning

### Mục tiêu

Quản lý báo giá vận chuyển / local charge / trucking charge theo version.

### Entity chính

```txt
quotations
quotation_charge_lines
```

### Nguyên tắc quan trọng

* Không update trực tiếp báo giá cũ.
* Mỗi lần thay đổi báo giá thì tạo record `quotations` mới.
* Các version cùng nhóm dùng chung `quotation_group_id`.
* Chỉ có 1 quotation final trong cùng `quotation_group_id`.

### `quotations`

Dữ liệu chính:

* `quotation_group_id`
* `quotation_no`
* `version`
* `ref_type`
* `ref_id`
* `supplier_id`
* `quotation_type`
* `currency_code`
* `exchange_rate`
* `status`
* `is_final`
* `quoted_at`
* `valid_until`
* `note`

### `ref_type`

```txt
PO
PO_LINE_LOT
SHIPMENT
CARRIER_DO
DTO
```

### `quotation_type`

```txt
FREIGHT
LOCAL_CHARGE
CUSTOMS
TRUCKING
MIXED
```

### `quotation_charge_lines`

Dữ liệu chính:

* `quotation_id`
* `charge_type`
* `description`
* `quantity`
* `unit_price`
* `amount`
* `currency_code`
* `tax_rate`
* `note`

### `charge_type`

```txt
OCEAN_FREIGHT
AIR_FREIGHT
LOCAL_CHARGE
CUSTOMS_FEE
TRUCKING
DO_FEE
DEMURRAGE
DETENTION
OTHER
```

### Status đề xuất

```txt
DRAFT
REQUESTED
RECEIVED
SUBMITTED_TO_KBI
CONFIRMED_BY_KBI
REJECTED
CANCELLED
```

### Business rule

Khi tạo version mới:

```txt
new.version = latest.version + 1
new.quotation_group_id = old.quotation_group_id
old.is_final = false
```

Khi chọn final:

```txt
only one quotation where quotation_group_id = X and is_final = true
```

---

## 7. Shipment Booking

### Mục tiêu

Tạo shipment để quản lý chuyến quốc tế.

### Entity chính

```txt
shipments
shipment_lines
shipment_milestones
```

### `shipments`

Dữ liệu chính:

* `shipment_no`
* `mode`
* `forwarder_id`
* `carrier`
* `vessel_flight`
* `bl_awb_no`
* `container_no`
* `pol`
* `pod`
* `etd`
* `eta`
* `atd`
* `ata`
* `status`

### `shipment_lines`

Nên link với LOT nếu có:

* `shipment_id`
* `purchase_order_line_id`
* `po_line_lot_id`
* `item_id`
* `qty_shipped`
* `lot_no`

### Status đề xuất

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

## 8. Cargo Ready / Pickup

### Mục tiêu

Xác nhận supplier đã chuẩn bị hàng.

### Entity chính

Có thể lưu trong:

```txt
po_line_lots
shipment_milestones
shipment_documents
```

### Dữ liệu cần mock

* `cargo_ready_date`
* `package_qty`
* `gross_weight`
* `net_weight`
* `cbm`
* `commercial_invoice_ref`
* `packing_list_ref`

### Business rule

* Shipment không nên chuyển `CARGO_READY` nếu chưa có LOT hoặc PO line được assign.
* Nếu có pickup tại supplier thì ghi milestone `PICKED_UP`.

---

## 9. Shipping Documents

### Mục tiêu

Lưu chứng từ phục vụ shipment và customs.

### Entity chính

```txt
shipment_documents
```

### Document type

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
OTHER
```

### Dữ liệu chính

* `shipment_id`
* `document_type`
* `document_no`
* `file_url`
* `issued_date`
* `received_date`
* `note`

---

## 10. Import Customs Declaration

### Mục tiêu

Khai báo hải quan nhập khẩu.

### Entity chính

```txt
customs_declarations
customs_declaration_lines
```

### `customs_declarations`

Dữ liệu chính:

* `shipment_id`
* `declaration_no`
* `customs_type`
* `customs_channel`
* `draft_opened_at`
* `official_opened_at`
* `cleared_at`
* `status`
* `note`

### `customs_declaration_lines`

Dữ liệu chính:

* `customs_declaration_id`
* `item_id`
* `hs_code`
* `item_description`
* `quantity`
* `unit`
* `customs_value`
* `import_duty_rate`
* `vat_rate`
* `co_form`
* `preferential_tax_rate`

### Customs channel

```txt
GREEN
YELLOW
RED
```

---

## 11. Customs Clearance

### Mục tiêu

Ghi nhận hàng đã được thông quan.

### Entity chính

```txt
shipment_milestones
customs_declarations
```

### Business rule

Khi customs được thông quan:

```txt
customs_declarations.status = CLEARED
shipments.status = CUSTOMS_CLEARED
shipment_milestones.CUSTOMS_CLEARED.actual_date = now()
```

Sau bước này mới được tạo:

```txt
carrier_delivery_orders
domestic_transport_orders
```

---

## 12. Carrier Delivery Order / Cargo Release

### Mục tiêu

Quản lý DO hãng tàu / forwarder để release hàng.

### Entity chính

```txt
carrier_delivery_orders
```

### Lưu ý

Carrier DO khác với DTO nội địa.

### Dữ liệu chính

* `shipment_id`
* `carrier_do_no`
* `forwarder_id`
* `issued_date`
* `expired_date`
* `release_location`
* `container_no`
* `local_charge_amount`
* `currency_code`
* `status`
* `note`

### Status đề xuất

```txt
PENDING
ISSUED
RELEASED
EXPIRED
CANCELLED
```

---

## 13. Domestic Transport Order / DTO

### Mục tiêu

Tạo đơn vận chuyển nội địa sau khi hàng đã thông quan và có thể release.

### Entity chính

```txt
domestic_transport_orders
domestic_transport_order_lines
```

### `domestic_transport_orders`

Dữ liệu chính:

* `dto_no`
* `shipment_id`
* `carrier_delivery_order_id`
* `truck_vendor_id`
* `origin`
* `destination`
* `warehouse`
* `vehicle_type`
* `vehicle_plate`
* `driver_name`
* `driver_phone`
* `scheduled_pickup_at`
* `actual_pickup_at`
* `scheduled_delivery_at`
* `actual_delivery_at`
* `pod_document_ref`
* `status`
* `note`

### `domestic_transport_order_lines`

Dữ liệu chính:

* `domestic_transport_order_id`
* `purchase_order_line_id`
* `po_line_lot_id`
* `item_id`
* `qty`
* `unit`

### Status đề xuất

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

### Business rule

* DTO chỉ được tạo sau `CUSTOMS_CLEARED`.
* DTO chỉ được `DISPATCHED` khi có quotation final.
* DTO chỉ được `CLOSED` khi đã có POD hoặc xác nhận giao hàng.

---

## 14. Updated Entity List

### Core

```txt
purchase_orders
purchase_order_lines
purchase_order_confirmations
po_line_lots

quotations
quotation_charge_lines

shipments
shipment_lines
shipment_milestones
shipment_documents

customs_declarations
customs_declaration_lines

carrier_delivery_orders

domestic_transport_orders
domestic_transport_order_lines
```

### Master data liên quan

```txt
item_groups
item_master
item_customs_profiles

suppliers
incoterms
currencies
transport_modes
```

---

## 15. Final Flow Cho Mock API

```txt
PO
→ Supplier Confirmation
→ PO Line LOT Planning
→ Quotation Versioning
→ Shipment Booking
→ Cargo Ready
→ International Transport
→ Shipping Documents
→ Import Customs Declaration
→ Customs Clearance
→ Carrier DO / Cargo Release
→ DTO Inland Transport
```

---

## 16. Thứ tự build mockapi đề xuất

```txt
1. Master data phụ
   suppliers
   incoterms
   currencies
   transport_modes

2. PO
   purchase_orders
   purchase_order_lines
   purchase_order_confirmations

3. LOT
   po_line_lots

4. Quotation
   quotations
   quotation_charge_lines

5. Shipment
   shipments
   shipment_lines
   shipment_milestones
   shipment_documents

6. Customs
   customs_declarations
   customs_declaration_lines

7. Carrier DO
   carrier_delivery_orders

8. DTO
   domestic_transport_orders
   domestic_transport_order_lines
```
