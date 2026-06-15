# Hướng dẫn sử dụng hệ thống eFMS Mock API

Tài liệu này giải thích cách sử dụng hệ thống từ góc nhìn của một user mới. Mục tiêu không phải là mô tả code hay API chi tiết, mà là giúp bạn hiểu hệ thống đang phục vụ nghiệp vụ gì, các màn hình dùng để làm gì, và một quy trình logistics đi qua hệ thống như thế nào.

## 1. Hệ thống này dùng để làm gì?

Hệ thống eFMS trong project hiện tại là một ứng dụng theo dõi quy trình mua hàng và nhập khẩu cho KBI.

Luồng nghiệp vụ chính:

```txt
PO -> Supplier Confirmation -> LOT Planning -> Internal DO -> Quotation -> Shipment -> Customs Clearance -> Carrier DO / Cargo Release -> DTO
```

Trong cách nhìn đơn giản hơn của frontend:

```txt
PO -> DO -> Shipment -> DTO
```

Trong đó:

- `PO` là Purchase Order, điểm bắt đầu của quy trình.
- `LOT` là cách chia hàng trong PO thành các lô giao/nhập khác nhau.
- `DO` trong hệ thống này là Internal Delivery Order, được tạo từ một hoặc nhiều LOT.
- `Quotation` là báo giá logistics cho DO.
- `Shipment` là lô vận chuyển quốc tế được tạo sau khi quotation đã được xác nhận.
- `Customs Clearance` là quy trình mở, cập nhật và thông quan tờ khai.
- `Carrier DO` là Delivery Order từ hãng tàu/forwarder để release hàng.
- `DTO` là Domestic Transport Order, dùng cho vận tải nội địa từ cảng/sân bay/kho ngoại quan về kho KBI.

Những phần hiện chưa phải phạm vi chính:

- PR / Approval.
- Warehouse Receiving chi tiết.
- GRN.
- ERP sync thật.
- Payment thật.
- SLA engine phức tạp.
- RBAC/users đầy đủ như production.

## 2. Dữ liệu mock hoạt động như thế nào?

Backend hiện tại là mock JSON runtime. Nghĩa là dữ liệu không nằm trong PostgreSQL/Prisma khi app chạy, mà nằm trong:

```txt
kbi-mock-api/mock-data/*.json
```

Khi frontend gọi API:

```txt
React screen -> src/shared/api -> backend /api/v1 -> mock-data/*.json
```

Các thao tác ghi dữ liệu sẽ thay đổi file JSON thật:

- `POST` thêm record mới vào file JSON.
- `PATCH` cập nhật record trong file JSON.
- `DELETE` thường là soft delete: record vẫn còn trong file nhưng có `is_delete: true`.

Khi chạy:

```powershell
npm.cmd run mock:seed
```

hoặc gọi:

```http
POST /api/v1/mock/reset
```

toàn bộ dữ liệu trong `mock-data/*.json` sẽ được ghi lại từ `scripts/seed-mock-data.js`. Vì vậy các thay đổi bạn thao tác trên UI có thể bị reset về dữ liệu seed.

Kết luận thực tế:

- Muốn test nhanh trên UI: cứ thao tác bình thường, dữ liệu sẽ được ghi vào `mock-data`.
- Muốn quay về bộ dữ liệu chuẩn: chạy `npm.cmd run mock:seed`.
- Muốn thêm dữ liệu demo lâu dài: sửa `scripts/seed-mock-data.js`, không chỉ sửa file JSON runtime.

## 3. Các màn hình chính

Sidebar hiện có các module chính:

- Dashboard.
- Purchase Orders.
- Delivery Orders.
- Shipments.
- Domestic Transport Orders.
- Master Data.
- Tasks.

Ngoài ra còn có:

- Profile.
- Settings.
- Login / Unauthorized.

## 4. Dashboard

Dashboard là màn hình tổng quan cho người điều phối logistics.

Bạn dùng Dashboard để trả lời các câu hỏi:

- Hiện có bao nhiêu PO?
- Bao nhiêu PO đã giao hàng?
- Bao nhiêu PO đang xử lý?
- Có bao nhiêu shipment/DO ở các trạng thái chính?
- Có công việc gấp hoặc quá hạn không?
- DO nào đang trễ hạn ở khâu NCC, vận chuyển, thông quan hoặc giao hàng?
- Công việc trễ đang tập trung ở khâu nào?
- DO trễ dưới 3 ngày, 3-7 ngày, hoặc hơn 7 ngày là bao nhiêu?

Các khu vực chính:

- Header có bộ lọc thời gian: `7 ngày`, `30 ngày`, `6 tháng`.
- KPI PO: tổng PO, PO đã giao hàng, PO đang xử lý.
- KPI shipment/DO: đang vận chuyển, chờ NCC giao hàng, đã về cảng, đã giao hàng.
- Công việc cần xử lý gấp.
- Purchase order chart.
- DO trễ hạn.
- Công việc trễ hạn.
- Số lượng DO trễ theo thời gian.

Dashboard nên được dùng như điểm bắt đầu mỗi ngày. Nếu thấy risk hoặc task gấp, bạn mở sang `Delivery Orders` hoặc `Tasks` để xử lý chi tiết.

## 5. Master Data

