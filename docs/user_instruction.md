# Hướng dẫn sử dụng cho người dùng

Tài liệu này chỉ liệt kê **các bước thao tác** và **quy trình** sử dụng hệ thống. Không cần biết lập trình.

> Cần chi tiết kỹ thuật (dữ liệu, API, lệnh khởi tạo lại dữ liệu mẫu): xem [how_to_use.md](./how_to_use.md).

## Mục lục

1. [Quy trình tổng thể](#1-quy-trình-tổng-thể)
2. [Đăng nhập và menu](#2-đăng-nhập-và-menu)
3. [Thao tác trên từng màn hình](#3-thao-tác-trên-từng-màn-hình)
4. [Quy trình từ đầu đến cuối](#4-quy-trình-từ-đầu-đến-cuối)

---

## 1. Quy trình tổng thể

```
Đơn mua hàng  →  Chia lô  →  Lệnh giao hàng nội bộ  →  Báo giá
   (PO)          (LOT)             (DO)               (Quotation)
                                                          │
                                                          ▼
   Đóng lệnh  ←  Vận chuyển nội địa  ←  Hải quan  ←  Lô vận chuyển quốc tế
                       (DTO)          (thông quan)        (Shipment)
```

- **PO** đặt mua hàng → **LOT** chia hàng thành lô → **DO** lệnh giao hàng nội bộ tạo từ lô → **Quotation** báo giá vận chuyển → **Shipment** lô vận chuyển quốc tế → **Hải quan** thông quan → **DTO** điều xe chở về kho → **Đóng lệnh**.

> Phân biệt hai tên dễ nhầm trên menu: **Lô hàng (DO)** = lệnh giao hàng nội bộ; **Lô hàng (Shipment)** = lô vận chuyển quốc tế.

---

## 2. Đăng nhập và menu

**Đăng nhập:**

1. Mở hệ thống bằng đường link được cấp.
2. Nhập **email** và **mật khẩu** → nhấn **Đăng nhập**.

**Thanh menu bên trái:**

| Mục | Dùng để |
|---|---|
| **Tổng quan** | Xem số liệu, việc gấp, việc trễ. |
| **Đơn mua hàng (PO)** | Tạo đơn, chia lô, tạo lệnh giao hàng. |
| **Lô hàng (DO)** | Lệnh giao hàng nội bộ, báo giá, chứng từ, công việc. |
| **Lô hàng (Shipment)** | Lô vận chuyển quốc tế, mốc hành trình, hải quan, DTO. |
| **Vận chuyển nội địa** | Điều xe chở hàng từ cảng về kho, theo dõi POD. |
| **Danh sách mặt hàng** | Dữ liệu nền: nhà cung cấp, mặt hàng, tiền tệ, Incoterm... |
| **Công việc** | Việc cần làm theo khâu và vai trò. |

Thao tác chung: **Tìm kiếm**, **lọc theo tab**, **Làm mới (Refresh)**, bấm một dòng để **mở chi tiết**. Đổi ngôn ngữ/giao diện trong **Cài đặt**.

---

## 3. Thao tác trên từng màn hình

### 3.1. Tổng quan

1. Chọn khoảng thời gian (7 ngày / 30 ngày / 6 tháng).
2. Xem các ô số liệu và danh sách việc gấp/đang trễ.
3. Bấm vào mục cần xử lý để mở sang màn hình chi tiết.

### 3.2. Danh sách mặt hàng (dữ liệu nền)

Vào đây để **bổ sung trước** nhà cung cấp, mặt hàng (kèm mã HS nếu cần hải quan), tiền tệ, Incoterm, phương thức vận chuyển — khi các form khác bị thiếu lựa chọn. Bổ sung xong quay lại màn hình nghiệp vụ.

### 3.3. Đơn mua hàng (PO)

**Tạo đơn:**

1. Vào **Đơn mua hàng (PO)** → **Tạo Đơn mua hàng**.
2. Nhập thông tin chung: số đơn, nhà cung cấp, tiền tệ, Incoterm, phương thức vận chuyển, điều khoản thanh toán, ngày dự kiến đi/đến.
3. Thêm các dòng hàng: mặt hàng, mã HS, số lượng, đơn vị, đơn giá, trọng lượng.
4. Nhấn **Lưu**.

**Gửi đơn và xác nhận nhà cung cấp:**

1. Mở chi tiết đơn → gửi đơn cho nhà cung cấp.
2. Mở **Supplier confirmation** (bật sau khi đã gửi đơn).
3. Nhập: người xác nhận, giao đủ/một phần, số lượng xác nhận từng dòng, ngày hàng sẵn sàng → **gửi xác nhận**.

**Chia lô (LOT Planning):**

1. Mở phần chia lô trong chi tiết đơn.
2. Tạo lô mới, sửa tên/ngày của lô.
3. Kéo thả để chuyển dòng hàng giữa các lô; **Tách (split)** một dòng sang lô khác (số tách > 0 và < số của lô nguồn).
4. Xóa lô khi lô rỗng, không bị khóa, không phải lô cuối cùng.

> Lô đã gắn vận chuyển hoặc đã giao sẽ bị **khóa** — không di chuyển/tách/xóa được.

**Tạo lệnh giao hàng nội bộ (DO) từ lô:**

1. Trong phần chia lô, **tích chọn** một hoặc nhiều lô (đang mở, có hàng).
2. Nhấn **Create Internal DO**.
3. Hệ thống tạo lệnh và mở màn hình **Lô hàng (DO)**.

### 3.4. Lô hàng (DO)

**Báo giá:**

1. Mở chi tiết lệnh → tab **Báo giá (Quotations)**.
2. **Tạo báo giá mới**: đơn vị vận chuyển, số tiền, tiền tệ, phương thức, các loại phí.
3. So sánh các báo giá → **chốt / xác nhận** báo giá.

> Chỉ một báo giá được chốt. Giá thay đổi thì tạo báo giá mới thay vì sửa đè.

**Nút trạng thái thường gặp:** **Ready for quotation** (đủ thông tin để lấy báo giá) → **Create Shipment** (khi đã chốt báo giá) → **Close DO** (đóng lệnh) / **Cancel** (hủy). Xác nhận báo giá làm trong tab **Báo giá** (nút **Mark final**). Nhấn **Close DO** sẽ mở hộp thoại xác nhận kèm checklist trước khi đóng.

### 3.5. Lô hàng (Shipment)

Lô vận chuyển được tạo **từ một DO đã chốt báo giá**. Các tab: Tổng quan, Milestones, Documents, Containers, Customs, Chi phí (Landed Cost), Công việc (PO Tasks), Carrier DO, DTOs.

**Tạo lô vận chuyển (hai cách):**

- *Nhanh:* mở **Lô hàng (DO)** đã chốt báo giá → nhấn **Create Shipment** ở đầu trang; cửa sổ đã điền sẵn tuyến/ngày từ DO.
- *Hoặc:* vào **Lô hàng (Shipment)** → **Create Shipment** → chọn **DO đã chốt báo giá** (tự điền đơn mua, phương thức, tuyến, ngày).

Bổ sung hãng tàu, tên tàu/chuyến, số BL/AWB nếu có. **Số lô vận chuyển để trống sẽ được tự sinh.** Nhấn **Create shipment**.

**Cập nhật mốc hành trình (Milestones):**

1. Mở chi tiết lô → tab **Milestones**.
2. Chọn mốc khi sự kiện thực tế xảy ra.
3. Nhập ngày/giờ thực tế → **Mark done**.

**Hải quan (tab Customs):**

1. Tạo tờ khai → mở tờ khai nháp → mở tờ khai chính thức → **thông quan**.
2. Sau khi thông quan, lô chuyển sang **Đã thông quan**.

> Phân luồng: Xanh = thông quan nhanh; Vàng = bổ sung hồ sơ; Đỏ = kiểm hóa.

**Carrier DO (tab Carrier DO):** sau khi đã thông quan, lần lượt nhấn **Create carrier DO → Issue → Release** để được lấy hàng.

**Tab DTOs:** chỉ để **xem** các DTO đã liên kết và **Unlink** (bỏ liên kết). **Không tạo mới và không liên kết thủ công ở đây.**

### 3.6. Vận chuyển nội địa (DTO)

Sau khi hàng **đã thông quan**, điều xe chở hàng về kho. Mỗi chuyến xe là một **DTO**.

**Tạo DTO — hai cách (đều mở cùng một cửa sổ có chọn container và kiểm tra cảng):**

- *Cách A — từ màn hình Vận chuyển nội địa:*
  1. Vào **Vận chuyển nội địa**.
  2. Ô **Create from shipment** chọn lô đã thông quan.
  3. Nhấn **Create DTO**.
- *Cách B — từ danh sách Lô hàng (Shipment):*
  1. Vào **Lô hàng (Shipment)**, tích chọn lô đã thông quan.
  2. Nhấn **Create DTO** (chọn 1 lô) hoặc **Consolidate DTO (N)** (chọn nhiều lô).

Trong cửa sổ tạo DTO: chọn container cho chuyến xe nếu cần (container đã gán DTO khác sẽ bị mờ); khi gom nhiều lô, tất cả phải **cùng một cảng (POD)**. DTO mới tự động liên kết với (các) lô đã chọn.

**Xử lý một DTO (mở chi tiết, bấm các nút theo thứ tự):**

1. **Quote pending** — gửi yêu cầu báo giá vận tải nội địa.
2. **Confirm quote** — chốt báo giá.
3. **Dispatch** — điều xe (chỉ bật sau khi đã chốt báo giá).
4. **Start transit** — xe lên đường.
5. **Deliver** — ghi nhận đã giao.
6. Nhập **POD document** → **Save**; rồi nhấn **Mark POD received** để ghi nhận đã có chứng từ.
7. **Close** — đóng lệnh.

> Nhập biển số xe, loại xe, tài xế, kho đến, lịch lấy/giao hàng, **cước nội địa (Quote amount/Currency)** trong phần thông tin → nhớ **Save**.

**Hai tình huống:**

- **Một lô cần nhiều chuyến xe** (hàng lớn, nhiều container): tạo nhiều DTO cho cùng một lô.
- **Nhiều lô đi chung một chuyến xe** (ghép/LCL): trong **Lô hàng (Shipment)** tích chọn các lô **cùng cảng** → nhấn **Consolidate DTO (N)**.

### 3.7. Công việc (Tasks)

1. Xem việc theo lệnh giao hàng hoặc theo đơn mua hàng.
2. Lọc theo trạng thái, vai trò, khâu; tìm việc **bị chặn** hoặc **quá hạn**.
3. Mở chi tiết một việc để theo dõi tiến độ.

---

## 4. Quy trình từ đầu đến cuối

**Bước 1 — Chuẩn bị dữ liệu nền.** Vào **Danh sách mặt hàng**, kiểm tra/bổ sung nhà cung cấp, mặt hàng (kèm mã HS), tiền tệ, Incoterm, phương thức vận chuyển.

**Bước 2 — Tạo đơn mua hàng.** **Đơn mua hàng (PO)** → **Tạo Đơn mua hàng** → nhập thông tin chung + dòng hàng → **Lưu**.

**Bước 3 — Gửi đơn và xác nhận NCC.** Gửi đơn → mở **Supplier confirmation** → nhập số lượng xác nhận và ngày hàng sẵn sàng.

**Bước 4 — Chia lô.** Mở phần chia lô, tạo/điều chỉnh lô, chuyển/tách dòng hàng, kiểm tra số lượng.

**Bước 5 — Tạo lệnh giao hàng nội bộ (DO).** Tích chọn lô → **Create Internal DO**.

**Bước 6 — Xử lý lệnh và báo giá.** Mở chi tiết lệnh → **Ready for quotation** → tạo và so sánh báo giá → **chốt báo giá**.

**Bước 7 — Tạo lô vận chuyển quốc tế (Shipment).** Trong **Lô hàng (DO)** đã chốt báo giá nhấn **Create Shipment** (hoặc vào **Lô hàng (Shipment)** → **Create Shipment** rồi chọn DO). Số lô để trống sẽ tự sinh; bổ sung hãng tàu/tuyến/ngày → **Create shipment**.

**Bước 8 — Cập nhật mốc và chứng từ.** Trong chi tiết lô: cập nhật mốc, thêm/duyệt chứng từ.

**Bước 9 — Thủ tục hải quan.** Tab **Customs**: tạo tờ khai → nháp → chính thức → **thông quan** (lô chuyển sang **Đã thông quan**).

**Bước 10 — Lấy hàng và vận chuyển nội địa.**

1. Trong **chi tiết lô → tab Carrier DO**: **Create carrier DO → Issue → Release**.
2. Tạo DTO (Cách A hoặc B ở mục 3.6) cho lô đã thông quan; chọn container nếu cần.
3. Nếu nhiều lô đi chung một xe: trong **Lô hàng (Shipment)** tích chọn các lô cùng cảng → **Consolidate DTO (N)**.
4. Xử lý DTO: Quote pending → Confirm quote → Dispatch → Start transit → Deliver → nhập POD + Save → **Mark POD received** → Close.

**Bước 11 — Đóng lệnh giao hàng (DO).** Kiểm tra: đã giao/đủ điều kiện, đã thông quan, chứng từ đủ, công việc bắt buộc đã xong, có POD nếu cần → **Close DO**.
