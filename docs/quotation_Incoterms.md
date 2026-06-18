Dựa trên 7 file báo giá, Incoterms được áp dụng phân thành 3 nhóm chính là **EXW/FCA**, **FOB**, và **CFR**. Sự xuất hiện của các trường (field) chi phí phụ thuộc trực tiếp vào trách nhiệm của người mua trong từng điều kiện Incoterms. 

Dưới đây là phân loại chi tiết các field cho từng nhóm Incoterms:

### 1. Nhóm EXW / FCA (Giao tại xưởng / Giao cho người chuyên chở)
Với điều kiện này, người mua phải chịu toàn bộ chi phí từ xưởng hoặc điểm thu gom của người bán ở nước ngoài về đến tận kho tại Việt Nam. Do đó, báo giá nhóm này (bao gồm cả hàng nguyên cont FCL, hàng lẻ LCL và đường hàng không Air) chứa **đầy đủ 4 hạng mục chi phí lớn**:

*   **Phí địa phương tại cảng/sân bay xuất:**
    *   `EXW / FCA Charge per BL` (hoặc tính theo `LÔ`).
    *   `EXW / FCA Charge` tính theo `CONT` (với hàng FCL), theo `RT` (với hàng LCL), hoặc theo `KGS` (với hàng Air).
*   **Cước vận chuyển quốc tế:** Tên hãng chuyên chở (Carrier) với đơn giá tính theo `CONT`, `RT`, hoặc `KGS` tùy hình thức.
*   **Phí địa phương tại Việt Nam:**
    *   Hàng biển (FCL/LCL) luôn có: `D/O`, `Handling fee`, `THC`, và `CIC`. Riêng FCL có thêm `EMC / EMF` và `CLEANING`. Riêng LCL có thêm `CFS`.
    *   Hàng Air thường chỉ có duy nhất: `Handling fee`.
*   **Phí TTHQ & Vận chuyển tại VN:**
    *   `Thủ tục hải quan` (Tờ khai Luồng Xanh/Vàng/Đỏ) và `Trucking` (vận chuyển nội địa).
    *   `Hạ xa` (chỉ dành riêng cho hàng nguyên cont FCL).
    *   `Phí bốc xếp từ xe xuống pallet` (chỉ dành riêng cho hàng Air).

### 2. Nhóm FOB (Giao lên tàu)
Với điều kiện FOB, người bán đã thanh toán mọi chi phí tại cảng xuất. Trách nhiệm trả phí của người mua bắt đầu từ lúc hàng lên tàu chở về Việt Nam. Vì vậy, báo giá nhóm FOB **không có "Phí địa phương tại cảng xuất"**:

*   **Cước vận chuyển quốc tế:** Bắt đầu tính từ cước chuyên chở của carrier theo `CONT` (với hàng FCL) hoặc theo `RT` (với hàng LCL).
*   **Phí địa phương tại Việt Nam:** 
    *   Chung cho cả FCL và LCL: `D/O`, `Handling fee`, `THC`, `CIC`.
    *   Riêng FCL có thêm: `EMC / EMF` và `CLEANING`.
    *   Riêng LCL có thêm: `CFS`.
*   **Phí TTHQ & Vận chuyển tại VN:** `Thủ tục hải quan` (Tờ khai), `Trucking` về kho. Nếu là hàng nguyên cont FCL sẽ có thêm field `Hạ xa`.

### 3. Nhóm CFR (Tiền hàng và Cước phí)
Với điều kiện CFR, người bán đã lo toàn bộ chi phí tại nước ngoài bao gồm cả cước phí vận chuyển quốc tế về đến cảng Việt Nam. Người mua chỉ phải trả chi phí đầu bến tại Việt Nam. Do đó, báo giá nhóm này **không có cả "Phí địa phương tại cảng xuất" lẫn "Cước vận chuyển quốc tế"**:

*   **Phí địa phương tại Việt Nam:** Gồm các field `D/O`, `Handling fee`, `THC`, `CIC`, `EMC / EMF`, và `CLEANING` (Do file mẫu hiện tại là CFR cho hàng FCL).
*   **Phí TTHQ & Vận chuyển tại VN:** Gồm `Thủ tục hải quan` (Tờ khai), `Trucking` kéo hàng về kho, và phí `Hạ xa` vỏ cont rỗng.