Master Data là nơi quản lý dữ liệu nền. Các màn hình nghiệp vụ như PO, DO, Shipment sẽ dùng dữ liệu này.

Các nhóm dữ liệu thường gặp:

- Currency: tiền tệ.
- Incoterm: điều kiện thương mại.
- Transport Mode: phương thức vận chuyển.
- Supplier / Carrier / Forwarder: đối tác.
- Item Group: nhóm hàng.
- Item Master: danh mục hàng hóa.
- Customs Profile / Tax Profile: HS code, CO form, loại hình hải quan, thuế suất.

Khi nào cần vào Master Data?

- Trước khi tạo PO nếu thiếu supplier, currency, incoterm, transport mode hoặc item.
- Khi item thiếu HS code hoặc profile hải quan.
- Khi supplier cần thêm mode vận chuyển mặc định.
- Khi dữ liệu dropdown trong form PO/Quotation/Shipment bị thiếu.

Nguyên tắc sử dụng:

- Tạo hoặc sửa dữ liệu nền trước.
- Sau đó quay lại nghiệp vụ chính để tạo PO hoặc cập nhật flow.
- Không nhập dữ liệu nền trực tiếp bằng tay vào nhiều màn hình nếu hệ thống đã có dropdown từ Master Data.

## 6. Purchase Orders

Purchase Orders là màn hình bắt đầu nghiệp vụ.

Bạn dùng màn hình này để:

- Xem danh sách PO.
- Tạo PO mới.
- Xem chi tiết PO.
- Sửa PO header.
- Gửi PO cho NCC.
- Ghi nhận Supplier Confirmation.
- Lập kế hoạch LOT.
- Chia, tách, gom item lines vào các LOT.
- Chuẩn bị tạo Internal DO từ LOT.

### 6.1. Danh sách PO

Trong danh sách PO, bạn có thể:

- Tìm kiếm PO.
- Lọc theo trạng thái.
- Xem supplier, contract, ETA/ETD, weight, container, LOT IDs.
- Mở chi tiết một PO.

Các trạng thái PO thường gặp:

- `DRAFT`: PO mới tạo, chưa gửi NCC.
- `SENT`: đã gửi PO.
- `CONFIRMED`: NCC đã xác nhận.
- `IN_PRODUCTION`: NCC đang sản xuất/chuẩn bị hàng.
- `READY_TO_SHIP`: hàng sẵn sàng giao/vận chuyển.
- `CANCELLED`: PO đã hủy.

### 6.2. Tạo PO mới

Luồng tạo PO:

1. Vào `Purchase Orders`.
2. Chọn `Create PO`.
3. Nhập thông tin header:
   - PO number.
   - Supplier.
   - Contract number nếu có.
   - Currency.
   - Incoterm.
   - Transport mode.
   - Payment term.
   - Expected ETD/ETA.
   - Notes.
4. Thêm PO lines:
   - Item.
   - Customs profile / HS code.
   - Quantity.
   - Unit.
   - Unit price.
   - Gross weight nếu có.
   - Expected ETA line.
5. Save.

Sau khi tạo PO, backend có thể trả về board LOT planning để PO có ít nhất một LOT mặc định.

### 6.3. Gửi PO và xác nhận NCC

Một PO thường đi qua:

```txt
DRAFT -> SENT -> CONFIRMED
```

Khi PO ở trạng thái phù hợp:

1. Mở chi tiết PO.
2. Chọn action gửi PO nếu có.
3. Sau khi NCC phản hồi, mở `Supplier confirmation`.
4. Nhập:
   - Confirmed by.
   - Full shipment hoặc allow partial shipment.
   - Confirmed quantity cho từng line.
   - Cargo ready date.
   - Can fulfill.
5. Submit confirmation.

Supplier confirmation giúp hệ thống biết NCC giao đủ hay giao một phần, từ đó LOT planning có cơ sở chia lô.

### 6.4. LOT Planning là gì?

LOT Planning là bước chia hàng trong PO thành các lô logistics.

Ví dụ:

```txt
PO-KBI-2026-001
  LOT-001: 60 PCS Diesel Engine Assembly
  LOT-002: 40 PCS Diesel Engine Assembly
```

Quan trọng:

- Không có khái niệm Delivery Slot trong LOT Planning hiện tại.
- LOT chứa item lines.
- Một item line có thể được split sang LOT khác.
- Một LOT có thể bị khóa khi đã assign shipment hoặc đã shipped.

### 6.5. Làm việc với LOT

Trong phần LOT Planning, bạn có thể:

- Tạo LOT rỗng.
- Sửa LOT number, LOT name, status, CRD, ETD, ETA, notes.
- Xóa LOT nếu LOT rỗng, không bị khóa và không phải LOT cuối cùng.
- Kéo thả LOT để đổi thứ tự.
- Kéo thả item line từ LOT này sang LOT khác.
- Split item line sang LOT khác.

Các status LOT bị khóa:

```txt
ASSIGNED_TO_SHIPMENT
SHIPPED
CANCELLED
```

Khi LOT bị khóa, user không nên move/split/delete item lines trong LOT đó.

### 6.6. Split item line

Split dùng khi một dòng hàng cần chia thành nhiều LOT.

Điều kiện hợp lệ:

