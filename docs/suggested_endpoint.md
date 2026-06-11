Table tiếp theo nên implement là **Shipment module**, không nên chỉ tạo mỗi `shipments`, vì Shipment cần quản lý:

```txt
Shipment header
→ Shipment lines
→ 10 milestones
→ Shipping documents
```

Technical requirement cũng yêu cầu Shipment tracking theo **10 milestone từ Booking đến EDO & Delivery**, kèm document upload theo milestone. 
SOP ban đầu cũng xác định sau **Quotation Versioning** là **Shipment Booking → Cargo Ready → International Transport → Shipping Documents**. 

---

# 1. Thứ tự table cần tạo tiếp theo

```txt
1. shipments
2. shipment_lines
3. shipment_milestones
4. shipment_documents
```

Sau 4 table này, bạn đủ để implement đoạn:

```txt
Internal DO
→ Quotation final
→ Shipment Booking
→ Cargo Ready
→ International Transport
→ Shipping Documents
```

---

# 8. Endpoint nên implement sau khi có table

```txt
POST   /api/v1/shipments/from-delivery-order
GET    /api/v1/shipments
GET    /api/v1/shipments/:id
PATCH  /api/v1/shipments/:id
POST   /api/v1/shipments/:id/cancel

GET    /api/v1/shipments/:id/lines

GET    /api/v1/shipments/:id/milestones
POST   /api/v1/shipments/:id/milestones/:milestoneCode/done

GET    /api/v1/shipments/:id/documents
POST   /api/v1/shipments/:id/documents
PATCH  /api/v1/shipment-documents/:documentId
DELETE /api/v1/shipment-documents/:documentId
```

---

# 9. Rule service layer cần giữ

```txt
1. Chỉ tạo Shipment khi delivery_orders.status = QUOTATION_CONFIRMED.

2. Khi tạo Shipment:
   - insert shipments
   - copy delivery_order_lines sang shipment_lines
   - auto tạo 10 shipment_milestones
   - update delivery_orders.status = ASSIGNED_TO_SHIPMENT

3. Không cho sửa shipment_lines khi Shipment đã DELIVERED hoặc CANCELLED.

4. Update milestone nào thì update Shipment status tương ứng.

5. Khi milestone CUSTOMS_CLEARED done:
   - shipments.status = CUSTOMS_CLEARED
   - bước tiếp theo mới cho tạo Customs / Carrier DO / DTO.
```

---

# 10. Sau Shipment module sẽ làm gì?

Sau khi xong 4 table này, flow của bạn sẽ đạt tới:

```txt
PO
→ Supplier Confirmation
→ LOT Planning
→ Internal DO
→ Quotation
→ Shipment
→ Milestones
→ Documents
```
