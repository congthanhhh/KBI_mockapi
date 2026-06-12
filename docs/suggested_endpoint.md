**Customs module**:

```txt
customs_declarations
customs_declaration_lines
```

Trong `database.sql` hiện tại mình thấy đã có nhóm `shipments`, `shipment_lines`, `shipment_milestones`, `shipment_documents` và các function liên quan Shipment rồi. 
Theo SOP, sau **Shipping Documents** sẽ tới **Import Customs Declaration → Customs Clearance**, và sau khi clear customs mới được tạo **Carrier DO / DTO**. 

---

---

# 5. API nên implement cho Customs

Theo tài liệu GD1, Shipment API có cập nhật milestone, upload document và theo dõi customs trong shipment tracking. 
Trong Excel mapping, phần `Docs-custom` cũng nên map sang `shipment_documents`, `customs_declarations`, và `shipment_milestones`. 

```txt
GET  /api/v1/shipments/:shipmentId/customs-declarations
POST /api/v1/shipments/:shipmentId/customs-declarations

GET  /api/v1/customs-declarations/:id
PATCH /api/v1/customs-declarations/:id

GET  /api/v1/customs-declarations/:id/lines
POST /api/v1/customs-declarations/:id/lines
PATCH /api/v1/customs-declaration-lines/:lineId
DELETE /api/v1/customs-declaration-lines/:lineId

POST /api/v1/customs-declarations/:id/open-draft
POST /api/v1/customs-declarations/:id/open-official
POST /api/v1/customs-declarations/:id/clear
POST /api/v1/customs-declarations/:id/cancel
```

Request tạo customs declaration:

```json
{
  "declaration_no": null,
  "customs_type": "IMPORT",
  "customs_channel": null,
  "broker_id": "uuid",
  "note": "Create draft customs declaration from shipment lines"
}
```

Service nên gọi:

```sql
SELECT fn_create_customs_declaration_from_shipment(
    $1::UUID,     -- shipment_id
    $2::VARCHAR,  -- declaration_no
    $3::VARCHAR,  -- customs_type
    $4::VARCHAR,  -- customs_channel
    $5::UUID,     -- broker_id
    $6::TEXT      -- note
) AS customs_declaration_id;
```

Request mở tờ khai chính thức:

```json
{
  "declaration_no": "105987654321",
  "customs_channel": "YELLOW",
  "opened_at": "2026-07-05T09:00:00Z"
}
```

Request thông quan:

```json
{
  "cleared_at": "2026-07-06T15:30:00Z",
  "note": "Customs cleared successfully"
}
```

---

# 6. Business rule cần giữ ở service layer

```txt
1. Chỉ tạo customs_declaration khi shipment chưa CANCELLED.

2. Khi tạo customs declaration:
   - insert customs_declarations
   - copy shipment_lines sang customs_declaration_lines
   - lấy HS code / thuế / CO từ item_customs_profiles
   - update shipment.status = CUSTOMS_DRAFT
   - mark milestone CUSTOMS_DRAFT = DONE

3. Không cho sửa customs_declaration_lines nếu declaration đã CLEARED hoặc CANCELLED.

4. Khi clear customs:
   - customs_declarations.status = CLEARED
   - shipments.status = CUSTOMS_CLEARED
   - shipment_milestones.CUSTOMS_CLEARED.actual_at = now()

5. Chỉ sau CUSTOMS_CLEARED mới cho tạo:
   - carrier_delivery_orders
   - domestic_transport_orders
```

---

## Sau bước này làm gì?

Sau khi chạy xong Customs module, table tiếp theo là:

```txt
7. carrier_delivery_orders
```

Tức là flow của bạn sẽ đạt tới:

```txt
PO
→ Supplier Confirmation
→ LOT Planning
→ Internal DO
→ Quotation
→ Shipment
→ Customs Declaration
→ Customs Clearance
```

Tiếp theo mới tới:

```txt
Carrier DO / Cargo Release
→ DTO
```