```txt
split_qty > 0
split_qty < source qty_lotted
```

Ví dụ:

```txt
Nguồn: LOT-001 có 100 PCS
Split: 40 PCS sang LOT-002
Kết quả:
  LOT-001 còn 60 PCS
  LOT-002 có thêm 40 PCS
```

Không hợp lệ:

- Split 0.
- Split bằng toàn bộ số lượng nguồn.
- Split lớn hơn số lượng nguồn.

### 6.7. Khi nào PO sẵn sàng tạo DO?

PO sẵn sàng tạo DO khi:

- PO đã có LOT.
- LOT có item lines.
- LOT không còn lỗi quantity.
- Các ngày CRD/ETD/ETA đủ để team logistics xử lý.
- PO hoặc LOT đã ở trạng thái phù hợp với quy trình nội bộ.

## 7. Delivery Orders

Delivery Orders trong hệ thống này là Internal DO, không phải Carrier DO.

Bạn dùng màn hình này để:

- Xem danh sách DO.
- Theo dõi trạng thái DO theo tab.
- Xem DO đang gắn với PO/LOT nào.
- Xem allocation: số item, số PCS, weight, container count.
- Theo dõi route, ETA, shipment liên kết.
- Xử lý quotation.
- Theo dõi documents, tasks, source lines.
- Đẩy DO qua các trạng thái như ready for quotation, quotation confirmed, close/cancel.

### 7.1. Các tab trạng thái DO

Các tab chính:

- `Chờ xử lý`.
- `Chờ bàn giao`.
- `Đang vận chuyển quốc tế`.
- `Đang chờ thông quan`.
- `Đã thông quan`.
- `Đang giao hàng`.
- `Hoàn tất`.
- `Sự cố`.
- `Tất cả`.

Mục đích của tab là giúp user nhìn nhanh DO đang nằm ở khâu nào.

### 7.2. Cột quan trọng trong danh sách DO

`Lô hàng`:

- Hiển thị DO number.
- Hiển thị LOT number.

`Source PO LOT`:

- Cho biết DO được tạo từ PO/LOT nào.

`Nhà cung cấp / Allocation`:

- Supplier.
- Số item.
- Số lượng PCS.
- Weight.
- Container count.

Ví dụ:

```txt
4 items - 130 PCS | 500kg - 2 Conts
```

`Tuyến`:

- Port of departure.
- Port of destination.
- ETA.

`Lô hàng liên kết / ETA`:

- Shipment number nếu DO đã được gắn shipment.
- ETA và delay.
- Progress task.

`Status`:

- Trạng thái DO.
- Document completeness.
- Blocked task nếu có.

### 7.3. Mở chi tiết DO

Khi mở chi tiết DO, bạn sẽ thấy các tab:

- Overview.
- Quotations.
- Ops.
- Documents.
- Tasks.
- Source lines.

`Overview` dùng để nắm thông tin tổng quan: supplier, route, ETA, status, warehouse tracking.

`Quotations` dùng để tạo và so sánh báo giá logistics.

`Ops` dùng để xem gate vận hành, rủi ro, trạng thái đóng DO.

`Documents` dùng để quản lý chứng từ.

`Tasks` dùng để xem công việc cần hoàn tất.

`Source lines` cho biết DO line được copy từ PO/LOT nào, item gì, shipment/container/route nào.

### 7.4. Tạo DO từ LOT

Luồng đúng:

```txt
PO LOT Planning -> chọn LOT -> POST /api/v1/delivery-orders/from-lots -> Internal DO
```

Khi tạo DO từ LOT, backend copy LOT item lines thành DO lines. DO lines giữ liên kết về:

- PO.
- LOT.
- PO line.
- Item.
- HS code.
- Quantity.
- Weight.

### 7.5. Quotation trên DO

Quotation là báo giá logistics cho một DO.

Luồng thường dùng:

1. Mở chi tiết DO.
2. Chuyển sang tab `Quotations`.
3. Tạo quotation mới:
   - Carrier/Forwarder.
   - Amount.
   - Currency.
   - Shipping mode.
   - Ocean/Air freight.
   - Local charges.
   - Customs fee.
   - All inclusive hay không.
4. So sánh tối đa 2 quotation nếu cần.
5. Mark final / confirm quotation theo action có sẵn.

Rule quan trọng:

- Không sửa trực tiếp báo giá cũ nếu đã cần versioning.
- Khi giá thay đổi, tạo version mới.
- Chỉ một quotation final trong một quotation group.
- Shipment chỉ nên tạo sau khi quotation đã được xác nhận.

### 7.6. Các action trạng thái DO

Tùy trạng thái DO, UI có thể cho phép:

- Ready for quotation.
- Confirm quotation.
- Close DO.
- Cancel DO.

Ý nghĩa:

- `Ready for quotation`: DO đã đủ thông tin để lấy báo giá.
- `Confirm quotation`: báo giá đã được KBI xác nhận.
- `Close DO`: DO hoàn tất.
- `Cancel DO`: DO bị hủy, không tiếp tục xử lý.

## 8. Shipments

Shipment là màn hình quản lý lô vận chuyển quốc tế.

Bạn dùng màn hình này để:

- Xem danh sách shipment.
- Mở chi tiết shipment.
- Theo dõi route, carrier, ETD/ETA.
- Cập nhật 10 milestones.
- Quản lý chứng từ shipment.
- Tạo và xử lý customs declaration.
- Theo dõi chi phí logistics.
- Theo dõi task shipment.

### 8.1. Khi nào tạo Shipment?

Shipment được tạo từ DO sau khi quotation đã final/confirmed.

Luồng:

```txt
DO -> Quotation confirmed -> Shipment
```

Trong backend:

```http
POST /api/v1/shipments/from-delivery-order
```

Sau khi shipment được tạo, DO nguồn sẽ được cập nhật trạng thái tương ứng.

### 8.2. Danh sách Shipment

Danh sách shipment cho bạn biết:

- Shipment number.
- DO liên kết.
- Carrier.
- Mode.
- Route.
- ETD.
- ETA.
- Status.

Các tab thường gặp:

- All.
- In transit.
- Customs processing.
- Delivered.

### 8.3. 10 milestones của Shipment

Shipment có 10 mốc vận hành:

```txt
1. BOOKING_CONFIRMED
2. CARGO_READY
3. PICKED_UP
4. BL_ISSUED
5. GATE_IN_POL
6. ATD
7. CUSTOMS_DRAFT
8. ARRIVAL_NOTICE
9. CUSTOMS_CLEARED
10. DELIVERED
```

Khi milestone hoàn tất:

1. Mở chi tiết shipment.
2. Vào phần milestones.
3. Chọn milestone cần cập nhật.
4. Nhập actual date/time.
5. Chọn source nếu có: manual, API, email.
6. Ghi notes nếu cần.
7. Save/Mark done.

Milestone giúp hệ thống tính progress, trạng thái shipment và rủi ro trễ.

### 8.4. Documents trong Shipment

Các loại chứng từ có thể có:

- Commercial invoice.
- Packing list.
- Contract.
- Booking confirmation.
- Bill of lading.
- Air waybill.
- Arrival notice.
- Certificate of origin.
- Insurance.
- Customs declaration.
- eDO.
- POD.
- Other.

User có thể:

- Add document.
- Nhập document number.
- Approve document.
- Reject document với lý do.

Documents ảnh hưởng đến gate vận hành. Nếu thiếu chứng từ, DO/Shipment có thể bị xem là chưa sẵn sàng.

## 9. Customs Clearance

Customs nằm trong màn hình Shipment detail.

Bạn dùng phần này để:

- Tạo customs declaration từ shipment.
- Chọn customs type.
- Chọn customs channel: Green, Yellow, Red.
- Tạo lines từ shipment lines.
- Cập nhật trị giá hải quan.
- Mở draft.
- Mở official declaration.
- Clear customs.
- Cancel declaration nếu cần.

### 9.1. Tạo customs declaration

Luồng:

1. Mở Shipment detail.
2. Vào tab/section Customs.
3. Chọn customs type, ví dụ `IMPORT`.
4. Chọn channel nếu đã biết.
5. Create declaration.

Khi declaration được tạo, backend có thể copy shipment lines sang customs lines.

### 9.2. Các trạng thái customs

Một declaration thường đi qua:

```txt
DRAFT -> OPENED_DRAFT -> OPENED_OFFICIAL -> CLEARED
```

Có thể hủy nếu sai hoặc không tiếp tục:

```txt
CANCELLED
```

Khi customs được clear:

- Customs declaration status thành `CLEARED`.
- Shipment status thành `CUSTOMS_CLEARED`.
- Milestone `CUSTOMS_CLEARED` được đánh dấu done.

Sau đó hệ thống có thể tiếp tục Carrier DO và DTO.

## 10. Carrier DO / Cargo Release

Carrier DO là lệnh giao hàng từ carrier/forwarder để release hàng.

Không nhầm với Internal DO:

- Internal DO: lệnh điều phối nội bộ, được tạo từ PO LOT.
- Carrier DO: chứng từ/lệnh giao hàng từ hãng tàu/forwarder sau customs.

Carrier DO thường chỉ xử lý sau khi shipment đã customs cleared.

Trạng thái Carrier DO:

```txt
PENDING
ISSUED
RELEASED
EXPIRED
CANCELLED
```

Ý nghĩa:

- `PENDING`: chờ phát hành.
- `ISSUED`: đã phát hành.
- `RELEASED`: hàng đã được release.
- `EXPIRED`: hết hạn.
- `CANCELLED`: đã hủy.

## 11. DTO - Domestic Transport Order

DTO là Domestic Transport Order.

DTO dùng cho vận tải nội địa từ cảng/sân bay/kho ngoại quan về kho KBI.

DTO không phải DO. DTO là bước sau shipment/customs.

Điều kiện thường dùng:

```txt
Shipment status = CUSTOMS_CLEARED
```

### 11.1. Quan hệ Shipment ↔ DTO là nhiều-nhiều (n:n)

Đây là thiết kế quan trọng phản ánh thực tế logistics:

**Một Shipment có thể có nhiều DTO:**
- Shipment lớn (nhiều container) cần nhiều chuyến xe → mỗi chuyến là một DTO riêng.
- Giao hàng một phần: hàng gấp giao trước (DTO-1), hàng còn lại giao sau (DTO-2).
- Giao về nhiều kho: cùng một shipment nhưng hàng đi về 2 kho khác nhau.

**Một DTO có thể phục vụ nhiều Shipment:**
- Hàng LCL (Less than Container Load): nhiều shipment ghép chung container. Sau khi hải quan thông quan, một xe duy nhất gom hàng từ nhiều shipment về kho trong một chuyến.
- Cross-docking: hàng từ 2-3 shipment về cảng cùng lúc, một xe nhận hết trong một lần.

Vì vậy, hệ thống không ràng buộc 1 DTO chỉ thuộc 1 Shipment mà quản lý liên kết qua bảng trung gian `shipment-dto-links`.

### 11.2. Màn hình Domestic Transport Orders

Trong frontend, DTO có màn hình riêng:

```txt
Domestic Transport Orders
```

Bạn dùng màn hình này để:

- Xem danh sách DTO theo trạng thái.
- Tìm DTO theo DTO number, shipment, vendor, driver hoặc route.
- Tạo DTO mới từ shipment đã `CUSTOMS_CLEARED`.
- Xem tất cả shipments liên kết với DTO (có thể nhiều hơn 1).
- Xem Carrier DO, trucking vendor, route, warehouse và POD.
- Cập nhật thông tin xe, tài xế, lịch pickup/delivery, actual pickup/delivery và POD document.
- Xem DTO lines đã copy từ shipment lines.

Khi DTO liên kết với nhiều shipment:
- Trong danh sách: hiển thị "N shipments" thay vì 1 số shipment.
- Trong detail panel: hiển thị tất cả shipment dưới dạng các badge riêng.

DTO lines hiện được backend chuẩn bị sẵn dữ liệu:

- Item code / item name.
- PO line.
- LOT / lot number.
- HS code.
- Quantity.
- Ordered quantity.
- Gross weight.
- Shipment line.

### 11.3. Quản lý DTOs từ màn hình Shipment

Ngoài màn hình DTO, bạn còn có thể quản lý DTOs trực tiếp từ **Shipment detail**:

1. Mở chi tiết Shipment.
2. Chuyển sang tab **"DTOs"**.
3. Tại đây bạn có thể:
   - **Xem** danh sách DTO đang linked với Shipment này.
   - **Tạo DTO mới** cho Shipment (nếu Shipment đã `CUSTOMS_CLEARED`).
   - **Link DTO hiện có** vào Shipment này (dùng cho trường hợp LCL: một xe DTO gom hàng từ nhiều shipment):
     1. Chọn DTO từ dropdown.
     2. Nhấn **"Link"**.
     3. Hệ thống ghi nhận liên kết — DTO đó giờ phục vụ cả Shipment hiện tại.
   - **Unlink DTO** khỏi Shipment nếu liên kết không còn cần thiết (DTO không bị xóa, chỉ xóa liên kết).

### 11.4. Trạng thái DTO

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

### 11.5. Luồng sử dụng DTO đầy đủ

**Trường hợp 1: FCL — 1 Shipment, nhiều chuyến xe**

1. Shipment đạt `CUSTOMS_CLEARED`.
2. Vào Shipment detail → tab **DTOs**.
3. Tạo **DTO-1** cho chuyến xe đầu tiên (giao ngay).
4. Tạo **DTO-2** cho chuyến xe thứ hai (hàng còn lại).
5. Xử lý từng DTO theo luồng: báo giá → confirm → dispatch → giao hàng → POD → close.

**Trường hợp 2: LCL consolidation — nhiều Shipment, 1 chuyến xe**

1. Cả `shp_002` và `shp_007` về cùng cảng, cùng thời điểm.
2. `shp_002` đã tạo `dto_002` (chuyến xe gom hàng).
3. Vào `shp_007` detail → tab **DTOs**.
4. Chọn **Link DTO** → chọn `dto_002` từ dropdown → nhấn **Link**.
5. Bây giờ `dto_002` phục vụ cả `shp_002` và `shp_007` trong cùng một chuyến.
6. Xử lý `dto_002` bình thường: dispatch → giao → POD → close.

**Luồng cơ bản cho mỗi DTO:**

1. Tạo DTO (status: `DRAFT`).
2. Gửi yêu cầu báo giá vận tải nội địa (`QUOTE_PENDING`).
3. Nhận báo giá (`QUOTED`).
4. Confirm báo giá (`QUOTE_CONFIRMED`).
5. Dispatch xe — chỉ cho phép khi đang ở `QUOTE_CONFIRMED` (`DISPATCHED`).
6. Theo dõi xe trên đường (`IN_TRANSIT`).
7. Ghi nhận giao hàng thành công (`DELIVERED`).
8. Nhận Proof of Delivery — POD (`POD_RECEIVED`).
9. Close DTO (`CLOSED`).

**Rules quan trọng:**

- Không thể Dispatch nếu DTO chưa `QUOTE_CONFIRMED`.
- DTO quản lý vận tải nội địa và POD, không gộp với Internal DO.
- Unlink DTO chỉ xóa liên kết, không xóa DTO.

## 12. Tasks

Tasks là màn hình quản lý công việc vận hành.

Bạn dùng Tasks để:

- Xem task theo DO.
- Xem task theo PO.
- Lọc task theo status.
- Lọc task theo role.
- Lọc task required for DO closure.
- Xem task blocked, overdue.
- Mở detail task.
- Theo dõi progress.

Dữ liệu task hiện được backend chuẩn bị theo dạng screen DTO trong:

```txt
mock-data/screens/task-list.json
mock-data/screens/task-detail-task_001.json
mock-data/screens/po-tasks-po_001.json
```

Các API chính:

```http
GET /api/v1/tasks
GET /api/v1/tasks/:id
GET /api/v1/purchase-orders/:id/tasks
PATCH /api/v1/tasks/:id
POST /api/v1/tasks/:id/assign
```

`GET /api/v1/tasks` hỗ trợ lọc theo:

```txt
status
priority
stage
role
ref_type
ref_id
assignee_id
```

Các trạng thái task:

```txt
TODO
PENDING
IN_PROGRESS
WAITING
BLOCKED
COMPLETED
CANCELLED
```

Các stage task theo flow PO end-to-end:

```txt
SUPPLIER_CONFIRMATION
LOT_PLANNING
INTERNAL_DO
QUOTATION
SHIPMENT
CUSTOMS
CARRIER_DO
DTO
```

Các role thường gặp:

- BUYER.
- LOGISTICS_PLANNER.
- PIC_MANAGER.
- PORT_OFFICER.
- CUSTOMS_OFFICER.
- WAREHOUSE_STAFF.
- PIC Manager.
- Sale Staff.
- Port Officer.
- Customs Officer.
- Finance Officer.
- Warehouse Staff.

Khi nào dùng Tasks?

- Khi Dashboard báo có công việc khẩn cấp.
- Khi DO không close được vì còn required task.
- Khi cần biết blocker nằm ở role nào.
- Khi muốn theo dõi tiến độ xử lý chứng từ, booking, customs, delivery.

## 13. Quy trình end-to-end cho user mới

Phần này mô tả một kịch bản sử dụng hệ thống từ đầu đến cuối.

### Bước 1: Chuẩn bị Master Data

Trước khi tạo nghiệp vụ, kiểm tra:

- Supplier đã có chưa.
- Currency đã có chưa.
- Incoterm đã có chưa.
- Transport mode đã có chưa.
- Item đã có chưa.
- Item có HS code/customs profile chưa.

Nếu thiếu, vào `Master Data` để tạo hoặc cập nhật.

### Bước 2: Tạo PO

Vào `Purchase Orders`:

1. Chọn `Create PO`.
2. Nhập header PO.
3. Thêm item lines.
4. Save.

Sau bước này, PO ở trạng thái ban đầu và có dữ liệu lines để planning.

### Bước 3: Gửi PO và ghi nhận NCC xác nhận

1. Mở PO detail.
2. Gửi PO nếu đang ở trạng thái draft.
3. Khi NCC phản hồi, mở Supplier Confirmation.
4. Nhập confirmed quantity và cargo ready date.
5. Submit.

Kết quả: hệ thống biết NCC giao đủ hay giao một phần.

### Bước 4: Lập LOT Planning

1. Mở phần LOT Planning trong PO detail.
2. Kiểm tra LOT mặc định.
3. Tạo thêm LOT nếu cần.
4. Move hoặc split item lines giữa các LOT.
5. Cập nhật CRD/ETD/ETA cho LOT.
6. Đảm bảo LOT không lỗi quantity.

Kết quả: PO được chia thành các lô phù hợp để tạo DO.

### Bước 5: Tạo Internal DO từ LOT

1. Trong `LOT Planning`, tick checkbox ở một hoặc nhiều LOT đang mở và có item lines.
2. Chọn `Create Internal DO`.
3. Hệ thống gọi `POST /api/v1/delivery-orders/from-lots` và copy LOT lines thành DO lines.
4. Sau khi tạo thành công, frontend tự mở `Delivery Orders` để kiểm tra DO mới.

Kết quả: logistics team có một DO nội bộ để xử lý quotation, shipment, documents và tasks.

### Bước 6: Xử lý DO và Quotation

1. Mở DO detail.
2. Kiểm tra Overview, Source lines, Documents, Tasks.
3. Chuyển DO sang ready for quotation nếu đủ thông tin.
4. Tạo quotation từ carrier/forwarder.
5. So sánh quotation nếu có nhiều báo giá.
6. Confirm quotation.

Kết quả: DO đã có báo giá logistics được xác nhận.

### Bước 7: Tạo Shipment

1. Tạo shipment từ DO đã quotation confirmed.
2. Kiểm tra carrier, mode, route, ETD/ETA.
3. Theo dõi shipment trong màn hình `Shipments`.

Kết quả: hàng đã bước sang giai đoạn vận chuyển quốc tế.

### Bước 8: Cập nhật Milestones và Documents

Trong Shipment detail:

1. Update milestones khi có sự kiện thực tế.
2. Upload/thêm chứng từ.
3. Approve/reject chứng từ.
4. Theo dõi missing documents.

Kết quả: trạng thái vận chuyển và chứng từ phản ánh đúng thực tế.

### Bước 9: Customs Clearance

1. Tạo customs declaration từ shipment.
2. Kiểm tra customs lines.
3. Cập nhật trị giá hải quan nếu cần.
4. Open draft.
5. Open official.
6. Clear customs.

Kết quả: shipment chuyển sang `CUSTOMS_CLEARED`.

### Bước 10: Carrier DO và DTO

Sau customs cleared:

1. Tạo hoặc cập nhật Carrier DO để release hàng từ hãng tàu/forwarder.
2. Vào Shipment detail → tab **DTOs** để quản lý vận tải nội địa.
3. **Tạo DTO mới** cho shipment này nếu chưa có:
   - Nhấn "Create DTO" trong tab DTOs.
   - Backend tự động tạo liên kết shipment ↔ DTO.
4. Hoặc **Link DTO hiện có** (trường hợp LCL, nhiều shipment chung một chuyến xe):
   - Chọn DTO từ dropdown → nhấn "Link".
5. Trong màn hình Domestic Transport Orders, xử lý từng DTO:
   - Confirm quote.
   - Dispatch xe (chỉ khi đã `QUOTE_CONFIRMED`).
   - Theo dõi xe in transit.
   - Ghi nhận delivered.
   - Nhận POD.
   - Close DTO.

Kết quả: hàng được đưa về kho KBI và quy trình vận hành có thể đóng.

**Lưu ý quan hệ n:n**: Nếu một Shipment cần nhiều chuyến xe (ví dụ shipment lớn, nhiều container), lặp lại bước 3 để tạo thêm DTO-2, DTO-3... Mỗi DTO là một chuyến xe riêng biệt.

### Bước 11: Close DO

Trước khi close DO, kiểm tra:

- Shipment đã delivered hoặc đủ điều kiện hoàn tất.
- Customs cleared.
- Chứng từ cần thiết đã đủ.
- Required tasks đã completed.
- DTO/POD nếu thuộc phạm vi vận hành đã đủ.

Sau đó close DO.

## 14. Cách đọc trạng thái và rủi ro

### 14.1. PO risk

PO có thể rủi ro nếu:

- NCC chưa confirm.
- Cargo ready date trễ.
- LOT chưa được planning.
- ETD/ETA không rõ.
- Tổng quantity lotted vượt quantity ordered.

### 14.2. DO risk

DO có thể rủi ro nếu:

- Chưa có shipment liên kết.
- Missing documents.
- Blocked tasks.
- ETA trễ.
- Customs chưa clear.
- Warehouse planned entry bị trễ.

### 14.3. Shipment risk

Shipment có thể rủi ro nếu:

- Milestone quan trọng chưa done.
- ATD/ETA trễ.
- Arrival notice hoặc BL/AWB thiếu.
- Customs draft chưa mở.
- Customs chưa clear.

### 14.4. Task risk

Task cần chú ý nếu:

- Priority `URGENT`.
- Status `BLOCKED`.
- Due date đã quá hạn.
- Required for DO closure nhưng chưa completed.

## 15. Các nguyên tắc sử dụng quan trọng

1. Bắt đầu từ PO, không bắt đầu từ Shipment nếu chưa có DO/PO context.
2. Không tự tạo dữ liệu rời rạc nếu có flow endpoint tạo từ entity trước đó.
3. PO lines phải đủ item, quantity, unit, HS code nếu cần customs.
4. LOT Planning không dùng Slot.
5. DO được tạo từ LOT, không phải nhập tay toàn bộ line nếu hệ thống đã có LOT.
6. Shipment được tạo sau quotation confirmed.
7. Customs được tạo từ Shipment.
8. DTO được tạo sau customs cleared. Một Shipment có thể có nhiều DTO (nhiều chuyến xe). Một DTO có thể phục vụ nhiều Shipment (LCL consolidation).
9. Tasks là checklist vận hành, không chỉ là ghi chú.
10. Dashboard dùng để phát hiện việc cần xử lý, không thay thế màn hình detail.

## 16. Các lỗi thường gặp khi user mới sử dụng

### 16.1. Không thấy dữ liệu dropdown

Nguyên nhân thường là thiếu Master Data.

Cách xử lý:

- Vào `Master Data`.
- Kiểm tra supplier, item, currency, incoterm, transport mode.
- Nếu đang dùng mock data, chạy lại seed nếu dữ liệu bị hỏng:

```powershell
npm.cmd run mock:seed
```

### 16.2. Không move/split được LOT line

Kiểm tra:

- LOT nguồn hoặc LOT đích có bị locked không.
- LOT status có phải `ASSIGNED_TO_SHIPMENT`, `SHIPPED`, `CANCELLED` không.
- Split quantity có hợp lệ không.
- Có LOT đích khác LOT nguồn không.

### 16.3. Không xóa được LOT

Một LOT chỉ nên xóa được nếu:

- LOT rỗng.
- LOT không bị locked.
- Không phải LOT cuối cùng của PO.

### 16.4. DO hiện chưa có shipment liên kết

Điều này xảy ra khi DO chưa được tạo shipment.

Cách xử lý:

- Kiểm tra DO đã quotation confirmed chưa.
- Nếu đủ điều kiện, tạo shipment từ DO.
- Nếu đang test mock data, đảm bảo seed có shipment liên kết hoặc tạo qua flow.

### 16.5. Không close được DO

Kiểm tra:

- Còn missing documents không.
- Còn blocked/required tasks không.
- Shipment/customs/DTO đã đạt trạng thái cần thiết chưa.
- Warehouse actual entry/POD đã có chưa nếu flow yêu cầu.

### 16.6. Không dispatch được DTO

DTO chỉ được chuyển sang `DISPATCHED` khi status đang là `QUOTE_CONFIRMED`.

Kiểm tra:

- DTO đã nhận báo giá chưa (`QUOTED`).
- Báo giá đã được confirm chưa (`QUOTE_CONFIRMED`).
- Nếu chưa, cập nhật status DTO theo thứ tự: `QUOTE_PENDING` → `QUOTED` → `QUOTE_CONFIRMED` → rồi mới Dispatch.

### 16.7. Muốn link một DTO vào nhiều Shipment (LCL)

1. Tạo DTO từ Shipment đầu tiên (DTO được tạo và tự động linked với Shipment đó).
2. Vào Shipment thứ hai → tab **DTOs**.
3. Trong dropdown "Link existing DTO", chọn DTO vừa tạo.
4. Nhấn **"Link"**.
5. DTO đó giờ phục vụ cả hai Shipment.

### 16.8. Dữ liệu vừa nhập bị mất

Nếu bạn chạy:

```powershell
npm.cmd run mock:seed
```

dữ liệu mock runtime sẽ reset. Đây là hành vi đúng của mock API.

## 17. Gợi ý cách học hệ thống nhanh

Nếu bạn là user mới, hãy đi theo thứ tự sau:

1. Mở Dashboard để xem tổng quan.
2. Mở Master Data để hiểu dữ liệu nền.
3. Mở Purchase Orders và xem một PO detail.
4. Tìm phần LOT Planning và thử hiểu LOT chứa item lines như thế nào.
5. Mở Delivery Orders và xem DO được tạo từ PO/LOT ra sao.
6. Mở tab Source lines trong DO để thấy liên kết PO -> LOT -> DO line.
7. Mở tab Quotations để hiểu báo giá logistics.
8. Mở Shipments để xem route, milestones, documents.
9. Mở Customs trong Shipment detail để hiểu khai báo hải quan.
10. Mở Domestic Transport Orders để xem DTO, trucking vendor, xe/tài xế, route và POD.
11. Mở Tasks để xem công việc vận hành theo role.

Sau khi đi qua 10 bước này, bạn sẽ hiểu được hệ thống không chỉ là các bảng dữ liệu riêng lẻ, mà là một chuỗi nghiệp vụ nối tiếp nhau.

## 18. Glossary

`PO`: Purchase Order, đơn mua hàng.

`LOT`: Lô hàng được planning từ PO lines.

`Internal DO`: Delivery Order nội bộ, được tạo từ một hoặc nhiều LOT.

`Carrier DO`: Lệnh giao hàng từ carrier/forwarder, dùng để release hàng.

`DTO`: Domestic Transport Order, lệnh vận tải nội địa. Quan hệ với Shipment là nhiều-nhiều (n:n): 1 Shipment có thể có nhiều DTO (nhiều chuyến xe), và 1 DTO có thể phục vụ nhiều Shipment (LCL consolidation).

`ETD`: Estimated Time of Departure.

`ATD`: Actual Time of Departure.

`ETA`: Estimated Time of Arrival.

`ATA`: Actual Time of Arrival.

`CRD`: Cargo Ready Date.

`HS Code`: Mã phân loại hàng hóa hải quan.

`Customs Channel`: Luồng hải quan Green/Yellow/Red.

`POD`: Proof of Delivery.

`LCL`: Less than Container Load — hàng ghép container với các lô hàng của đơn vị khác. Trong KBI context: nhiều Shipment LCL về cùng cảng có thể được gom chung trong 1 DTO (1 chuyến xe) để tiết kiệm chi phí vận tải nội địa.

`FCL`: Full Container Load — hàng thuê nguyên container. Một Shipment FCL lớn có thể cần nhiều chuyến xe (nhiều DTO) để chở về kho.

`Mock data`: Dữ liệu JSON dùng cho demo/test thay vì database thật.

`Screen DTO`: Dữ liệu API đã được backend chuẩn bị sẵn cho một màn hình, frontend không cần tự join nhiều bảng.

## 19. Tóm tắt ngắn

Hãy nhớ flow chính:

```txt
PO -> LOT -> DO -> Quotation -> Shipment -> Customs -> Carrier DO / DTO -> Close
```

Với vai trò user vận hành:

- Dùng `Dashboard` để biết việc gì cần chú ý.
- Dùng `Purchase Orders` để tạo PO và planning LOT.
- Dùng `Delivery Orders` để xử lý DO, quotation, documents, tasks.
- Dùng `Shipments` để theo dõi vận chuyển, milestones, chứng từ, customs.
- Dùng `Domestic Transport Orders` để theo dõi vận tải nội địa và POD.
- Dùng `Tasks` để xử lý việc cần làm theo role.
- Dùng `Master Data` để chuẩn bị dữ liệu nền.

Nếu thao tác làm thay đổi dữ liệu, mock API sẽ ghi vào `kbi-mock-api/mock-data/*.json`. Nếu muốn reset về dữ liệu chuẩn, chạy `npm.cmd run mock:seed`.
