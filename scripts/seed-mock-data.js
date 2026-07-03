import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { reseedMasterData } from "./reseed-master-data.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = fileURLToPath(import.meta.url);
const dataDir = path.join(rootDir, "mock-data");
const screensDir = path.join(dataDir, "screens");
const now = "2026-06-12T00:00:00.000Z";

const dayFromToday = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
};

const base = (record) => ({
    create_at: now,
    update_at: now,
    delete_at: null,
    is_delete: false,
    ...record
});

const files = {
    "currencies": [
        base({ id: "cur_vnd", currency_code: "VND", currency_name: "Vietnam Dong", symbol: "VND", decimal_places: 0, is_active: true }),
        base({ id: "cur_usd", currency_code: "USD", currency_name: "US Dollar", symbol: "$", decimal_places: 2, is_active: true }),
        base({ id: "cur_cny", currency_code: "CNY", currency_name: "Chinese Yuan", symbol: "CNY", decimal_places: 2, is_active: true }),
        base({ id: "cur_eur", currency_code: "EUR", currency_name: "Euro", symbol: "EUR", decimal_places: 2, is_active: true }),
        base({ id: "cur_krw", currency_code: "KRW", currency_name: "South Korean Won", symbol: "KRW", decimal_places: 0, is_active: true })
    ],
    "incoterms": [
        base({ id: "inc_exw", incoterm_code: "EXW", incoterm_name: "Ex Works", incoterm_name_vn: "Giao tại xưởng", description: "Supplier makes goods available at origin.", is_active: true }),
        base({ id: "inc_fca", incoterm_code: "FCA", incoterm_name: "Free Carrier", incoterm_name_vn: "Giao cho người chuyên chở", description: "Supplier delivers goods to the carrier at a named place.", is_active: true }),
        base({ id: "inc_fob", incoterm_code: "FOB", incoterm_name: "Free On Board", incoterm_name_vn: "Giao lên tàu", description: "Supplier loads goods at port of loading.", is_active: true }),
        base({ id: "inc_cfr", incoterm_code: "CFR", incoterm_name: "Cost and Freight", incoterm_name_vn: "Tiền hàng và cước phí", description: "Supplier pays freight to destination port; buyer pays destination charges.", is_active: true }),
        base({ id: "inc_cif", incoterm_code: "CIF", incoterm_name: "Cost, Insurance and Freight", incoterm_name_vn: "Tiền hàng, bảo hiểm và cước phí", description: "Supplier pays freight and insurance to destination port.", is_active: true }),
        base({ id: "inc_ddp", incoterm_code: "DDP", incoterm_name: "Delivered Duty Paid", incoterm_name_vn: "Giao đã nộp thuế", description: "Seller delivers cleared goods to destination.", is_active: true })
    ],
    "transport-modes": [
        base({ id: "tm_sea", mode_code: "SEA", mode_name: "Sea Freight", mode_type: "SEA", description: "Ocean freight mode; FCL/LCL is carried by charge-code applicability.", is_active: true }),
        base({ id: "tm_air", mode_code: "AIR", mode_name: "Air Freight", mode_type: "AIR", description: "Air cargo mode.", is_active: true }),
        base({ id: "tm_road", mode_code: "ROAD", mode_name: "Road Freight", mode_type: "ROAD", description: "Road and trucking mode.", is_active: true }),
        base({ id: "tm_rail", mode_code: "RAIL", mode_name: "Rail Freight", mode_type: "RAIL", description: "Rail freight mode.", is_active: true })
    ],
    "suppliers": [
        base({ id: "sup_sdec", supplier_code: "SDEC", supplier_name: "SDEC Supplier", supplier_name_en: "SDEC Supplier", supplier_type: "OVERSEAS_SEA", supplier_roles: ["SUPPLIER"], country: "CN", city: "Shanghai", address: "Shanghai supplier warehouse", contact_person: "Li Wei", contact_email: "sales@sdec.example", contact_phone: "+86-21-1000-0001", payment_term: "TT_ADVANCE", default_currency_id: "cur_usd", default_incoterm_id: "inc_fob", lead_time_production_days: 25, bank_info: "Bank of China | 9988776601 | BKCHCNBJ", note: "Main SDEC spare parts supplier.", is_active: true }),
        base({ id: "sup_shanghai_oem", supplier_code: "SH-OEM", supplier_name: "Shanghai OEM Parts", supplier_name_en: "Shanghai OEM Parts", supplier_type: "OVERSEAS_AIR", supplier_roles: ["SUPPLIER"], country: "CN", city: "Shanghai", address: "Pudong industrial zone", contact_person: "Chen Ming", contact_email: "export@shoem.example", contact_phone: "+86-21-1000-0002", payment_term: "NET45", default_currency_id: "cur_usd", default_incoterm_id: "inc_exw", lead_time_production_days: 10, bank_info: "ICBC Shanghai | 9988776602 | ICBKCNBJ", note: "Urgent OEM parts, supports AIR shipment.", is_active: true }),
        base({ id: "sup_fds_forwarder", supplier_code: "FDS-FWD", supplier_name: "FDS Forwarder", supplier_name_en: "Fado Solution Co., Ltd", supplier_type: "DOMESTIC", supplier_roles: ["FORWARDER"], country: "VN", city: "Ho Chi Minh City", address: "FDS operations office", contact_person: "FDS Ops", contact_email: "ops@fds.example", contact_phone: "+84-24-1000-0003", payment_term: "NET30", default_currency_id: "cur_vnd", default_incoterm_id: "inc_fob", lead_time_production_days: 1, bank_info: "Vietcombank | 1234567890 | BFTVVNVX", note: "Legacy forwarder partner row retained for DO/Shipment references.", is_active: true }),
        base({ id: "sup_vn_trucking", supplier_code: "VN-TRK", supplier_name: "Vietnam Trucking Vendor", supplier_name_en: "Vietnam Trucking Vendor", supplier_type: "DOMESTIC", supplier_roles: ["TRUCKING_VENDOR"], country: "VN", city: "Ha Noi", address: "Northern dispatch center", contact_person: "Nguyen Van An", contact_email: "dispatch@vntrucking.example", contact_phone: "+84-24-1000-0004", payment_term: "NET30", default_currency_id: "cur_vnd", default_incoterm_id: "inc_exw", lead_time_production_days: 1, bank_info: "VietinBank | 2233445566 | ICBVVNVX", note: "Default domestic trucking vendor.", is_active: true }),
        base({ id: "sup_haiphong_trucking", supplier_code: "HP-TRK", supplier_name: "Hai Phong Port Trucking", supplier_name_en: "Hai Phong Port Trucking", supplier_type: "DOMESTIC", supplier_roles: ["TRUCKING_VENDOR"], country: "VN", city: "Hai Phong", address: "Hai Phong port area", contact_person: "Tran Thi Bich", contact_email: "dispatch@hptrucking.example", contact_phone: "+84-225-1000-0005", payment_term: "NET30", default_currency_id: "cur_vnd", default_incoterm_id: "inc_exw", lead_time_production_days: 1, bank_info: "BIDV | 3344556677 | BIDVVNVX", note: "Backup trucking vendor for port pickups.", is_active: true }),
        base({ id: "sup_north_trucking", supplier_code: "NT-TRK", supplier_name: "Northern Logistics Trucking", supplier_name_en: "Northern Logistics Trucking", supplier_type: "DOMESTIC", supplier_roles: ["TRUCKING_VENDOR"], country: "VN", city: "Bac Ninh", address: "Northern logistics depot", contact_person: "Le Van Cuong", contact_email: "ops@northlog.example", contact_phone: "+84-24-1000-0006", payment_term: "NET45", default_currency_id: "cur_vnd", default_incoterm_id: "inc_exw", lead_time_production_days: 1, bank_info: "MB Bank | 4455667788 | MSCBVNVX", note: "Regional trucking capacity for northern routes.", is_active: true })
    ],
    "forwarders": [
        base({ id: "fwd_001", forwarder_code: "FWD-001", forwarder_name: "Fado Solution Co., Ltd (FDS)", forwarder_type: "MULTI", country: "VN", contact_person: "Chau Thi My Anh (Ops Manager)", contact_email: "anhctm@fadosolution.com", contact_phone: "0964929642", is_primary: true, note: "Forwarder chinh - SOP FDS x KBI R7" }),
        base({ id: "fwd_002", forwarder_code: "FWD-002", forwarder_name: "DHL Global Forwarding Vietnam", forwarder_type: "AIR", country: "VN", contact_person: "(bo sung khi can)", contact_email: null, contact_phone: null, is_primary: false, note: "Backup AIR" })
    ],
    "carriers": [
        base({ id: "carr_001", carrier_code: "COSCO", carrier_name: "COSCO Shipping Lines", carrier_type: "SHIPPING_LINE", scac_iata_code: "COSU", service_route_note: "CN->VN (HCM/Haiphong) SEA", contact_booking: "(FDS dat cho)", contact_email: null, note: "Hang tau chinh tuyen TQ-VN" }),
        base({ id: "carr_002", carrier_code: "EVERGREEN", carrier_name: "Evergreen Marine Corp", carrier_type: "SHIPPING_LINE", scac_iata_code: "EGLV", service_route_note: "CN->VN / KR->VN SEA", contact_booking: "(FDS dat cho)", contact_email: null, note: null }),
        base({ id: "carr_003", carrier_code: "VN", carrier_name: "Vietnam Airlines Cargo", carrier_type: "AIRLINE", scac_iata_code: "VN", service_route_note: "CN->SGN / KR->SGN AIR", contact_booking: "(FDS dat cho)", contact_email: null, note: "Uu tien khi hang gap" })
    ],
    "supplier-transport-modes": [
        base({ id: "stm_001", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_sea", service_level: "STANDARD", is_active: true }),
        base({ id: "stm_002", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_rail", service_level: "STANDARD", is_active: true }),
        base({ id: "stm_003", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_air", service_level: "EXPRESS", is_active: true }),
        base({ id: "stm_004", supplier_id: "sup_vn_trucking", transport_mode_id: "tm_road", service_level: "LOCAL", is_active: true })
    ],
    "item-groups": [
        base({ id: "grp_engine", group_code: "ENGINE", group_name: "Engine Parts", is_active: true }),
        base({ id: "grp_electrical", group_code: "ELECTRICAL", group_name: "Electrical Control Parts", is_active: true }),
        base({ id: "grp_hydraulic", group_code: "HYDRAULIC", group_name: "Hydraulic Parts", is_active: true }),
        base({ id: "grp_consumables", group_code: "CONSUMABLE", group_name: "Consumables", is_active: true })
    ],
    "item-master": [
        base({ id: "item_001", item_code: "ENG-001", item_name: "Diesel Engine Assembly", item_name_en: "Diesel Engine Assembly", item_group_id: "grp_engine", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "84089090", country_of_origin: "CN", unit_price_usd: 8200, barcode: "8901234567801", note: null, is_active: true }),
        base({ id: "item_002", item_code: "FLT-001", item_name: "Oil Filter Element", item_name_en: "Oil Filter Element", item_group_id: "grp_consumables", item_category: "CCDC", item_type: "CONSUMABLE", base_uom: "PCS", purchase_uom: "CTN", uom_conversion: 50, hs_code: "84212399", country_of_origin: "CN", unit_price_usd: 12, barcode: "8901234567802", note: "50 pcs/carton", is_active: true }),
        base({ id: "item_003", item_code: "ELC-001", item_name: "Control Cabinet", item_name_en: "Control Cabinet", item_group_id: "grp_electrical", item_category: "BTP", item_type: "SEMI", base_uom: "SET", purchase_uom: "SET", uom_conversion: 1, hs_code: "85371099", country_of_origin: "CN", unit_price_usd: 1800, barcode: "8901234567803", note: null, is_active: true }),
        base({ id: "item_004", item_code: "HYD-001", item_name: "Hydraulic Pump", item_name_en: "Hydraulic Pump", item_group_id: "grp_hydraulic", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "84136090", country_of_origin: "CN", unit_price_usd: 1200, barcode: "8901234567804", note: null, is_active: true }),
        base({ id: "item_005", item_code: "ENG-TRB-002", item_name: "Turbocharger Cartridge", item_name_en: "Turbocharger Cartridge", item_group_id: "grp_engine", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "84148090", country_of_origin: "CN", unit_price_usd: 450, barcode: "8901234567805", note: null, is_active: true }),
        base({ id: "item_006", item_code: "ELC-ALT-001", item_name: "Alternator Assembly 24V", item_name_en: "Alternator Assembly 24V", item_group_id: "grp_electrical", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "85115099", country_of_origin: "CN", unit_price_usd: 1850, barcode: "8901234567806", note: null, is_active: true }),
        base({ id: "item_007", item_code: "ENG-INJ-004", item_name: "Fuel Injector Nozzle Set", item_name_en: "Fuel Injector Nozzle Set", item_group_id: "grp_engine", item_category: "BTP", item_type: "SEMI", base_uom: "SET", purchase_uom: "SET", uom_conversion: 1, hs_code: "84099979", country_of_origin: "CN", unit_price_usd: 38, barcode: "8901234567807", note: null, is_active: true }),
        base({ id: "item_008", item_code: "HYD-SEAL-010", item_name: "Hydraulic Seal Kit", item_name_en: "Hydraulic Seal Kit", item_group_id: "grp_hydraulic", item_category: "CCDC", item_type: "CONSUMABLE", base_uom: "KIT", purchase_uom: "CTN", uom_conversion: 20, hs_code: "40169390", country_of_origin: "CN", unit_price_usd: 4.5, barcode: "8901234567808", note: "20 kits/carton", is_active: true }),
        base({ id: "item_009", item_code: "ENG-RAD-003", item_name: "Radiator Core Assembly", item_name_en: "Radiator Core Assembly", item_group_id: "grp_engine", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "87089199", country_of_origin: "CN", unit_price_usd: 310, barcode: "8901234567809", note: null, is_active: true }),
        base({ id: "item_010", item_code: "ENG-GSK-011", item_name: "Engine Overhaul Gasket Kit", item_name_en: "Engine Overhaul Gasket Kit", item_group_id: "grp_engine", item_category: "CCDC", item_type: "CONSUMABLE", base_uom: "KIT", purchase_uom: "CTN", uom_conversion: 12, hs_code: "84841000", country_of_origin: "CN", unit_price_usd: 32, barcode: "8901234567810", note: "12 kits/carton", is_active: true }),
        base({ id: "item_011", item_code: "ELC-STR-002", item_name: "Starter Motor 24V", item_name_en: "Starter Motor 24V", item_group_id: "grp_electrical", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "85114099", country_of_origin: "CN", unit_price_usd: 680, barcode: "8901234567811", note: null, is_active: true }),
        base({ id: "item_012", item_code: "HYD-HOSE-020", item_name: "High Pressure Hydraulic Hose Assembly", item_name_en: "High Pressure Hydraulic Hose Assembly", item_group_id: "grp_hydraulic", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "40092190", country_of_origin: "CN", unit_price_usd: 18.5, barcode: "8901234567812", note: null, is_active: true }),
        base({ id: "item_013", item_code: "FLT-FWS-006", item_name: "Fuel Water Separator Filter", item_name_en: "Fuel Water Separator Filter", item_group_id: "grp_consumables", item_category: "CCDC", item_type: "CONSUMABLE", base_uom: "PCS", purchase_uom: "CTN", uom_conversion: 30, hs_code: "84212319", country_of_origin: "CN", unit_price_usd: 9.2, barcode: "8901234567813", note: "30 pcs/carton", is_active: true }),
        base({ id: "item_014", item_code: "ELC-ECU-005", item_name: "Engine ECU Controller Module", item_name_en: "Engine ECU Controller Module", item_group_id: "grp_electrical", item_category: "BTP", item_type: "SEMI", base_uom: "PCS", purchase_uom: "PCS", uom_conversion: 1, hs_code: "85371099", country_of_origin: "CN", unit_price_usd: 1450, barcode: "8901234567814", note: "Anti-static packaging", is_active: true })
    ],
    "item-customs-profiles": [
        base({ id: "icp_001", item_id: "item_001", hs_code: "84089090", import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_002", item_id: "item_002", hs_code: "84212399", import_duty_rate: 3, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_003", item_id: "item_003", hs_code: "85371099", import_duty_rate: 10, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "icp_004", item_id: "item_004", hs_code: "84136090", import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_005", item_id: "item_005", hs_code: "84148090", import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_006", item_id: "item_006", hs_code: "85115099", import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "icp_007", item_id: "item_007", hs_code: "84099979", import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_008", item_id: "item_008", hs_code: "40169390", import_duty_rate: 12, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "icp_009", item_id: "item_009", hs_code: "87089199", import_duty_rate: 15, vat_rate: 10, co_form: "E", preferential_tax_rate: 8 }),
        base({ id: "icp_010", item_id: "item_010", hs_code: "84841000", import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "icp_011", item_id: "item_011", hs_code: "85114099", import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "icp_012", item_id: "item_012", hs_code: "40092190", import_duty_rate: 12, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "icp_013", item_id: "item_013", hs_code: "84212319", import_duty_rate: 3, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "icp_014", item_id: "item_014", hs_code: "85371099", import_duty_rate: 10, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 })
    ],
    "task-templates": [
        base({ id: "tt_001", group_code: "GR1", group_name: "Báo giá & Xác nhận dịch vụ", task_name: "Tiếp nhận yêu cầu báo giá từ KBI", task_description: "KBI gửi yêu cầu qua email. FDS Sales kiểm tra đủ thông tin: loại hàng, HS code, trọng lượng/kích thước, tuyến đường, Incoterm yêu cầu, thời gian ETD dự kiến.", milestone_code: "PRE_SHIPMENT", sla_hours: 4, sla_text: null, department: "FDS_SALES", assignee_code: "S01", related_documents: "—", note: "Assignees: S01 / S02. SOP §4 — Giai đoạn Báo giá", sort_order: 1 }),
        base({ id: "tt_002", group_code: "GR1", group_name: "Báo giá & Xác nhận dịch vụ", task_name: "Chuẩn bị & gửi báo giá (Quotation)", task_description: "FDS Sales tính giá dựa trên route, mode, cargo type. Áp dụng nguyên tắc giá trucking §5 (36% cơ cấu xăng dầu). Gửi báo giá qua email chính thức. Giá cố định trừ các TH phát sinh theo SOP.", milestone_code: "PRE_SHIPMENT", sla_hours: null, sla_text: "Trước ngày hàng hàng đi 2 ngày", department: "FDS_SALES", assignee_code: "S01", related_documents: "Quotation email", note: "Assignees: S01 / S02 → S03 review. SOP §2, §5", sort_order: 2 }),
        base({ id: "tt_003", group_code: "GR1", group_name: "Báo giá & Xác nhận dịch vụ", task_name: "Xác nhận dịch vụ & bàn giao Ops", task_description: "KBI xác nhận báo giá qua email. FDS Sales làm Handover note cho FDS Ops, ghi rõ: thông tin hàng, route, ETD/ETA dự kiến, yêu cầu đặc biệt, NCC liên quan.", milestone_code: "PRE_SHIPMENT", sla_hours: null, sla_text: "Trước ngày hàng hàng đi 1 ngày", department: "FDS_SALES", assignee_code: "S01", related_documents: "Handover note, Booking request", note: "Assignees: S01/S02 → O03. SOP §3 — Bàn giao Ops", sort_order: 3 }),
        base({ id: "tt_004", group_code: "GR2", group_name: "Tạo & Quản lý PO", task_name: "Tạo PO trên hệ thống", task_description: "KBI tạo PO từ thông tin: supplier, item list, qty, unit price, currency, Incoterm, payment term, expected ETD. Gắn mode: SEA / AIR.", milestone_code: "PRE_SHIPMENT", sla_hours: 2, sla_text: null, department: "KBI_PURCHASING", assignee_code: null, related_documents: "PO document", note: "Assignees: (KBI – bổ sung sau). Phase 1 – PO module", sort_order: 4 }),
        base({ id: "tt_005", group_code: "GR2", group_name: "Tạo & Quản lý PO", task_name: "Gửi PO & theo dõi xác nhận NCC", task_description: "PO được gửi cho NCC qua email (kèm file PDF). Theo dõi phản hồi xác nhận từ NCC (Confirmed). Cập nhật trạng thái PO trên hệ thống.", milestone_code: "PRE_SHIPMENT", sla_hours: 48, sla_text: null, department: "KBI_PURCHASING", assignee_code: null, related_documents: "PO signed/confirmed by supplier", note: "Assignees: (KBI – bổ sung sau)", sort_order: 5 }),
        base({ id: "tt_006", group_code: "GR2", group_name: "Tạo & Quản lý PO", task_name: "Cập nhật trạng thái PO theo tiến độ NCC", task_description: "Theo dõi và cập nhật trạng thái PO: In-Production → Ready-to-Ship. Nếu NCC thông báo thay đổi ETD → cập nhật hệ thống và thông báo FDS Sales.", milestone_code: "PRE_SHIPMENT", sla_hours: 24, sla_text: null, department: "KBI_PURCHASING", assignee_code: null, related_documents: "NCC production update", note: "Assignees: (KBI – bổ sung sau)", sort_order: 6 }),
        base({ id: "tt_007", group_code: "GR3", group_name: "Booking & Chuẩn bị hàng", task_name: "Booking tàu/chuyến bay với Carrier", task_description: "FDS Ops tiến hành booking với Carrier (hãng tàu/bay) theo route và ETD yêu cầu. Xác nhận booking number, vessel name hoặc flight number.", milestone_code: "MS1_BOOKING_CONFIRMED", sla_hours: 24, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Booking confirmation", note: "Assignees: O01 / O02", sort_order: 7 }),
        base({ id: "tt_008", group_code: "GR3", group_name: "Booking & Chuẩn bị hàng", task_name: "Thông báo Cargo Ready & kiểm tra hàng tại origin", task_description: "NCC thông báo hàng ready tại điểm xuất. FDS Ops / Agent xác nhận cargo condition, số kiện, trọng lượng, thể tích. Chụp ảnh nếu cần.", milestone_code: "MS2_CARGO_READY", sla_hours: 8, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Cargo ready notice, Packing List draft", note: "Assignees: O01", sort_order: 8 }),
        base({ id: "tt_009", group_code: "GR4", group_name: "Vận chuyển & Tracking", task_name: "Xác nhận hàng đã lên tàu / máy bay (Loaded)", task_description: "FDS Ops xác nhận Onboard confirmation từ Carrier. Cập nhật ATD thực tế, tên vessel/flight, voyage/flight number lên hệ thống. Thông báo KBI.", milestone_code: "MS3_LOADED", sla_hours: 4, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Onboard B/L draft, Flight confirmation", note: "Assignees: O01", sort_order: 9 }),
        base({ id: "tt_010", group_code: "GR4", group_name: "Vận chuyển & Tracking", task_name: "Theo dõi in-transit & cập nhật ETA", task_description: "FDS Ops cập nhật trạng thái in-transit định kỳ (mỗi 2 ngày với SEA, hàng ngày với AIR). Cập nhật ETA nếu có thay đổi, thông báo KBI qua email.", milestone_code: "MS4_IN_TRANSIT", sla_hours: 48, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Tracking updates", note: "Assignees: O01 / O03. SOP §2 — thông báo qua email", sort_order: 10 }),
        base({ id: "tt_011", group_code: "GR4", group_name: "Vận chuyển & Tracking", task_name: "Gửi Draft B/L hoặc Draft AWB cho KBI", task_description: "FDS Ops nhận Draft B/L (SEA) hoặc Draft AWB (AIR) từ Carrier. Gửi cho KBI kiểm tra thông tin: shipper, consignee, notify party, description of goods, HS code, weight, measure.", milestone_code: "MS3_LOADED", sla_hours: 24, sla_text: null, department: "FDS_OPS", assignee_code: "O02", related_documents: "Draft B/L / Draft AWB", note: "Assignees: O02 / O01. SOP §3 — FDS Ops xử lý chứng từ", sort_order: 11 }),
        base({ id: "tt_012", group_code: "GR4", group_name: "Vận chuyển & Tracking", task_name: "KBI xác nhận / yêu cầu chỉnh sửa Draft B/L hoặc AWB", task_description: "KBI kiểm tra Draft B/L / AWB và phản hồi trong vòng SLA. Nếu có chỉnh sửa: ghi rõ nội dung cần sửa qua email, FDS Ops phối hợp Carrier sửa và gửi lại Draft để KBI re-confirm trước khi phát hành Final.", milestone_code: "MS5_ARRIVED_PORT", sla_hours: 24, sla_text: null, department: "KBI_PURCHASING", assignee_code: null, related_documents: "Draft B/L confirmation email", note: "Assignees: (KBI – bổ sung sau)", sort_order: 12 }),
        base({ id: "tt_013", group_code: "GR5", group_name: "Thông quan (Customs)", task_name: "Chuẩn bị hồ sơ thông quan", task_description: "FDS Ops (O02 – Custom & Docs Manager) tổng hợp bộ chứng từ: Commercial Invoice, Packing List, B/L gốc hoặc Telex Release, C/O (nếu có), Catalogue/datasheet nếu hải quan yêu cầu.", milestone_code: "MS5_ARRIVED_PORT", sla_hours: 8, sla_text: null, department: "FDS_OPS_CUSTOMS", assignee_code: "O02", related_documents: "Invoice, Packing List, B/L, C/O", note: "Assignees: O02", sort_order: 13 }),
        base({ id: "tt_014", group_code: "GR5", group_name: "Thông quan (Customs)", task_name: "Nộp tờ khai hải quan (Customs Declaration)", task_description: "FDS Ops nộp tờ khai VNACCS (thường qua đại lý hải quan). Ghi nhận số tờ khai, ngày nộp, loại luồng (xanh/vàng/đỏ). Cập nhật milestone lên hệ thống.", milestone_code: "MS6_CUSTOMS_SUBMITTED", sla_hours: 4, sla_text: null, department: "FDS_OPS_CUSTOMS", assignee_code: "O02", related_documents: "Customs declaration form", note: "Assignees: O02", sort_order: 14 }),
        base({ id: "tt_015", group_code: "GR5", group_name: "Thông quan (Customs)", task_name: "Theo dõi & hoàn tất thông quan", task_description: "Theo dõi kết quả phân luồng. Phối hợp xử lý nếu luồng vàng/đỏ (cung cấp thêm chứng từ, giải trình). Xác nhận Customs Cleared. Thông báo KBI và cập nhật hệ thống.", milestone_code: "MS7_CUSTOMS_CLEARED", sla_hours: 24, sla_text: null, department: "FDS_OPS_CUSTOMS", assignee_code: "O02", related_documents: "Customs release order", note: "Assignees: O02 / O03. Phát sinh chi phí: SOP §2", sort_order: 15 }),
        base({ id: "tt_016", group_code: "GR6", group_name: "Giao nhận & Kho", task_name: "Vận chuyển trucking từ cảng về kho KBI", task_description: "FDS Ops điều phối xe tải (trucking) lấy hàng tại cảng sau khi thông quan. Báo giá trucking theo nguyên tắc SOP §5 (update giá dầu ngày giao hàng nếu biến động). Xác nhận lịch giao với KBI.", milestone_code: "MS7_CUSTOMS_CLEARED", sla_hours: 8, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Delivery order, Truck booking", note: "Assignees: O01 / O03. SOP §5 — điều chỉnh giá xăng dầu", sort_order: 16 }),
        base({ id: "tt_017", group_code: "GR6", group_name: "Giao nhận & Kho", task_name: "Giao hàng tại cổng kho KBI (Gate-in)", task_description: "Xe tải đến kho KBI. Ghi nhận ATA thực tế. KBI kiểm đếm số kiện, kiểm tra tình trạng hàng hóa. Ký xác nhận giao nhận. Cập nhật milestone MS-8 lên hệ thống.", milestone_code: "MS8_DELIVERED_GATE", sla_hours: 2, sla_text: null, department: "FDS_OPS", assignee_code: "O01", related_documents: "Delivery receipt / Biên bản giao nhận", note: "Assignees: O01 + (KBI – bổ sung sau)", sort_order: 17 }),
        base({ id: "tt_018", group_code: "GR7", group_name: "Chứng từ hoàn chỉnh", task_name: "Thu thập & gửi bộ chứng từ gốc cho KBI", task_description: "FDS Ops tập hợp bộ chứng từ hoàn chỉnh sau khi hàng về kho: Original B/L hoặc Seaway Bill, Final Invoice, Packing List, C/O gốc, Customs Declaration cleared, Debit Note. Gửi cho KBI qua email hoặc courier.", milestone_code: "MS8_DELIVERED_GATE", sla_hours: 48, sla_text: null, department: "FDS_OPS", assignee_code: "O02", related_documents: "Full document set", note: "Assignees: O02 / O01. SOP §3 — FDS Ops hoàn tất hồ sơ", sort_order: 18 }),
        base({ id: "tt_019", group_code: "GR8", group_name: "Công nợ & Hóa đơn", task_name: "Phát hành Debit Note / Hóa đơn dịch vụ", task_description: "FDS Kế toán tổng hợp chi phí phát sinh theo lô hàng: cước biển/hàng không, phí local, phí thông quan, trucking. Phát hành Debit Note gửi KBI qua email kế toán.", milestone_code: "MS8_DELIVERED_GATE", sla_hours: 48, sla_text: null, department: "FDS_ACCOUNTING", assignee_code: "A01", related_documents: "Debit Note, Tax invoice", note: "Assignees: A01 / A02. SOP §3 — FDS Kế toán", sort_order: 19 }),
        base({ id: "tt_020", group_code: "GR8", group_name: "Công nợ & Hóa đơn", task_name: "Đối chiếu công nợ & xác nhận thanh toán", task_description: "KBI đối chiếu Debit Note với báo giá ban đầu. Nếu có chênh lệch: KBI email yêu cầu giải trình → FDS Kế toán / Sales phối hợp giải quyết. Xác nhận thanh toán và lưu hồ sơ.", milestone_code: null, sla_hours: 72, sla_text: null, department: "FDS_ACCOUNTING", assignee_code: "A02", related_documents: "Payment confirmation, Bank transfer slip", note: "Assignees: A02 + (KBI – bổ sung sau). SOP §3, §6", sort_order: 20 })
    ],
    "purchase-orders": [
        base({ id: "po_001", po_no: "PO-KBI-2026-001", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, 70% before shipment", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", expected_etd: "2026-07-03", expected_eta: "2026-07-10", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", notes: "Multi-item split LOT demo PO for drag/drop testing." }),
        base({ id: "po_002", po_no: "PO-KBI-2026-002", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_cfr", payment_term: "Net 30", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-08", expected_eta: "2026-07-16", origin_port: "Shanghai Port", destination_port: "Cat Lai Port", notes: "Ready cargo from Shanghai OEM." }),
        base({ id: "po_003", po_no: "PO-KBI-2026-003", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-06-24", expected_eta: "2026-07-02", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", notes: "Already shipped demo." }),
        base({ id: "po_004", po_no: "PO-KBI-2026-004", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 45", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-07-18", expected_eta: "2026-07-26", origin_port: "Pingxiang Border Gate", destination_port: "Huu Nghi Border Gate", notes: "Confirmed, pending LOT planning." }),
        base({ id: "po_005", po_no: "PO-KBI-2026-005", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, balance before ETD", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-22", expected_eta: "2026-07-30", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", notes: "Urgent turbocharger replenishment for service stock." }),
        base({ id: "po_006", po_no: "PO-KBI-2026-006", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 45 after invoice", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-08-04", expected_eta: "2026-08-05", origin_port: "Shanghai Pudong Airport", destination_port: "Tan Son Nhat Airport", notes: "Air freight for alternator shortage." }),
        base({ id: "po_007", po_no: "PO-KBI-2026-007", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_cfr", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-06-30", expected_eta: "2026-07-08", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", notes: "Fuel injector shipment already on water." }),
        base({ id: "po_008", po_no: "PO-KBI-2026-008", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "Net 30", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-14", expected_eta: "2026-07-22", origin_port: "Shanghai Port", destination_port: "Hai Phong Port", notes: "Hydraulic seal kits for monthly maintenance demand." }),
        base({ id: "po_009", po_no: "PO-KBI-2026-009", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_cfr", payment_term: "20% deposit, 80% against BL copy", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", expected_etd: "2026-08-12", expected_eta: "2026-08-14", origin_port: "Pingxiang Border Gate", destination_port: "Huu Nghi Border Gate", notes: "Cross-border trucking option for radiator assemblies." }),
        base({ id: "po_010", po_no: "PO-KBI-2026-010", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, balance before vessel departure", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-08-18", expected_eta: "2026-08-26", notes: "Gasket kits shipped by LCL for overhaul campaign." }),
        base({ id: "po_011", po_no: "PO-KBI-2026-011", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 30 after pickup confirmation", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-09-03", expected_eta: "2026-09-04", notes: "Starter motors moved by air due to urgent service demand." }),
        base({ id: "po_012", po_no: "PO-KBI-2026-012", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-09-08", expected_eta: "2026-09-18", notes: "Oversized hydraulic hose assemblies booked as breakbulk." }),
        base({ id: "po_013", po_no: "PO-KBI-2026-013", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_cfr", payment_term: "Net 45", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-08-05", expected_eta: "2026-08-13", notes: "Fuel water separator filters delivered to replenish maintenance stock." }),
        base({ id: "po_014", po_no: "PO-KBI-2026-014", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "50% deposit, 50% after QC release", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-08-28", expected_eta: "2026-08-29", notes: "ECU modules shipped by air with anti-static packaging." })
    ],
    "purchase-order-lines": [
        base({ id: "po_line_001", purchase_order_id: "po_001", item_id: "item_001", line_no: 1, qty_ordered: 100, unit: "PCS", unit_price: 8200, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_002", purchase_order_id: "po_002", item_id: "item_003", line_no: 1, qty_ordered: 25, unit: "SET", unit_price: 1800, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_003", purchase_order_id: "po_003", item_id: "item_004", line_no: 1, qty_ordered: 10, unit: "PCS", unit_price: 1200, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_004", purchase_order_id: "po_004", item_id: "item_002", line_no: 1, qty_ordered: 500, unit: "PCS", unit_price: 12, tax_rate: 10, discount_pct: 2, sort_order: 1 }),
        base({ id: "po_line_005", purchase_order_id: "po_005", item_id: "item_005", line_no: 1, qty_ordered: 12, unit: "PCS", unit_price: 450, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_006", purchase_order_id: "po_006", item_id: "item_006", line_no: 1, qty_ordered: 30, unit: "PCS", unit_price: 1850, tax_rate: 10, discount_pct: 1, sort_order: 1 }),
        base({ id: "po_line_007", purchase_order_id: "po_007", item_id: "item_007", line_no: 1, qty_ordered: 240, unit: "SET", unit_price: 38, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_008", purchase_order_id: "po_008", item_id: "item_008", line_no: 1, qty_ordered: 800, unit: "KIT", unit_price: 4.5, tax_rate: 10, discount_pct: 3, sort_order: 1 }),
        base({ id: "po_line_009", purchase_order_id: "po_009", item_id: "item_009", line_no: 1, qty_ordered: 18, unit: "PCS", unit_price: 310, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_010", purchase_order_id: "po_010", item_id: "item_010", line_no: 1, qty_ordered: 120, unit: "KIT", unit_price: 32, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_011", purchase_order_id: "po_011", item_id: "item_011", line_no: 1, qty_ordered: 45, unit: "PCS", unit_price: 680, tax_rate: 10, discount_pct: 1.5, sort_order: 1 }),
        base({ id: "po_line_012", purchase_order_id: "po_012", item_id: "item_012", line_no: 1, qty_ordered: 300, unit: "PCS", unit_price: 18.5, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_013", purchase_order_id: "po_013", item_id: "item_013", line_no: 1, qty_ordered: 600, unit: "PCS", unit_price: 9.2, tax_rate: 10, discount_pct: 2, sort_order: 1 }),
        base({ id: "po_line_014", purchase_order_id: "po_014", item_id: "item_014", line_no: 1, qty_ordered: 20, unit: "PCS", unit_price: 1450, tax_rate: 10, discount_pct: 0, sort_order: 1 }),
        base({ id: "po_line_015", purchase_order_id: "po_001", item_id: "item_005", line_no: 2, qty_ordered: 12, unit: "PCS", unit_price: 450, tax_rate: 10, discount_pct: 0, sort_order: 2 }),
        base({ id: "po_line_016", purchase_order_id: "po_001", item_id: "item_007", line_no: 3, qty_ordered: 240, unit: "SET", unit_price: 38, tax_rate: 10, discount_pct: 0, sort_order: 3 }),
        base({ id: "po_line_017", purchase_order_id: "po_001", item_id: "item_010", line_no: 4, qty_ordered: 80, unit: "KIT", unit_price: 32, tax_rate: 10, discount_pct: 0, sort_order: 4 })
    ],
    "purchase-order-confirmations": [
        base({ id: "poc_001", purchase_order_id: "po_001", confirmed_by: "Li Wei", confirmed_at: "2026-06-08T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-001", cargo_ready_date: "2026-07-01", is_full_shipment: false, allow_partial_shipment: true, note: "Partial shipment approved." }),
        base({ id: "poc_002", purchase_order_id: "po_002", confirmed_by: "Chen Ming", confirmed_at: "2026-06-09T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-002", cargo_ready_date: "2026-07-06", is_full_shipment: true, allow_partial_shipment: false, note: "Ready to ship." }),
        base({ id: "poc_003", purchase_order_id: "po_003", confirmed_by: "Li Wei", confirmed_at: "2026-06-01T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-003", cargo_ready_date: "2026-06-20", is_full_shipment: true, allow_partial_shipment: false, note: "Loaded on vessel." }),
        base({ id: "poc_004", purchase_order_id: "po_004", confirmed_by: "Chen Ming", confirmed_at: "2026-06-10T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-004", cargo_ready_date: "2026-07-15", is_full_shipment: true, allow_partial_shipment: true, note: "Pickup required from supplier." }),
        base({ id: "poc_005", purchase_order_id: "po_005", confirmed_by: "Wang Hao", confirmed_at: "2026-06-13T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-005", cargo_ready_date: "2026-07-20", is_full_shipment: true, allow_partial_shipment: false, note: "Packed in two wooden cases." }),
        base({ id: "poc_006", purchase_order_id: "po_006", confirmed_by: "Xu Lan", confirmed_at: "2026-06-14T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-006", cargo_ready_date: "2026-08-02", is_full_shipment: true, allow_partial_shipment: false, note: "Supplier requests morning pickup." }),
        base({ id: "poc_007", purchase_order_id: "po_007", confirmed_by: "Li Wei", confirmed_at: "2026-06-18T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-007", cargo_ready_date: "2026-06-28", is_full_shipment: true, allow_partial_shipment: false, note: "Commercial invoice and packing list received." }),
        base({ id: "poc_008", purchase_order_id: "po_008", confirmed_by: "Chen Ming", confirmed_at: "2026-06-16T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-008", cargo_ready_date: "2026-07-12", is_full_shipment: true, allow_partial_shipment: true, note: "Cartons palletized by item batch." }),
        base({ id: "poc_009", purchase_order_id: "po_009", confirmed_by: "Wang Hao", confirmed_at: "2026-06-17T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-009", cargo_ready_date: "2026-08-10", is_full_shipment: true, allow_partial_shipment: false, note: "Cross-border truck booking required two days before pickup." }),
        base({ id: "poc_010", purchase_order_id: "po_010", confirmed_by: "Li Wei", confirmed_at: "2026-07-15T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-010", cargo_ready_date: "2026-08-15", is_full_shipment: true, allow_partial_shipment: false, note: "Packed in 12 cartons on 2 pallets." }),
        base({ id: "poc_011", purchase_order_id: "po_011", confirmed_by: "Xu Lan", confirmed_at: "2026-07-18T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-011", cargo_ready_date: "2026-09-01", is_full_shipment: true, allow_partial_shipment: false, note: "Supplier requires EXW pickup from Pudong warehouse." }),
        base({ id: "poc_012", purchase_order_id: "po_012", confirmed_by: "Wang Hao", confirmed_at: "2026-07-20T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-012", cargo_ready_date: "2026-09-05", is_full_shipment: true, allow_partial_shipment: true, note: "Oversized bundles require flat rack handling if containerized." }),
        base({ id: "poc_013", purchase_order_id: "po_013", confirmed_by: "Chen Ming", confirmed_at: "2026-07-10T03:00:00.000Z", supplier_ref_no: "SHOEM-CFM-013", cargo_ready_date: "2026-08-02", is_full_shipment: true, allow_partial_shipment: false, note: "Filters packed 50 pcs per carton." }),
        base({ id: "poc_014", purchase_order_id: "po_014", confirmed_by: "Li Wei", confirmed_at: "2026-07-22T03:00:00.000Z", supplier_ref_no: "SDEC-CFM-014", cargo_ready_date: "2026-08-26", is_full_shipment: true, allow_partial_shipment: false, note: "Anti-static packing and QC photos provided." })
    ],
    "purchase-order-confirmation-lines": [
        base({ id: "pocl_001", purchase_order_confirmation_id: "poc_001", purchase_order_line_id: "po_line_001", confirmed_qty: 100, cargo_ready_date: "2026-07-01", note: "Split 60/40." }),
        base({ id: "pocl_002", purchase_order_confirmation_id: "poc_002", purchase_order_line_id: "po_line_002", confirmed_qty: 25, cargo_ready_date: "2026-07-06", note: null }),
        base({ id: "pocl_003", purchase_order_confirmation_id: "poc_003", purchase_order_line_id: "po_line_003", confirmed_qty: 10, cargo_ready_date: "2026-06-20", note: null }),
        base({ id: "pocl_004", purchase_order_confirmation_id: "poc_004", purchase_order_line_id: "po_line_004", confirmed_qty: 500, cargo_ready_date: "2026-07-15", note: null }),
        base({ id: "pocl_005", purchase_order_confirmation_id: "poc_005", purchase_order_line_id: "po_line_005", confirmed_qty: 12, cargo_ready_date: "2026-07-20", note: "Gross weight 480 kg." }),
        base({ id: "pocl_006", purchase_order_confirmation_id: "poc_006", purchase_order_line_id: "po_line_006", confirmed_qty: 30, cargo_ready_date: "2026-08-02", note: "Airworthy cartons." }),
        base({ id: "pocl_007", purchase_order_confirmation_id: "poc_007", purchase_order_line_id: "po_line_007", confirmed_qty: 240, cargo_ready_date: "2026-06-28", note: null }),
        base({ id: "pocl_008", purchase_order_confirmation_id: "poc_008", purchase_order_line_id: "po_line_008", confirmed_qty: 800, cargo_ready_date: "2026-07-12", note: "40 cartons, 2 pallets." }),
        base({ id: "pocl_009", purchase_order_confirmation_id: "poc_009", purchase_order_line_id: "po_line_009", confirmed_qty: 18, cargo_ready_date: "2026-08-10", note: "Oversized packaging." }),
        base({ id: "pocl_010", purchase_order_confirmation_id: "poc_010", purchase_order_line_id: "po_line_010", confirmed_qty: 120, cargo_ready_date: "2026-08-15", note: "Two pallets, stackable." }),
        base({ id: "pocl_011", purchase_order_confirmation_id: "poc_011", purchase_order_line_id: "po_line_011", confirmed_qty: 45, cargo_ready_date: "2026-09-01", note: "45 cartons, air cargo ready." }),
        base({ id: "pocl_012", purchase_order_confirmation_id: "poc_012", purchase_order_line_id: "po_line_012", confirmed_qty: 300, cargo_ready_date: "2026-09-05", note: "Bundled by hose length and pressure rating." }),
        base({ id: "pocl_013", purchase_order_confirmation_id: "poc_013", purchase_order_line_id: "po_line_013", confirmed_qty: 600, cargo_ready_date: "2026-08-02", note: "12 cartons, moisture-proof wrap." }),
        base({ id: "pocl_014", purchase_order_confirmation_id: "poc_014", purchase_order_line_id: "po_line_014", confirmed_qty: 20, cargo_ready_date: "2026-08-26", note: "High-value electronics, hand carry not required." }),
        base({ id: "pocl_015", purchase_order_confirmation_id: "poc_001", purchase_order_line_id: "po_line_015", confirmed_qty: 12, cargo_ready_date: "2026-07-01", note: "Turbocharger cartridges can be split by service urgency." }),
        base({ id: "pocl_016", purchase_order_confirmation_id: "poc_001", purchase_order_line_id: "po_line_016", confirmed_qty: 240, cargo_ready_date: "2026-07-01", note: "Injector nozzle sets packed in 24 cartons." }),
        base({ id: "pocl_017", purchase_order_confirmation_id: "poc_001", purchase_order_line_id: "po_line_017", confirmed_qty: 80, cargo_ready_date: "2026-07-02", note: "Gasket kits available one day after main engine line." })
    ],
    "po-lots": [
        base({ id: "lot_001", purchase_order_id: "po_001", lot_no: "LOT-001", lot_name: "Priority Service Lot", status: "PLANNED", planned_cargo_ready_date: "2026-07-01", planned_etd: "2026-07-03", planned_eta: "2026-07-10", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", sort_order: 1, notes: "Mixed urgent service parts for drag/drop demo." }),
        base({ id: "lot_002", purchase_order_id: "po_001", lot_no: "LOT-002", lot_name: "Balance Replenishment Lot", status: "PLANNED", planned_cargo_ready_date: "2026-07-02", planned_etd: "2026-07-05", planned_eta: "2026-07-12", origin_port: "Fuzhou Port", destination_port: "Hai Phong Port", sort_order: 2, notes: "Balance stock and later-ready kits for split demo." }),
        base({ id: "lot_003", purchase_order_id: "po_002", lot_no: "LOT-003", lot_name: "Shanghai OEM Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-06", planned_etd: "2026-07-08", planned_eta: "2026-07-16", origin_port: "Shanghai Port", destination_port: "Cat Lai Port", sort_order: 1, notes: null }),
        base({ id: "lot_004", purchase_order_id: "po_003", lot_no: "LOT-004", lot_name: "Shipped Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-06-20", planned_etd: "2026-06-24", planned_eta: "2026-07-02", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", sort_order: 1, notes: null }),
        base({ id: "lot_010", purchase_order_id: "po_004", lot_no: "LOT-010", lot_name: "Filter Domestic Transfer Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-15", planned_etd: "2026-07-20", planned_eta: "2026-07-21", origin_port: "Pingxiang Border Gate", destination_port: "Huu Nghi Border Gate", sort_order: 1, notes: "Partial release for urgent maintenance stock." }),
        base({ id: "lot_005", purchase_order_id: "po_005", lot_no: "LOT-005", lot_name: "Turbocharger FCL Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-20", planned_etd: "2026-07-22", planned_eta: "2026-07-30", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", sort_order: 1, notes: "Two crates, keep dry." }),
        base({ id: "lot_006", purchase_order_id: "po_006", lot_no: "LOT-006", lot_name: "Alternator Air Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-04", planned_eta: "2026-08-05", origin_port: "Shanghai Pudong Airport", destination_port: "Tan Son Nhat Airport", sort_order: 1, notes: "Air freight due to low inventory." }),
        base({ id: "lot_007", purchase_order_id: "po_007", lot_no: "LOT-007", lot_name: "Injector LCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-06-28", planned_etd: "2026-06-30", planned_eta: "2026-07-08", origin_port: "Fuzhou Port", destination_port: "Cat Lai Port", sort_order: 1, notes: "Consolidated LCL cargo." }),
        base({ id: "lot_008", purchase_order_id: "po_008", lot_no: "LOT-008", lot_name: "Seal Kit FCL Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-12", planned_etd: "2026-07-14", planned_eta: "2026-07-22", origin_port: "Shanghai Port", destination_port: "Hai Phong Port", sort_order: 1, notes: "Palletized cartons." }),
        base({ id: "lot_009", purchase_order_id: "po_009", lot_no: "LOT-009", lot_name: "Radiator Cross Border Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-10", planned_etd: "2026-08-12", planned_eta: "2026-08-14", origin_port: "Pingxiang Border Gate", destination_port: "Huu Nghi Border Gate", sort_order: 1, notes: "Road transport through border gate." }),
        base({ id: "lot_011", purchase_order_id: "po_010", lot_no: "LOT-011", lot_name: "Gasket Kit LCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-15", planned_etd: "2026-08-18", planned_eta: "2026-08-26", sort_order: 1, notes: "Two pallet LCL release." }),
        base({ id: "lot_012", purchase_order_id: "po_011", lot_no: "LOT-012", lot_name: "Starter Motor Air Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-09-01", planned_etd: "2026-09-03", planned_eta: "2026-09-04", sort_order: 1, notes: "Urgent air freight lot." }),
        base({ id: "lot_013", purchase_order_id: "po_012", lot_no: "LOT-013", lot_name: "Hydraulic Hose Breakbulk Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-09-05", planned_etd: "2026-09-08", planned_eta: "2026-09-18", sort_order: 1, notes: "Oversized bundles need breakbulk handling." }),
        base({ id: "lot_014", purchase_order_id: "po_013", lot_no: "LOT-014", lot_name: "Separator Filter FCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-05", planned_eta: "2026-08-13", sort_order: 1, notes: "Fast moving consumable restock." }),
        base({ id: "lot_015", purchase_order_id: "po_014", lot_no: "LOT-015", lot_name: "ECU Air Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-26", planned_etd: "2026-08-28", planned_eta: "2026-08-29", sort_order: 1, notes: "High-value electronics lot." })
    ],
    "po-lot-lines": [
        base({ id: "lot_line_001", po_lot_id: "lot_001", purchase_order_line_id: "po_line_001", item_id: "item_001", qty_lotted: 60, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_002", po_lot_id: "lot_002", purchase_order_line_id: "po_line_001", item_id: "item_001", qty_lotted: 40, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_003", po_lot_id: "lot_003", purchase_order_line_id: "po_line_002", item_id: "item_003", qty_lotted: 25, unit: "SET", sort_order: 1 }),
        base({ id: "lot_line_004", po_lot_id: "lot_004", purchase_order_line_id: "po_line_003", item_id: "item_004", qty_lotted: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_010", po_lot_id: "lot_010", purchase_order_line_id: "po_line_004", item_id: "item_002", qty_lotted: 100, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_005", po_lot_id: "lot_005", purchase_order_line_id: "po_line_005", item_id: "item_005", qty_lotted: 12, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_006", po_lot_id: "lot_006", purchase_order_line_id: "po_line_006", item_id: "item_006", qty_lotted: 30, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_007", po_lot_id: "lot_007", purchase_order_line_id: "po_line_007", item_id: "item_007", qty_lotted: 240, unit: "SET", sort_order: 1 }),
        base({ id: "lot_line_008", po_lot_id: "lot_008", purchase_order_line_id: "po_line_008", item_id: "item_008", qty_lotted: 800, unit: "KIT", sort_order: 1 }),
        base({ id: "lot_line_009", po_lot_id: "lot_009", purchase_order_line_id: "po_line_009", item_id: "item_009", qty_lotted: 18, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_011", po_lot_id: "lot_011", purchase_order_line_id: "po_line_010", item_id: "item_010", qty_lotted: 120, unit: "KIT", sort_order: 1 }),
        base({ id: "lot_line_012", po_lot_id: "lot_012", purchase_order_line_id: "po_line_011", item_id: "item_011", qty_lotted: 45, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_013", po_lot_id: "lot_013", purchase_order_line_id: "po_line_012", item_id: "item_012", qty_lotted: 300, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_014", po_lot_id: "lot_014", purchase_order_line_id: "po_line_013", item_id: "item_013", qty_lotted: 600, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_015", po_lot_id: "lot_015", purchase_order_line_id: "po_line_014", item_id: "item_014", qty_lotted: 20, unit: "PCS", sort_order: 1 }),
        base({ id: "lot_line_016", po_lot_id: "lot_001", purchase_order_line_id: "po_line_015", item_id: "item_005", qty_lotted: 6, unit: "PCS", sort_order: 2 }),
        base({ id: "lot_line_017", po_lot_id: "lot_002", purchase_order_line_id: "po_line_015", item_id: "item_005", qty_lotted: 6, unit: "PCS", sort_order: 2 }),
        base({ id: "lot_line_018", po_lot_id: "lot_001", purchase_order_line_id: "po_line_016", item_id: "item_007", qty_lotted: 240, unit: "SET", sort_order: 3 }),
        base({ id: "lot_line_019", po_lot_id: "lot_002", purchase_order_line_id: "po_line_017", item_id: "item_010", qty_lotted: 80, unit: "KIT", sort_order: 3 })
    ],
    "delivery-orders": [
        base({ id: "do_001", delivery_order_no: "DO-KBI-2026-001", purchase_order_id: "po_002", transport_mode_id: "tm_sea_fcl", status: "ASSIGNED_TO_SHIPMENT", requested_pickup_date: "2026-07-06", planned_cargo_ready_date: "2026-07-06", planned_etd: "2026-07-08", planned_eta: "2026-07-16", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Booked with forwarder (shipment shp_001)." }),
        base({ id: "do_002", delivery_order_no: "DO-KBI-2026-002", purchase_order_id: "po_003", transport_mode_id: "tm_sea_lcl", status: "IN_TRANSIT", requested_pickup_date: "2026-06-20", planned_cargo_ready_date: "2026-06-20", planned_etd: "2026-06-24", planned_eta: "2026-07-02", origin_address: "Shanghai CFS", destination_address: "Hai Phong Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Already shipped." }),
        base({ id: "do_003", delivery_order_no: "DO-KBI-2026-003", purchase_order_id: "po_001", transport_mode_id: "tm_sea_fcl", status: "CANCELLED", requested_pickup_date: "2026-06-30", planned_cargo_ready_date: "2026-06-30", planned_etd: "2026-07-03", planned_eta: "2026-07-10", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Historical cancelled DO.", is_delete: true, delete_at: "2026-06-11T00:00:00.000Z" }),
        base({ id: "do_004", delivery_order_no: "DO-KBI-2026-004", purchase_order_id: "po_004", transport_mode_id: "tm_trucking", status: "WAREHOUSE_PENDING", requested_pickup_date: "2026-07-15", planned_cargo_ready_date: "2026-07-15", planned_etd: "2026-07-20", planned_eta: "2026-07-21", origin_address: "Shanghai Supplier Warehouse", destination_address: "Huu Nghi Border Gate", warehouse_name: "Kim Binh Main Warehouse", notes: "Partial oil filter release assigned to domestic trucking." }),
        base({ id: "do_005", delivery_order_no: "DO-KBI-2026-005", purchase_order_id: "po_005", transport_mode_id: "tm_sea_fcl", status: "ASSIGNED_TO_SHIPMENT", requested_pickup_date: "2026-07-20", planned_cargo_ready_date: "2026-07-20", planned_etd: "2026-07-22", planned_eta: "2026-07-30", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Turbocharger pickup booked with forwarder." }),
        base({ id: "do_006", delivery_order_no: "DO-KBI-2026-006", purchase_order_id: "po_006", transport_mode_id: "tm_air", status: "IN_TRANSIT", requested_pickup_date: "2026-08-02", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-04", planned_eta: "2026-08-05", origin_address: "Shanghai Pudong Airport", destination_address: "Tan Son Nhat Airport", warehouse_name: "Kim Binh Main Warehouse", notes: "Air cargo pickup confirmed from Shanghai warehouse." }),
        base({ id: "do_007", delivery_order_no: "DO-KBI-2026-007", purchase_order_id: "po_007", transport_mode_id: "tm_sea_lcl", status: "ARRIVED_PORT", requested_pickup_date: "2026-06-28", planned_cargo_ready_date: "2026-06-28", planned_etd: "2026-06-30", planned_eta: "2026-07-08", origin_address: "Ningbo CFS", destination_address: "Hai Phong Port", warehouse_name: "Kim Binh Main Warehouse", notes: "LCL cargo arrived and waits for customs file." }),
        base({ id: "do_008", delivery_order_no: "DO-KBI-2026-008", purchase_order_id: "po_008", transport_mode_id: "tm_sea_fcl", status: "CUSTOMS_PROCESSING", requested_pickup_date: "2026-07-12", planned_cargo_ready_date: "2026-07-12", planned_etd: "2026-07-14", planned_eta: "2026-07-22", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Seal kits collected for FCL consolidation." }),
        base({ id: "do_009", delivery_order_no: "DO-KBI-2026-009", purchase_order_id: "po_009", transport_mode_id: "tm_trucking", status: "WAREHOUSE_PENDING", requested_pickup_date: "2026-08-10", planned_cargo_ready_date: "2026-08-10", planned_etd: "2026-08-12", planned_eta: "2026-08-14", origin_address: "Pingxiang Border", destination_address: "Huu Nghi Border Gate", warehouse_name: "Kim Binh Main Warehouse", notes: "Cross-border truck has departed supplier." }),
        base({ id: "do_010", delivery_order_no: "DO-KBI-2026-010", purchase_order_id: "po_010", transport_mode_id: "tm_sea_lcl", status: "CUSTOMS_CLEARED", requested_pickup_date: "2026-08-15", planned_cargo_ready_date: "2026-08-15", planned_etd: "2026-08-18", planned_eta: "2026-08-26", origin_address: "Shanghai CFS", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Gasket kit LCL cargo cleared and waits for local delivery." }),
        base({ id: "do_011", delivery_order_no: "DO-KBI-2026-011", purchase_order_id: "po_011", transport_mode_id: "tm_air", status: "ASSIGNED_TO_SHIPMENT", requested_pickup_date: "2026-09-01", planned_cargo_ready_date: "2026-09-01", planned_etd: "2026-09-03", planned_eta: "2026-09-04", origin_address: "Shanghai Pudong Airport", destination_address: "Tan Son Nhat Airport", warehouse_name: "Kim Binh Main Warehouse", notes: "Starter motors assigned to urgent air shipment." }),
        base({ id: "do_012", delivery_order_no: "DO-KBI-2026-012", purchase_order_id: "po_012", transport_mode_id: "tm_sea_breakbulk", status: "ASSIGNED_TO_SHIPMENT", requested_pickup_date: "2026-09-05", planned_cargo_ready_date: "2026-09-05", planned_etd: "2026-09-08", planned_eta: "2026-09-18", origin_address: "Shanghai Breakbulk Terminal", destination_address: "Hai Phong Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Breakbulk pickup requires truck with side loading." }),
        base({ id: "do_013", delivery_order_no: "DO-KBI-2026-013", purchase_order_id: "po_013", transport_mode_id: "tm_sea_fcl", status: "DELIVERED", requested_pickup_date: "2026-08-02", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-05", planned_eta: "2026-08-13", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Filter cartons delivered under supplier CIF booking." }),
        base({ id: "do_014", delivery_order_no: "DO-KBI-2026-014", purchase_order_id: "po_014", transport_mode_id: "tm_air", status: "CLOSED", requested_pickup_date: "2026-08-26", planned_cargo_ready_date: "2026-08-26", planned_etd: "2026-08-28", planned_eta: "2026-08-29", origin_address: "Shanghai Pudong Airport", destination_address: "Tan Son Nhat Airport", warehouse_name: "Kim Binh Main Warehouse", notes: "ECU modules delivered by air with anti-static packaging." })
    ],
    "logistics-tasks": [
        base({ task_id: "task_001", id: "task_001", do_number: "DO-KBI-2026-001", hbl_number: null, request_code: "DO-KBI-2026-001", po_number: "PO-KBI-2026-002", production_contract_number: "KBI-CN-2026-002", task_name: "Bao gia cuoc FCL", role: "PIC Manager", assignee: { user_id: "u_ops_01", name: "Mai Anh", department: "Logistics" }, progress: 40, created_at: "2026-06-08T02:00:00.000Z", assigned_at: "2026-06-08T03:00:00.000Z", completed_at: null, status: "IN_PROGRESS", priority: "HIGH", due_date: "2026-06-12", notes: "Bao gia can chot de tao shipment.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_002", id: "task_002", do_number: "DO-KBI-2026-005", hbl_number: null, request_code: "DO-KBI-2026-005", po_number: "PO-KBI-2026-005", production_contract_number: "KBI-CN-2026-005", task_name: "Booking tau Shanghai - Hai Phong", role: "Port Officer", assignee: { user_id: "u_port_01", name: "Hoang Nam", department: "Port Ops" }, progress: 25, created_at: "2026-06-10T02:00:00.000Z", assigned_at: "2026-06-10T03:00:00.000Z", completed_at: null, status: "BLOCKED", priority: "URGENT", due_date: "2026-06-11", notes: "Booking bi giu do thieu SI.", is_required_for_do_closure: true, blocked_reason: "Waiting supplier shipping instruction." }),
        base({ task_id: "task_003", id: "task_003", do_number: "DO-KBI-2026-006", hbl_number: null, request_code: "DO-KBI-2026-006", po_number: "PO-KBI-2026-006", production_contract_number: "KBI-CN-2026-006", task_name: "Xu ly chung tu air freight", role: "Sale Staff", assignee: { user_id: "u_sale_01", name: "Thu Ha", department: "Sales" }, progress: 65, created_at: "2026-06-11T02:00:00.000Z", assigned_at: "2026-06-11T03:00:00.000Z", completed_at: null, status: "WAITING", priority: "HIGH", due_date: "2026-06-12", notes: "Chung tu invoice packing list chua dong bo.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_004", id: "task_004", do_number: "DO-KBI-2026-007", hbl_number: "HBL-KBI-007", request_code: "DO-KBI-2026-007", po_number: "PO-KBI-2026-007", production_contract_number: "KBI-CN-2026-007", task_name: "Mo to khai hai quan", role: "Customs Officer", assignee: { user_id: "u_cus_01", name: "Quoc Bao", department: "Customs" }, progress: 50, created_at: "2026-06-09T02:00:00.000Z", assigned_at: "2026-06-09T03:00:00.000Z", completed_at: null, status: "IN_PROGRESS", priority: "HIGH", due_date: "2026-06-12", notes: "To khai can mapping HS code voi packing list.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_005", id: "task_005", do_number: "DO-KBI-2026-009", hbl_number: "HBL-KBI-009", request_code: "DO-KBI-2026-009", po_number: "PO-KBI-2026-009", production_contract_number: "KBI-CN-2026-009", task_name: "Giao hang ve kho Kim Binh", role: "Warehouse Staff", assignee: { user_id: "u_wh_01", name: "Minh Duc", department: "Warehouse" }, progress: 10, created_at: "2026-06-07T02:00:00.000Z", assigned_at: "2026-06-07T03:00:00.000Z", completed_at: null, status: "TODO", priority: "URGENT", due_date: "2026-06-10", notes: "Giao hang tre do xe chua duoc dieu phoi.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_006", id: "task_006", do_number: "DO-KBI-2026-010", hbl_number: "HBL-KBI-010", request_code: "DO-KBI-2026-010", po_number: "PO-KBI-2026-010", production_contract_number: "KBI-CN-2026-010", task_name: "Kiem tra phi local charge", role: "Finance Officer", assignee: { user_id: "u_fin_01", name: "Lan Phuong", department: "Finance" }, progress: 100, created_at: "2026-06-05T02:00:00.000Z", assigned_at: "2026-06-05T03:00:00.000Z", completed_at: "2026-06-12T08:00:00.000Z", status: "COMPLETED", priority: "MEDIUM", due_date: "2026-06-12", notes: "Finance confirmed local charge.", is_required_for_do_closure: false, blocked_reason: null }),
        base({ task_id: "task_007", id: "task_007", do_number: "DO-KBI-2026-011", hbl_number: null, request_code: "DO-KBI-2026-011", po_number: "PO-KBI-2026-011", production_contract_number: "KBI-CN-2026-011", task_name: "Bao gia air freight khan", role: "PIC Manager", assignee: { user_id: "u_ops_02", name: "Thanh Tung", department: "Logistics" }, progress: 15, created_at: "2026-06-12T02:00:00.000Z", assigned_at: "2026-06-12T03:00:00.000Z", completed_at: null, status: "TODO", priority: "URGENT", due_date: "2026-06-13", notes: "Bao gia can trong ngay de giu slot bay.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_008", id: "task_008", do_number: "DO-KBI-2026-012", hbl_number: null, request_code: "DO-KBI-2026-012", po_number: "PO-KBI-2026-012", production_contract_number: "KBI-CN-2026-012", task_name: "Booking breakbulk", role: "Port Officer", assignee: { user_id: "u_port_02", name: "Gia Huy", department: "Port Ops" }, progress: 75, created_at: "2026-06-10T02:00:00.000Z", assigned_at: "2026-06-10T03:00:00.000Z", completed_at: null, status: "IN_PROGRESS", priority: "MEDIUM", due_date: "2026-06-18", notes: "Booking dang cho hang tau xac nhan lich.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_009", id: "task_009", do_number: "DO-KBI-2026-013", hbl_number: "HBL-KBI-013", request_code: "DO-KBI-2026-013", po_number: "PO-KBI-2026-013", production_contract_number: "KBI-CN-2026-013", task_name: "Xu ly chung tu CIF", role: "Sale Staff", assignee: { user_id: "u_sale_02", name: "Bao Ngoc", department: "Sales" }, progress: 100, created_at: "2026-06-06T02:00:00.000Z", assigned_at: "2026-06-06T03:00:00.000Z", completed_at: "2026-06-09T08:00:00.000Z", status: "COMPLETED", priority: "LOW", due_date: "2026-06-09", notes: "Chung tu CIF da hoan tat.", is_required_for_do_closure: true, blocked_reason: null }),
        base({ task_id: "task_010", id: "task_010", do_number: "DO-KBI-2026-014", hbl_number: "HBL-KBI-014", request_code: "DO-KBI-2026-014", po_number: "PO-KBI-2026-014", production_contract_number: "KBI-CN-2026-014", task_name: "Giao hang ECU ve kho", role: "Warehouse Staff", assignee: { user_id: "u_wh_02", name: "Nguyen Khoa", department: "Warehouse" }, progress: 35, created_at: "2026-06-12T02:00:00.000Z", assigned_at: "2026-06-12T03:00:00.000Z", completed_at: null, status: "IN_PROGRESS", priority: "HIGH", due_date: "2026-06-16", notes: "Giao hang dang cho lich xe noi dia.", is_required_for_do_closure: true, blocked_reason: null })
    ],
    "delivery-order-lots": [
        base({ id: "do_lot_001", delivery_order_id: "do_001", po_lot_id: "lot_003", sort_order: 1 }),
        base({ id: "do_lot_002", delivery_order_id: "do_002", po_lot_id: "lot_004", sort_order: 1 }),
        base({ id: "do_lot_003", delivery_order_id: "do_003", po_lot_id: "lot_001", sort_order: 1, is_delete: true, delete_at: "2026-06-11T00:00:00.000Z" }),
        base({ id: "do_lot_004", delivery_order_id: "do_004", po_lot_id: "lot_010", sort_order: 1 }),
        base({ id: "do_lot_005", delivery_order_id: "do_005", po_lot_id: "lot_005", sort_order: 1 }),
        base({ id: "do_lot_006", delivery_order_id: "do_006", po_lot_id: "lot_006", sort_order: 1 }),
        base({ id: "do_lot_007", delivery_order_id: "do_007", po_lot_id: "lot_007", sort_order: 1 }),
        base({ id: "do_lot_008", delivery_order_id: "do_008", po_lot_id: "lot_008", sort_order: 1 }),
        base({ id: "do_lot_009", delivery_order_id: "do_009", po_lot_id: "lot_009", sort_order: 1 }),
        base({ id: "do_lot_010", delivery_order_id: "do_010", po_lot_id: "lot_011", sort_order: 1 }),
        base({ id: "do_lot_011", delivery_order_id: "do_011", po_lot_id: "lot_012", sort_order: 1 }),
        base({ id: "do_lot_012", delivery_order_id: "do_012", po_lot_id: "lot_013", sort_order: 1 }),
        base({ id: "do_lot_013", delivery_order_id: "do_013", po_lot_id: "lot_014", sort_order: 1 }),
        base({ id: "do_lot_014", delivery_order_id: "do_014", po_lot_id: "lot_015", sort_order: 1 })
    ],
    "delivery-order-lines": [
        base({ id: "do_line_001", delivery_order_id: "do_001", po_lot_id: "lot_003", purchase_order_line_id: "po_line_002", item_id: "item_003", qty: 25, unit: "SET", sort_order: 1 }),
        base({ id: "do_line_002", delivery_order_id: "do_002", po_lot_id: "lot_004", purchase_order_line_id: "po_line_003", item_id: "item_004", qty: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_003", delivery_order_id: "do_003", po_lot_id: "lot_001", purchase_order_line_id: "po_line_001", item_id: "item_001", qty: 60, unit: "PCS", sort_order: 1, is_delete: true, delete_at: "2026-06-11T00:00:00.000Z" }),
        base({ id: "do_line_004", delivery_order_id: "do_004", po_lot_id: "lot_010", purchase_order_line_id: "po_line_004", item_id: "item_002", qty: 100, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_005", delivery_order_id: "do_005", po_lot_id: "lot_005", purchase_order_line_id: "po_line_005", item_id: "item_005", qty: 12, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_006", delivery_order_id: "do_006", po_lot_id: "lot_006", purchase_order_line_id: "po_line_006", item_id: "item_006", qty: 30, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_007", delivery_order_id: "do_007", po_lot_id: "lot_007", purchase_order_line_id: "po_line_007", item_id: "item_007", qty: 240, unit: "SET", sort_order: 1 }),
        base({ id: "do_line_008", delivery_order_id: "do_008", po_lot_id: "lot_008", purchase_order_line_id: "po_line_008", item_id: "item_008", qty: 800, unit: "KIT", sort_order: 1 }),
        base({ id: "do_line_009", delivery_order_id: "do_009", po_lot_id: "lot_009", purchase_order_line_id: "po_line_009", item_id: "item_009", qty: 18, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_010", delivery_order_id: "do_010", po_lot_id: "lot_011", purchase_order_line_id: "po_line_010", item_id: "item_010", qty: 120, unit: "KIT", sort_order: 1 }),
        base({ id: "do_line_011", delivery_order_id: "do_011", po_lot_id: "lot_012", purchase_order_line_id: "po_line_011", item_id: "item_011", qty: 45, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_012", delivery_order_id: "do_012", po_lot_id: "lot_013", purchase_order_line_id: "po_line_012", item_id: "item_012", qty: 300, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_013", delivery_order_id: "do_013", po_lot_id: "lot_014", purchase_order_line_id: "po_line_013", item_id: "item_013", qty: 600, unit: "PCS", sort_order: 1 }),
        base({ id: "do_line_014", delivery_order_id: "do_014", po_lot_id: "lot_015", purchase_order_line_id: "po_line_014", item_id: "item_014", qty: 20, unit: "PCS", sort_order: 1 })
    ],
    "quotations": [
        base({ id: "qt_001", quotation_group_id: "qg_do_001", quotation_no: "QT-KBI-2026-001", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_001", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-10T02:00:00.000Z", valid_until: dayFromToday(30), note: "Final freight quote." }),
        base({ id: "qt_002", quotation_group_id: "qg_do_002", quotation_no: "QT-KBI-2026-002", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_002", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_LCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-18T02:00:00.000Z", valid_until: dayFromToday(3), note: "Shipped DO quote." }),
        base({ id: "qt_003", quotation_group_id: "qg_shp_001", quotation_no: "QT-KBI-2026-003", version: 1, ref_type: "SHIPMENT", ref_id: "shp_001", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "LOCAL_CHARGE", incoterm_code: "CIF", mode: "SEA_FCL", currency_code: "VND", exchange_rate: 1, status: "DRAFT", is_final: false, quoted_at: "2026-06-20T02:00:00.000Z", valid_until: dayFromToday(0), note: "Local charge draft." }),
        base({ id: "qt_004", quotation_group_id: "qg_dto_001", quotation_no: "QT-KBI-2026-004", version: 1, ref_type: "DTO", ref_id: "dto_001", customer_ref: "KBI", supplier_id: "sup_vn_trucking", quotation_type: "TRUCKING", incoterm_code: "EXW", mode: null, currency_code: "VND", exchange_rate: 1, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-21T02:00:00.000Z", valid_until: dayFromToday(25), note: "Trucking quote." }),
        base({ id: "qt_005", quotation_group_id: "qg_do_005", quotation_no: "QT-KBI-2026-005", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_005", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-22T02:00:00.000Z", valid_until: dayFromToday(-4), note: "FCL Shanghai to Hai Phong, all-in ocean charge." }),
        base({ id: "qt_006", quotation_group_id: "qg_do_006", quotation_no: "QT-KBI-2026-006", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_006", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "EXW", mode: "AIR", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-23T02:00:00.000Z", valid_until: dayFromToday(28), note: "Air freight based on 210 kg chargeable weight." }),
        base({ id: "qt_007", quotation_group_id: "qg_do_007", quotation_no: "QT-KBI-2026-007", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_007", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "CFR", mode: "SEA_LCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-19T02:00:00.000Z", valid_until: dayFromToday(22), note: "LCL charge including CFS origin handling." }),
        base({ id: "qt_008", quotation_group_id: "qg_do_008", quotation_no: "QT-KBI-2026-008", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_008", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-24T02:00:00.000Z", valid_until: null, note: "FCL with two free demurrage days at destination." }),
        base({ id: "qt_009", quotation_group_id: "qg_do_009", quotation_no: "QT-KBI-2026-009", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_009", customer_ref: "KBI", supplier_id: "sup_vn_trucking", quotation_type: "TRUCKING", incoterm_code: "EXW", mode: null, currency_code: "VND", exchange_rate: 1, status: "CONFIRMED", is_final: true, quoted_at: "2026-06-25T02:00:00.000Z", valid_until: dayFromToday(35), note: "Cross-border trucking from Pingxiang to Kim Binh." }),
        base({ id: "qt_010", quotation_group_id: "qg_do_010", quotation_no: "QT-KBI-2026-010", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_010", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "CIF", mode: "SEA_LCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-07-18T02:00:00.000Z", valid_until: dayFromToday(40), note: "LCL freight including origin CFS handling." }),
        base({ id: "qt_011", quotation_group_id: "qg_do_011", quotation_no: "QT-KBI-2026-011", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_011", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "EXW", mode: "AIR", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-07-21T02:00:00.000Z", valid_until: dayFromToday(33), note: "Direct PVG-HAN air freight for electrical parts." }),
        base({ id: "qt_012", quotation_group_id: "qg_do_012", quotation_no: "QT-KBI-2026-012", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_012", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-07-25T02:00:00.000Z", valid_until: dayFromToday(20), note: "Breakbulk freight for non-containerized hose bundles." }),
        base({ id: "qt_013", quotation_group_id: "qg_do_013", quotation_no: "QT-KBI-2026-013", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_013", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "CIF", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-07-12T02:00:00.000Z", valid_until: dayFromToday(27), note: "Supplier CIF shipment, local tracking quote retained for demo." }),
        base({ id: "qt_014", quotation_group_id: "qg_do_014", quotation_no: "QT-KBI-2026-014", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_014", customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "DDP", mode: "AIR", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, quoted_at: "2026-07-26T02:00:00.000Z", valid_until: dayFromToday(31), note: "Air freight for high-value ECU modules." }),
        // Standalone pre-PO freight quotations (reversed flow). Not bound to a DO;
        // carry their own customer_ref + incoterm_code + mode. One per status so the
        // 5-state tabs all have data; qt_023 (CONFIRMED) seeds the create-PO demo.
        base({ id: "qt_020", quotation_group_id: "qg_qt_020", quotation_no: "QT-KBI-2026-020", version: 1, ref_type: null, ref_id: null, customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "REQUEST_FOR_QUOTATION", is_final: false, quoted_at: "2026-06-26T02:00:00.000Z", valid_until: "2026-07-26", note: "RFQ from KBI — awaiting FDS draft." }),
        base({ id: "qt_021", quotation_group_id: "qg_qt_021", quotation_no: "QT-KBI-2026-021", version: 1, ref_type: null, ref_id: null, customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "EXW", mode: "AIR", currency_code: "USD", exchange_rate: 25000, status: "DRAFT", is_final: false, quoted_at: "2026-06-27T02:00:00.000Z", valid_until: "2026-07-27", note: "FDS drafting air freight options." }),
        base({ id: "qt_022", quotation_group_id: "qg_qt_022", quotation_no: "QT-KBI-2026-022", version: 1, ref_type: null, ref_id: null, customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_LCL", currency_code: "USD", exchange_rate: 25000, status: "PENDING_APPROVAL", is_final: false, quoted_at: "2026-06-28T02:00:00.000Z", valid_until: "2026-07-28", note: "Sent to KBI for confirmation." }),
        base({ id: "qt_023", quotation_group_id: "qg_qt_023", quotation_no: "QT-KBI-2026-023", version: 1, ref_type: null, ref_id: null, customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "FOB", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", is_final: true, confirmed_at: "2026-06-29T02:00:00.000Z", quoted_at: "2026-06-29T01:00:00.000Z", valid_until: "2026-07-29", note: "Confirmed by KBI — ready to create PO." }),
        base({ id: "qt_024", quotation_group_id: "qg_qt_024", quotation_no: "QT-KBI-2026-024", version: 1, ref_type: null, ref_id: null, customer_ref: "KBI", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", incoterm_code: "CFR", mode: "SEA_FCL", currency_code: "USD", exchange_rate: 25000, status: "REJECTED", is_final: false, rejected_at: "2026-06-28T06:00:00.000Z", reject_reason: "Giá cao hơn ngân sách KBI.", quoted_at: "2026-06-27T02:00:00.000Z", valid_until: "2026-07-27", note: "Rejected by KBI." })
    ],
    "quotation-charge-lines": [
        base({ id: "qt_line_001", quotation_id: "qt_001", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong FCL", quantity: 1, unit_price: 1200, amount: 1200, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_002", quotation_id: "qt_002", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong LCL", quantity: 1, unit_price: 800, amount: 800, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_003", quotation_id: "qt_003", charge_type: "LOCAL_CHARGE", description: "Terminal handling charge", quantity: 1, unit_price: 3500000, amount: 3500000, currency_code: "VND", tax_rate: 10, note: null }),
        base({ id: "qt_line_004", quotation_id: "qt_004", charge_type: "TRUCKING", description: "Hai Phong to Kim Binh factory", quantity: 1, unit_price: 6500000, amount: 6500000, currency_code: "VND", tax_rate: 10, note: null }),
        base({ id: "qt_line_005", quotation_id: "qt_005", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 20GP", quantity: 1, unit_price: 1380, amount: 1380, currency_code: "USD", tax_rate: 0, note: "Includes AMS and origin doc fee." }),
        base({ id: "qt_line_006", quotation_id: "qt_006", charge_type: "AIR_FREIGHT", description: "PVG to HAN airport-to-airport", quantity: 210, unit_price: 4.2, amount: 882, currency_code: "USD", tax_rate: 0, note: "Chargeable weight in kg." }),
        base({ id: "qt_line_007", quotation_id: "qt_007", charge_type: "OCEAN_FREIGHT", description: "Ningbo to Hai Phong LCL", quantity: 4.5, unit_price: 95, amount: 427.5, currency_code: "USD", tax_rate: 0, note: "CBM basis." }),
        base({ id: "qt_line_008", quotation_id: "qt_008", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 40HC", quantity: 1, unit_price: 1680, amount: 1680, currency_code: "USD", tax_rate: 0, note: "Space protected for week 29 sailing." }),
        base({ id: "qt_line_009", quotation_id: "qt_009", charge_type: "TRUCKING", description: "Pingxiang border to Kim Binh factory", quantity: 1, unit_price: 18500000, amount: 18500000, currency_code: "VND", tax_rate: 10, note: "Includes border transload fee." }),
        base({ id: "qt_line_010", quotation_id: "qt_010", charge_type: "OCEAN_FREIGHT", description: "Shanghai CFS to Hai Phong CFS LCL", quantity: 3.2, unit_price: 92, amount: 294.4, currency_code: "USD", tax_rate: 0, note: "CBM basis for gasket kits." }),
        base({ id: "qt_line_011", quotation_id: "qt_011", charge_type: "AIR_FREIGHT", description: "PVG to HAN airport-to-airport", quantity: 285, unit_price: 4.4, amount: 1254, currency_code: "USD", tax_rate: 0, note: "Chargeable weight in kg." }),
        base({ id: "qt_line_012", quotation_id: "qt_012", charge_type: "BREAKBULK_FREIGHT", description: "Shanghai breakbulk berth to Hai Phong port", quantity: 1, unit_price: 2450, amount: 2450, currency_code: "USD", tax_rate: 0, note: "Includes lashing and oversized handling." }),
        base({ id: "qt_line_013", quotation_id: "qt_013", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 20GP", quantity: 1, unit_price: 1320, amount: 1320, currency_code: "USD", tax_rate: 0, note: "Supplier CIF reference quote." }),
        base({ id: "qt_line_014", quotation_id: "qt_014", charge_type: "AIR_FREIGHT", description: "PVG to HAN high-value cargo", quantity: 95, unit_price: 5.8, amount: 551, currency_code: "USD", tax_rate: 0, note: "Includes security screening surcharge." }),
        // qt_001 (CFR / FCL) itemized Vietnam-side breakdown demonstrating the Incoterms-aware charge_type vocabulary.
        base({ id: "qt_line_015", quotation_id: "qt_001", charge_type: "DO_FEE", description: "D/O fee", quantity: 1, unit: "BL", unit_price: 35, amount: 35, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_016", quotation_id: "qt_001", charge_type: "HANDLING", description: "Handling fee", quantity: 1, unit: "BL", unit_price: 25, amount: 25, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_017", quotation_id: "qt_001", charge_type: "THC", description: "Terminal handling charge", quantity: 1, unit: "CONT", unit_price: 130, amount: 130, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_018", quotation_id: "qt_001", charge_type: "CIC", description: "Container imbalance charge", quantity: 1, unit: "CONT", unit_price: 95, amount: 95, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_019", quotation_id: "qt_001", charge_type: "EMC_EMF", description: "EMC / EMF", quantity: 1, unit: "CONT", unit_price: 40, amount: 40, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_020", quotation_id: "qt_001", charge_type: "CLEANING", description: "Container cleaning", quantity: 1, unit: "CONT", unit_price: 12, amount: 12, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_021", quotation_id: "qt_001", charge_type: "CUSTOMS_FEE", description: "Customs clearance declaration", quantity: 1, unit: "DECLARATION", unit_price: 45, amount: 45, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_022", quotation_id: "qt_001", charge_type: "TRUCKING", description: "Hai Phong port to Kim Binh factory", quantity: 1, unit: "CONT", unit_price: 180, amount: 180, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_023", quotation_id: "qt_001", charge_type: "LOWERING_FEE", description: "Empty container drop-off (Hạ xa)", quantity: 1, unit: "CONT", unit_price: 25, amount: 25, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_030", quotation_id: "qt_020", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 40HC", quantity: 1, unit: "CONT", unit_price: 1650, amount: 1650, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_031", quotation_id: "qt_021", charge_type: "AIR_FREIGHT", description: "PVG to HAN airport-to-airport", quantity: 180, unit: "KGS", unit_price: 4.5, amount: 810, currency_code: "USD", tax_rate: 0, note: "Chargeable weight in kg." }),
        base({ id: "qt_line_032", quotation_id: "qt_022", charge_type: "OCEAN_FREIGHT", description: "Shanghai CFS to Hai Phong LCL", quantity: 5, unit: "RT", unit_price: 90, amount: 450, currency_code: "USD", tax_rate: 0, note: "CBM basis." }),
        base({ id: "qt_line_033", quotation_id: "qt_023", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 20GP", quantity: 1, unit: "CONT", unit_price: 1400, amount: 1400, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_034", quotation_id: "qt_023", charge_type: "THC", description: "Terminal handling charge", quantity: 1, unit: "CONT", unit_price: 130, amount: 130, currency_code: "USD", tax_rate: 0, note: null }),
        base({ id: "qt_line_035", quotation_id: "qt_024", charge_type: "OCEAN_FREIGHT", description: "Shanghai to Hai Phong 40HC", quantity: 1, unit: "CONT", unit_price: 1980, amount: 1980, currency_code: "USD", tax_rate: 0, note: "Above KBI budget." })
    ],
    "quotation-events": [
        base({ id: "qt_event_001", quotation_id: "qt_001", event_code: "MARK_FINAL", event_at: "2026-06-10T04:00:00.000Z", note: "Confirmed by KBI." }),
        base({ id: "qt_event_002", quotation_id: "qt_002", event_code: "MARK_FINAL", event_at: "2026-06-18T04:00:00.000Z", note: "Confirmed by KBI." }),
        base({ id: "qt_event_003", quotation_id: "qt_003", event_code: "RECEIVED", event_at: "2026-06-20T04:00:00.000Z", note: "Waiting approval." }),
        base({ id: "qt_event_004", quotation_id: "qt_004", event_code: "MARK_FINAL", event_at: "2026-06-21T04:00:00.000Z", note: "Truck quote final." }),
        base({ id: "qt_event_005", quotation_id: "qt_005", event_code: "MARK_FINAL", event_at: "2026-06-22T04:00:00.000Z", note: "FCL quote accepted." }),
        base({ id: "qt_event_006", quotation_id: "qt_006", event_code: "MARK_FINAL", event_at: "2026-06-23T04:00:00.000Z", note: "Air quote accepted due to stockout risk." }),
        base({ id: "qt_event_007", quotation_id: "qt_007", event_code: "MARK_FINAL", event_at: "2026-06-19T04:00:00.000Z", note: "LCL quote accepted." }),
        base({ id: "qt_event_008", quotation_id: "qt_008", event_code: "MARK_FINAL", event_at: "2026-06-24T04:00:00.000Z", note: "FCL quote accepted." }),
        base({ id: "qt_event_009", quotation_id: "qt_009", event_code: "MARK_FINAL", event_at: "2026-06-25T04:00:00.000Z", note: "Cross-border truck quote accepted." }),
        base({ id: "qt_event_010", quotation_id: "qt_010", event_code: "MARK_FINAL", event_at: "2026-07-18T04:00:00.000Z", note: "LCL quote accepted." }),
        base({ id: "qt_event_011", quotation_id: "qt_011", event_code: "MARK_FINAL", event_at: "2026-07-21T04:00:00.000Z", note: "Air freight quote accepted." }),
        base({ id: "qt_event_012", quotation_id: "qt_012", event_code: "MARK_FINAL", event_at: "2026-07-25T04:00:00.000Z", note: "Breakbulk quote accepted." }),
        base({ id: "qt_event_013", quotation_id: "qt_013", event_code: "MARK_FINAL", event_at: "2026-07-12T04:00:00.000Z", note: "CIF shipment tracked for local execution." }),
        base({ id: "qt_event_014", quotation_id: "qt_014", event_code: "MARK_FINAL", event_at: "2026-07-26T04:00:00.000Z", note: "High-value air quote accepted." })
    ],
    "shipments": [
        base({ id: "shp_001", shipment_no: "SHP-KBI-2026-001", delivery_order_id: "do_001", mode: "SEA", load_type: "FCL", forwarder_id: "sup_fds_forwarder", carrier: "COSCO", vessel_flight: "COSCO STAR 126E", bl_awb_no: "BL-SHA-001", container_no: "CBHU1234567", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-08", eta: "2026-07-16", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_002", shipment_no: "SHP-KBI-2026-002", delivery_order_id: "do_002", mode: "SEA", load_type: "LCL", forwarder_id: "sup_fds_forwarder", carrier: "OOCL", vessel_flight: "OOCL ASIA 021S", bl_awb_no: "BL-SHA-002", container_no: "LCL-SHA-002", pol: "CNSHA", pod: "VNHPH", etd: "2026-06-24", eta: "2026-07-02", atd: "2026-06-24", ata: null, status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_003", shipment_no: "SHP-KBI-2026-003", delivery_order_id: "do_002", mode: "AIR", load_type: null, forwarder_id: "sup_fds_forwarder", carrier: "VN Cargo", vessel_flight: "VN996", bl_awb_no: "AWB-003", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-06-26", eta: "2026-06-27", atd: "2026-06-26", ata: "2026-06-27", status: "DELIVERED" }),
        base({ id: "shp_004", shipment_no: "SHP-KBI-2026-004", delivery_order_id: "do_004", mode: "TRUCKING", load_type: "FTL", forwarder_id: "sup_vn_trucking", carrier: "VN Trucking", vessel_flight: null, bl_awb_no: null, container_no: "TRUCK-004", pol: "Hai Phong", pod: "Kim Binh", etd: "2026-07-20", eta: "2026-07-21", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_005", shipment_no: "SHP-KBI-2026-005", delivery_order_id: "do_005", mode: "SEA", load_type: "FCL", forwarder_id: "sup_fds_forwarder", carrier: "MAERSK", vessel_flight: "MAERSK NANSHA 241S", bl_awb_no: "BL-SHA-005", container_no: "MSKU7654321", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-22", eta: "2026-07-30", atd: null, ata: null, status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_006", shipment_no: "SHP-KBI-2026-006", delivery_order_id: "do_006", mode: "AIR", load_type: null, forwarder_id: "sup_fds_forwarder", carrier: "Cathay Cargo", vessel_flight: "CX052", bl_awb_no: "AWB-006", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-08-04", eta: "2026-08-05", atd: "2026-08-04", ata: null, status: "ATD" }),
        base({ id: "shp_007", shipment_no: "SHP-KBI-2026-007", delivery_order_id: "do_007", mode: "SEA", load_type: "LCL", forwarder_id: "sup_fds_forwarder", carrier: "SITC", vessel_flight: "SITC HAIPHONG 088S", bl_awb_no: "BL-NGB-007", container_no: "LCL-NGB-007", pol: "CNNGB", pod: "VNHPH", etd: "2026-06-30", eta: "2026-07-08", atd: "2026-06-30", ata: "2026-07-08", status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_008", shipment_no: "SHP-KBI-2026-008", delivery_order_id: "do_008", mode: "SEA", load_type: "FCL", forwarder_id: "sup_fds_forwarder", carrier: "ONE", vessel_flight: "ONE ORPHEUS 077S", bl_awb_no: "BL-SHA-008", container_no: "TGBU9876543", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-14", eta: "2026-07-22", atd: "2026-07-14", ata: null, status: "ARRIVAL_NOTICE" }),
        base({ id: "shp_009", shipment_no: "SHP-KBI-2026-009", delivery_order_id: "do_009", mode: "TRUCKING", load_type: "FTL", forwarder_id: "sup_vn_trucking", carrier: "VN Cross Border Trucking", vessel_flight: null, bl_awb_no: "CMR-CB-009", container_no: "TRUCK-CB-009", pol: "Pingxiang Border", pod: "Kim Binh", etd: "2026-08-12", eta: "2026-08-14", atd: "2026-08-12", ata: "2026-08-14", status: "DELIVERED" }),
        base({ id: "shp_010", shipment_no: "SHP-KBI-2026-010", delivery_order_id: "do_010", mode: "SEA", load_type: "LCL", forwarder_id: "sup_fds_forwarder", carrier: "SITC", vessel_flight: "SITC SHANGHAI 116S", bl_awb_no: "BL-SHA-010", container_no: "LCL-SHA-010", pol: "CNSHA", pod: "VNHPH", etd: "2026-08-18", eta: "2026-08-26", atd: "2026-08-18", ata: "2026-08-26", status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_011", shipment_no: "SHP-KBI-2026-011", delivery_order_id: "do_011", mode: "AIR", load_type: null, forwarder_id: "sup_fds_forwarder", carrier: "China Eastern Cargo", vessel_flight: "MU7711", bl_awb_no: "AWB-011", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-09-03", eta: "2026-09-04", atd: "2026-09-03", ata: null, status: "ATD" }),
        base({ id: "shp_012", shipment_no: "SHP-KBI-2026-012", delivery_order_id: "do_012", mode: "SEA", load_type: null, forwarder_id: "sup_fds_forwarder", carrier: "COSCO", vessel_flight: "COSCO HEAVY 031S", bl_awb_no: "BBL-SHA-012", container_no: null, pol: "CNSHA", pod: "VNHPH", etd: "2026-09-08", eta: "2026-09-18", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_013", shipment_no: "SHP-KBI-2026-013", delivery_order_id: "do_013", mode: "SEA", load_type: "FCL", forwarder_id: "sup_fds_forwarder", carrier: "MAERSK", vessel_flight: "MAERSK SHANGHAI 193S", bl_awb_no: "BL-SHA-013", container_no: "MRKU2468135", pol: "CNSHA", pod: "VNHPH", etd: "2026-08-05", eta: "2026-08-13", atd: "2026-08-05", ata: "2026-08-13", status: "DELIVERED" }),
        base({ id: "shp_014", shipment_no: "SHP-KBI-2026-014", delivery_order_id: "do_014", mode: "AIR", load_type: null, forwarder_id: "sup_fds_forwarder", carrier: "SF Airlines", vessel_flight: "O36918", bl_awb_no: "AWB-014", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-08-28", eta: "2026-08-29", atd: "2026-08-28", ata: "2026-08-29", status: "DELIVERED" })
    ],
    "shipment-lines": [
        base({ id: "shp_line_001", shipment_id: "shp_001", delivery_order_line_id: "do_line_001", purchase_order_line_id: "po_line_002", po_lot_id: "lot_003", item_id: "item_003", qty_shipped: 25, unit: "SET", sort_order: 1 }),
        base({ id: "shp_line_002", shipment_id: "shp_002", delivery_order_line_id: "do_line_002", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty_shipped: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_003", shipment_id: "shp_003", delivery_order_line_id: "do_line_002", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty_shipped: 2, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_004", shipment_id: "shp_004", delivery_order_line_id: "do_line_004", purchase_order_line_id: "po_line_004", po_lot_id: "lot_010", item_id: "item_002", qty_shipped: 100, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_005", shipment_id: "shp_005", delivery_order_line_id: "do_line_005", purchase_order_line_id: "po_line_005", po_lot_id: "lot_005", item_id: "item_005", qty_shipped: 12, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_006", shipment_id: "shp_006", delivery_order_line_id: "do_line_006", purchase_order_line_id: "po_line_006", po_lot_id: "lot_006", item_id: "item_006", qty_shipped: 30, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_007", shipment_id: "shp_007", delivery_order_line_id: "do_line_007", purchase_order_line_id: "po_line_007", po_lot_id: "lot_007", item_id: "item_007", qty_shipped: 240, unit: "SET", sort_order: 1 }),
        base({ id: "shp_line_008", shipment_id: "shp_008", delivery_order_line_id: "do_line_008", purchase_order_line_id: "po_line_008", po_lot_id: "lot_008", item_id: "item_008", qty_shipped: 800, unit: "KIT", sort_order: 1 }),
        base({ id: "shp_line_009", shipment_id: "shp_009", delivery_order_line_id: "do_line_009", purchase_order_line_id: "po_line_009", po_lot_id: "lot_009", item_id: "item_009", qty_shipped: 18, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_010", shipment_id: "shp_010", delivery_order_line_id: "do_line_010", purchase_order_line_id: "po_line_010", po_lot_id: "lot_011", item_id: "item_010", qty_shipped: 120, unit: "KIT", sort_order: 1 }),
        base({ id: "shp_line_011", shipment_id: "shp_011", delivery_order_line_id: "do_line_011", purchase_order_line_id: "po_line_011", po_lot_id: "lot_012", item_id: "item_011", qty_shipped: 45, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_012", shipment_id: "shp_012", delivery_order_line_id: "do_line_012", purchase_order_line_id: "po_line_012", po_lot_id: "lot_013", item_id: "item_012", qty_shipped: 300, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_013", shipment_id: "shp_013", delivery_order_line_id: "do_line_013", purchase_order_line_id: "po_line_013", po_lot_id: "lot_014", item_id: "item_013", qty_shipped: 600, unit: "PCS", sort_order: 1 }),
        base({ id: "shp_line_014", shipment_id: "shp_014", delivery_order_line_id: "do_line_014", purchase_order_line_id: "po_line_014", po_lot_id: "lot_015", item_id: "item_014", qty_shipped: 20, unit: "PCS", sort_order: 1 })
    ],
    "shipment-milestones": buildMilestones(),
    "shipment-documents": [
        base({ id: "shp_doc_001", shipment_id: "shp_001", milestone_id: null, milestone_code: null, document_type: "BOOKING_CONFIRMATION", document_no: "BK-001", file_url: "/mock/files/bk-001.pdf", file_name: "bk-001.pdf", mime_type: "application/pdf", issued_date: "2026-07-01", received_at: "2026-07-01T00:00:00.000Z", status: "VERIFIED", notes: null }),
        base({ id: "shp_doc_002", shipment_id: "shp_002", milestone_id: null, milestone_code: null, document_type: "BILL_OF_LADING", document_no: "BL-SHA-002", file_url: "/mock/files/bl-002.pdf", file_name: "bl-002.pdf", mime_type: "application/pdf", issued_date: "2026-06-24", received_at: "2026-06-25T00:00:00.000Z", status: "VERIFIED", notes: null }),
        base({ id: "shp_doc_003", shipment_id: "shp_003", milestone_id: null, milestone_code: null, document_type: "AIR_WAYBILL", document_no: "AWB-003", file_url: "/mock/files/awb-003.pdf", file_name: "awb-003.pdf", mime_type: "application/pdf", issued_date: "2026-06-26", received_at: "2026-06-26T00:00:00.000Z", status: "VERIFIED", notes: null }),
        base({ id: "shp_doc_004", shipment_id: "shp_004", milestone_id: null, milestone_code: null, document_type: "COMMERCIAL_INVOICE", document_no: "CI-004", file_url: "/mock/files/ci-004.pdf", file_name: "ci-004.pdf", mime_type: "application/pdf", issued_date: "2026-07-15", received_at: "2026-07-15T00:00:00.000Z", status: "DRAFT", notes: null }),
        base({ id: "shp_doc_005", shipment_id: "shp_005", milestone_id: null, milestone_code: null, document_type: "BOOKING_CONFIRMATION", document_no: "BK-SHA-005", file_url: "/mock/files/bk-sha-005.pdf", file_name: "bk-sha-005.pdf", mime_type: "application/pdf", issued_date: "2026-07-18", received_at: "2026-07-18T00:00:00.000Z", status: "RECEIVED", notes: "20GP booking confirmation." }),
        base({ id: "shp_doc_006", shipment_id: "shp_006", milestone_id: null, milestone_code: null, document_type: "AIR_WAYBILL", document_no: "AWB-006", file_url: "/mock/files/awb-006.pdf", file_name: "awb-006.pdf", mime_type: "application/pdf", issued_date: "2026-08-04", received_at: "2026-08-04T00:00:00.000Z", status: "RECEIVED", notes: "Direct PVG-HAN flight." }),
        base({ id: "shp_doc_007", shipment_id: "shp_007", milestone_id: null, milestone_code: null, document_type: "BILL_OF_LADING", document_no: "BL-NGB-007", file_url: "/mock/files/bl-ngb-007.pdf", file_name: "bl-ngb-007.pdf", mime_type: "application/pdf", issued_date: "2026-06-30", received_at: "2026-07-01T00:00:00.000Z", status: "VERIFIED", notes: "LCL house bill." }),
        base({ id: "shp_doc_008", shipment_id: "shp_008", milestone_id: null, milestone_code: null, document_type: "ARRIVAL_NOTICE", document_no: "AN-SHA-008", file_url: "/mock/files/an-sha-008.pdf", file_name: "an-sha-008.pdf", mime_type: "application/pdf", issued_date: "2026-07-20", received_at: "2026-07-20T00:00:00.000Z", status: "RECEIVED", notes: "Arrival notice pending customs draft." }),
        base({ id: "shp_doc_009", shipment_id: "shp_009", milestone_id: null, milestone_code: null, document_type: "CMR", document_no: "CMR-CB-009", file_url: "/mock/files/cmr-cb-009.pdf", file_name: "cmr-cb-009.pdf", mime_type: "application/pdf", issued_date: "2026-08-12", received_at: "2026-08-12T00:00:00.000Z", status: "VERIFIED", notes: "Cross-border road consignment note." }),
        base({ id: "shp_doc_010", shipment_id: "shp_010", milestone_id: null, milestone_code: null, document_type: "BILL_OF_LADING", document_no: "BL-SHA-010", file_url: "/mock/files/bl-sha-010.pdf", file_name: "bl-sha-010.pdf", mime_type: "application/pdf", issued_date: "2026-08-18", received_at: "2026-08-19T00:00:00.000Z", status: "VERIFIED", notes: "LCL house bill for gasket kits." }),
        base({ id: "shp_doc_011", shipment_id: "shp_011", milestone_id: null, milestone_code: null, document_type: "AIR_WAYBILL", document_no: "AWB-011", file_url: "/mock/files/awb-011.pdf", file_name: "awb-011.pdf", mime_type: "application/pdf", issued_date: "2026-09-03", received_at: "2026-09-03T00:00:00.000Z", status: "RECEIVED", notes: "Air waybill received after departure." }),
        base({ id: "shp_doc_012", shipment_id: "shp_012", milestone_id: null, milestone_code: null, document_type: "BOOKING_CONFIRMATION", document_no: "BK-BB-012", file_url: "/mock/files/bk-bb-012.pdf", file_name: "bk-bb-012.pdf", mime_type: "application/pdf", issued_date: "2026-09-01", received_at: "2026-09-01T00:00:00.000Z", status: "DRAFT", notes: "Breakbulk booking confirmation." }),
        base({ id: "shp_doc_013", shipment_id: "shp_013", milestone_id: null, milestone_code: null, document_type: "BILL_OF_LADING", document_no: "BL-SHA-013", file_url: "/mock/files/bl-sha-013.pdf", file_name: "bl-sha-013.pdf", mime_type: "application/pdf", issued_date: "2026-08-05", received_at: "2026-08-06T00:00:00.000Z", status: "VERIFIED", notes: "FCL master bill." }),
        base({ id: "shp_doc_014", shipment_id: "shp_014", milestone_id: null, milestone_code: null, document_type: "AIR_WAYBILL", document_no: "AWB-014", file_url: "/mock/files/awb-014.pdf", file_name: "awb-014.pdf", mime_type: "application/pdf", issued_date: "2026-08-28", received_at: "2026-08-28T00:00:00.000Z", status: "VERIFIED", notes: "High-value electronics air waybill." })
    ],
    "shipment-containers": [
        base({ id: "cont_001", shipment_id: "shp_001", dto_id: "dto_001", container_no: "CBHU1234567", container_type: "40GP", seal_no: "SL-001", tare_weight_kg: 3750, gross_weight_kg: 28500, volume_cbm: 64, status: "STUFFED", note: "Stuffed at Shanghai CFS." }),
        base({ id: "cont_002", shipment_id: "shp_005", dto_id: "dto_005", container_no: "MSKU7654321", container_type: "20GP", seal_no: "SL-005", tare_weight_kg: 2300, gross_weight_kg: 21800, volume_cbm: 31, status: "STUFFED", note: "20GP full load." }),
        base({ id: "cont_003", shipment_id: "shp_008", dto_id: "dto_008", container_no: "TGBU9876543", container_type: "40HC", seal_no: "SL-008A", tare_weight_kg: 3900, gross_weight_kg: 29900, volume_cbm: 72, status: "DISCHARGED", note: "Discharged at Hai Phong." }),
        base({ id: "cont_004", shipment_id: "shp_008", dto_id: "dto_015", container_no: "TEMU3344556", container_type: "40HC", seal_no: "SL-008B", tare_weight_kg: 3900, gross_weight_kg: 28700, volume_cbm: 70, status: "DISCHARGED", note: "Second container of the FCL booking." }),
        base({ id: "cont_005", shipment_id: "shp_013", dto_id: "dto_013", container_no: "MRKU2468135", container_type: "20GP", seal_no: "SL-013", tare_weight_kg: 2300, gross_weight_kg: 20400, volume_cbm: 29, status: "RETURNED", note: "Empty returned same day." }),
        base({ id: "cont_006", shipment_id: "shp_005", dto_id: null, container_no: "MSKU7654322", container_type: "40GP", seal_no: "SL-005B", tare_weight_kg: 3750, gross_weight_kg: 26400, volume_cbm: 64, status: "DISCHARGED", note: "Free container ready for DTO creation." }),
        base({ id: "cont_007", shipment_id: "shp_005", dto_id: null, container_no: "MSKU7654323", container_type: "40GP", seal_no: "SL-005C", tare_weight_kg: 3750, gross_weight_kg: 25900, volume_cbm: 63, status: "DISCHARGED", note: "Free container ready for DTO creation." })
    ],
    "shipment-costs": [
        base({ id: "shp_cost_001", shipment_id: "shp_001", cost_type: "FREIGHT", description: "Ocean freight CNSHA-VNHPH (40GP)", amount: 2400, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "FRT-001", notes: null }),
        base({ id: "shp_cost_002", shipment_id: "shp_001", cost_type: "INSURANCE", description: "Cargo insurance 0.08%", amount: 180, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "INS-001", notes: null }),
        base({ id: "shp_cost_003", shipment_id: "shp_001", cost_type: "LOCAL_CHARGES", description: "THC + D/O + handling at VNHPH", amount: 3500000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_004", shipment_id: "shp_001", cost_type: "CUSTOMS_DUTY", description: "Import duty estimate (5%)", amount: 18000000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: "Provisional pending HS confirmation." }),
        base({ id: "shp_cost_005", shipment_id: "shp_001", cost_type: "VAT", description: "Import VAT (10%)", amount: 42000000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_006", shipment_id: "shp_002", cost_type: "FREIGHT", description: "LCL ocean freight CNSHA-VNHPH", amount: 850, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "FRT-002", notes: null }),
        base({ id: "shp_cost_007", shipment_id: "shp_002", cost_type: "LOCAL_CHARGES", description: "CFS + local handling", amount: 2100000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_008", shipment_id: "shp_005", cost_type: "FREIGHT", description: "Ocean freight (40GP)", amount: 2600, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "FRT-005", notes: null }),
        base({ id: "shp_cost_009", shipment_id: "shp_005", cost_type: "INSURANCE", description: "Cargo insurance", amount: 210, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_010", shipment_id: "shp_005", cost_type: "LOCAL_CHARGES", description: "THC + D/O at VNHPH", amount: 3800000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_011", shipment_id: "shp_007", cost_type: "FREIGHT", description: "LCL ocean freight CNNGB-VNHPH", amount: 920, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "FRT-007", notes: null }),
        base({ id: "shp_cost_012", shipment_id: "shp_007", cost_type: "DEMURRAGE", description: "Demurrage 2 days (arising)", amount: 1500000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: "Container held during customs check." }),
        base({ id: "shp_cost_013", shipment_id: "shp_008", cost_type: "FREIGHT", description: "Ocean freight 2x40HC", amount: 4200, currency_code: "USD", exchange_rate: 25000, alloc_method: "BY_VALUE", invoice_ref: "FRT-008", notes: null }),
        base({ id: "shp_cost_014", shipment_id: "shp_008", cost_type: "LOCAL_CHARGES", description: "THC + D/O + cleaning", amount: 4100000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: null }),
        base({ id: "shp_cost_015", shipment_id: "shp_008", cost_type: "OTHER", description: "Fumigation certificate fee (arising)", amount: 1200000, currency_code: "VND", exchange_rate: 1, alloc_method: "BY_VALUE", invoice_ref: null, notes: "Requested by customs." })
    ],
    "delivery-order-documents": [
        base({ id: "do_doc_001", delivery_order_id: "do_001", document_type: "Invoice", document_no: "CI-DO-001", file_url: "/mock/files/ci-do-001.pdf", file_name: "ci-do-001.pdf", mime_type: "application/pdf", received_at: "2026-07-05T00:00:00.000Z", status: "VERIFIED", is_required: true, notes: null }),
        base({ id: "do_doc_002", delivery_order_id: "do_001", document_type: "Packing List", document_no: "PL-DO-001", file_url: "/mock/files/pl-do-001.pdf", file_name: "pl-do-001.pdf", mime_type: "application/pdf", received_at: "2026-07-05T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: null }),
        base({ id: "do_doc_003", delivery_order_id: "do_001", document_type: "B/L", document_no: "BL-SHA-001", file_url: "/mock/files/bl-sha-001.pdf", file_name: "bl-sha-001.pdf", mime_type: "application/pdf", received_at: "2026-07-09T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: null }),
        base({ id: "do_doc_004", delivery_order_id: "do_001", document_type: "Fumigation Certificate", document_no: "FUMI-001", file_url: "/mock/files/fumi-001.pdf", file_name: "fumi-001.pdf", mime_type: "application/pdf", received_at: "2026-07-10T00:00:00.000Z", status: "RECEIVED", is_required: false, notes: "Arising document requested by customs." }),
        base({ id: "do_doc_005", delivery_order_id: "do_002", document_type: "Invoice", document_no: "CI-DO-002", file_url: "/mock/files/ci-do-002.pdf", file_name: "ci-do-002.pdf", mime_type: "application/pdf", received_at: "2026-06-24T00:00:00.000Z", status: "VERIFIED", is_required: true, notes: null }),
        base({ id: "do_doc_006", delivery_order_id: "do_002", document_type: "CO", document_no: "CO-FORM-E-002", file_url: "/mock/files/co-002.pdf", file_name: "co-002.pdf", mime_type: "application/pdf", received_at: "2026-06-25T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: "Form E for preferential duty." }),
        base({ id: "do_doc_007", delivery_order_id: "do_005", document_type: "Invoice", document_no: "CI-DO-005", file_url: "/mock/files/ci-do-005.pdf", file_name: "ci-do-005.pdf", mime_type: "application/pdf", received_at: "2026-07-18T00:00:00.000Z", status: "VERIFIED", is_required: true, notes: null }),
        base({ id: "do_doc_008", delivery_order_id: "do_005", document_type: "Packing List", document_no: "PL-DO-005", file_url: "/mock/files/pl-do-005.pdf", file_name: "pl-do-005.pdf", mime_type: "application/pdf", received_at: "2026-07-18T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: null }),
        base({ id: "do_doc_009", delivery_order_id: "do_005", document_type: "B/L", document_no: "BL-SHA-005", file_url: "/mock/files/bl-sha-005.pdf", file_name: "bl-sha-005.pdf", mime_type: "application/pdf", received_at: "2026-07-19T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: null }),
        base({ id: "do_doc_010", delivery_order_id: "do_005", document_type: "CO", document_no: "CO-FORM-E-005", file_url: "/mock/files/co-005.pdf", file_name: "co-005.pdf", mime_type: "application/pdf", received_at: "2026-07-19T00:00:00.000Z", status: "VERIFIED", is_required: true, notes: null }),
        base({ id: "do_doc_011", delivery_order_id: "do_005", document_type: "Debit Note", document_no: "DN-005", file_url: "/mock/files/dn-005.pdf", file_name: "dn-005.pdf", mime_type: "application/pdf", received_at: "2026-07-31T00:00:00.000Z", status: "RECEIVED", is_required: false, notes: "Arising freight surcharge debit note." }),
        base({ id: "do_doc_012", delivery_order_id: "do_007", document_type: "Invoice", document_no: "CI-DO-007", file_url: "/mock/files/ci-do-007.pdf", file_name: "ci-do-007.pdf", mime_type: "application/pdf", received_at: "2026-06-30T00:00:00.000Z", status: "RECEIVED", is_required: true, notes: null })
    ],
    "customs-declarations": [
        base({ id: "cd_001", shipment_id: "shp_001", declaration_no: "CD-KBI-2026-001", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-07-12T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: null }),
        base({ id: "cd_002", shipment_id: "shp_002", declaration_no: "CD-KBI-2026-002", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-06-29T02:00:00.000Z", official_opened_at: "2026-07-01T02:00:00.000Z", cleared_at: "2026-07-02T02:00:00.000Z", status: "CLEARED", note: "Cleared shipment." }),
        base({ id: "cd_003", shipment_id: "shp_003", declaration_no: "CD-KBI-2026-003", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-06-27T02:00:00.000Z", official_opened_at: "2026-06-27T05:00:00.000Z", cleared_at: "2026-06-27T08:00:00.000Z", status: "CLEARED", note: "Air shipment cleared." }),
        base({ id: "cd_004", shipment_id: "shp_004", declaration_no: "CD-KBI-2026-004", customs_type: "IMPORT", customs_channel: "RED", draft_opened_at: "2026-07-20T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Inspection expected." }),
        base({ id: "cd_005", shipment_id: "shp_005", declaration_no: "CD-KBI-2026-005", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-07-28T02:00:00.000Z", official_opened_at: "2026-07-29T02:00:00.000Z", cleared_at: "2026-07-30T02:00:00.000Z", status: "CLEARED", note: "Cleared and ready for inland transport." }),
        base({ id: "cd_006", shipment_id: "shp_006", declaration_no: "CD-KBI-2026-006", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-08-04T10:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Awaiting AWB arrival confirmation." }),
        base({ id: "cd_007", shipment_id: "shp_007", declaration_no: "CD-KBI-2026-007", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-07-06T02:00:00.000Z", official_opened_at: "2026-07-07T02:00:00.000Z", cleared_at: "2026-07-08T06:00:00.000Z", status: "CLEARED", note: "Cleared on ETA date." }),
        base({ id: "cd_008", shipment_id: "shp_008", declaration_no: "CD-KBI-2026-008", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-07-20T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "CO Form E pending hard copy." }),
        base({ id: "cd_009", shipment_id: "shp_009", declaration_no: "CD-KBI-2026-009", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-08-13T02:00:00.000Z", official_opened_at: "2026-08-13T04:00:00.000Z", cleared_at: "2026-08-14T02:00:00.000Z", status: "CLEARED", note: "Border declaration cleared." }),
        base({ id: "cd_010", shipment_id: "shp_010", declaration_no: "CD-KBI-2026-010", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-08-24T02:00:00.000Z", official_opened_at: "2026-08-25T02:00:00.000Z", cleared_at: "2026-08-26T03:00:00.000Z", status: "CLEARED", note: "Gasket kits cleared under Form E." }),
        base({ id: "cd_011", shipment_id: "shp_011", declaration_no: "CD-KBI-2026-011", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-09-03T08:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Awaiting original invoice for air shipment." }),
        base({ id: "cd_012", shipment_id: "shp_012", declaration_no: "CD-KBI-2026-012", customs_type: "IMPORT", customs_channel: "RED", draft_opened_at: "2026-09-10T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Oversized cargo expected for physical inspection." }),
        base({ id: "cd_013", shipment_id: "shp_013", declaration_no: "CD-KBI-2026-013", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-08-11T02:00:00.000Z", official_opened_at: "2026-08-12T02:00:00.000Z", cleared_at: "2026-08-13T04:00:00.000Z", status: "CLEARED", note: "Consumable filters cleared on arrival." }),
        base({ id: "cd_014", shipment_id: "shp_014", declaration_no: "CD-KBI-2026-014", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-08-29T02:00:00.000Z", official_opened_at: "2026-08-29T04:00:00.000Z", cleared_at: "2026-08-29T08:00:00.000Z", status: "CLEARED", note: "High-value ECU modules cleared after document check." })
    ],
    "customs-declaration-lines": [
        base({ id: "cd_line_001", customs_declaration_id: "cd_001", item_id: "item_003", hs_code: "85371099", item_description: "Control Cabinet", quantity: 25, unit: "SET", customs_value: 45000, import_duty_rate: 10, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "cd_line_002", customs_declaration_id: "cd_002", item_id: "item_004", hs_code: "84136090", item_description: "Hydraulic Pump", quantity: 10, unit: "PCS", customs_value: 12000, import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_003", customs_declaration_id: "cd_003", item_id: "item_004", hs_code: "84136090", item_description: "Hydraulic Pump spare", quantity: 2, unit: "PCS", customs_value: 2400, import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_004", customs_declaration_id: "cd_004", item_id: "item_002", hs_code: "84212399", item_description: "Oil Filter Element", quantity: 100, unit: "PCS", customs_value: 1200, import_duty_rate: 3, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_005", customs_declaration_id: "cd_005", item_id: "item_005", hs_code: "84148090", item_description: "Turbocharger Cartridge", quantity: 12, unit: "PCS", customs_value: 5400, import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_006", customs_declaration_id: "cd_006", item_id: "item_006", hs_code: "85115099", item_description: "Alternator Assembly 24V", quantity: 30, unit: "PCS", customs_value: 15857.14, import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "cd_line_007", customs_declaration_id: "cd_007", item_id: "item_007", hs_code: "84099979", item_description: "Fuel Injector Nozzle Set", quantity: 240, unit: "SET", customs_value: 9120, import_duty_rate: 5, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_008", customs_declaration_id: "cd_008", item_id: "item_008", hs_code: "40169390", item_description: "Hydraulic Seal Kit", quantity: 800, unit: "KIT", customs_value: 3600, import_duty_rate: 12, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "cd_line_009", customs_declaration_id: "cd_009", item_id: "item_009", hs_code: "87089199", item_description: "Radiator Core Assembly", quantity: 18, unit: "PCS", customs_value: 5580, import_duty_rate: 15, vat_rate: 10, co_form: "E", preferential_tax_rate: 8 }),
        base({ id: "cd_line_010", customs_declaration_id: "cd_010", item_id: "item_010", hs_code: "84841000", item_description: "Engine Overhaul Gasket Kit", quantity: 120, unit: "KIT", customs_value: 3840, import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "cd_line_011", customs_declaration_id: "cd_011", item_id: "item_011", hs_code: "85114099", item_description: "Starter Motor 24V", quantity: 45, unit: "PCS", customs_value: 8742.86, import_duty_rate: 8, vat_rate: 10, co_form: "E", preferential_tax_rate: 3 }),
        base({ id: "cd_line_012", customs_declaration_id: "cd_012", item_id: "item_012", hs_code: "40092190", item_description: "High Pressure Hydraulic Hose Assembly", quantity: 300, unit: "PCS", customs_value: 5550, import_duty_rate: 12, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 }),
        base({ id: "cd_line_013", customs_declaration_id: "cd_013", item_id: "item_013", hs_code: "84212319", item_description: "Fuel Water Separator Filter", quantity: 600, unit: "PCS", customs_value: 5520, import_duty_rate: 3, vat_rate: 10, co_form: "E", preferential_tax_rate: 0 }),
        base({ id: "cd_line_014", customs_declaration_id: "cd_014", item_id: "item_014", hs_code: "85371099", item_description: "Engine ECU Controller Module", quantity: 20, unit: "PCS", customs_value: 29000, import_duty_rate: 10, vat_rate: 10, co_form: "E", preferential_tax_rate: 5 })
    ],
    "carrier-delivery-orders": [
        base({ id: "cdo_001", shipment_id: "shp_001", carrier_do_no: "CDO-KBI-2026-001", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-16", expired_date: "2026-07-23", release_location: "Hai Phong Port", container_no: "CBHU1234567", local_charge_amount: 0, currency_code: "VND", status: "PENDING", note: "Waiting customs clearance." }),
        base({ id: "cdo_002", shipment_id: "shp_002", carrier_do_no: "CDO-KBI-2026-002", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-02", expired_date: "2026-07-09", release_location: "Hai Phong Port", container_no: "LCL-SHA-002", local_charge_amount: 3500000, currency_code: "VND", status: "RELEASED", note: null }),
        base({ id: "cdo_003", shipment_id: "shp_003", carrier_do_no: "CDO-KBI-2026-003", forwarder_id: "sup_fds_forwarder", issued_date: "2026-06-27", expired_date: "2026-07-04", release_location: "Noi Bai Cargo", container_no: null, local_charge_amount: 1200000, currency_code: "VND", status: "RELEASED", note: null }),
        base({ id: "cdo_004", shipment_id: "shp_004", carrier_do_no: "CDO-KBI-2026-004", forwarder_id: "sup_vn_trucking", issued_date: "2026-07-21", expired_date: "2026-07-25", release_location: "Hai Phong Port", container_no: "TRUCK-004", local_charge_amount: 0, currency_code: "VND", status: "PENDING", note: null }),
        base({ id: "cdo_005", shipment_id: "shp_005", carrier_do_no: "CDO-KBI-2026-005", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-30", expired_date: "2026-08-06", release_location: "Hai Phong Port", container_no: "MSKU7654321", local_charge_amount: 4200000, currency_code: "VND", status: "RELEASED", note: "Released after customs clearance refresh." }),
        base({ id: "cdo_006", shipment_id: "shp_006", carrier_do_no: "CDO-KBI-2026-006", forwarder_id: "sup_fds_forwarder", issued_date: "2026-08-05", expired_date: "2026-08-08", release_location: "Noi Bai Cargo", container_no: null, local_charge_amount: 1800000, currency_code: "VND", status: "ISSUED", note: "Airport cargo release scheduled after customs." }),
        base({ id: "cdo_007", shipment_id: "shp_007", carrier_do_no: "CDO-KBI-2026-007", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-08", expired_date: "2026-07-15", release_location: "Hai Phong CFS", container_no: "LCL-NGB-007", local_charge_amount: 2600000, currency_code: "VND", status: "RELEASED", note: "LCL cargo released from CFS." }),
        base({ id: "cdo_008", shipment_id: "shp_008", carrier_do_no: "CDO-KBI-2026-008", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-22", expired_date: "2026-07-29", release_location: "Hai Phong Port", container_no: "TGBU9876543", local_charge_amount: 4800000, currency_code: "VND", status: "PENDING", note: "Arrival notice received." }),
        base({ id: "cdo_009", shipment_id: "shp_009", carrier_do_no: "CDO-KBI-2026-009", forwarder_id: "sup_vn_trucking", issued_date: "2026-08-14", expired_date: "2026-08-17", release_location: "Kim Binh Factory", container_no: "TRUCK-CB-009", local_charge_amount: 0, currency_code: "VND", status: "RELEASED", note: "Road shipment delivered directly to factory." }),
        base({ id: "cdo_010", shipment_id: "shp_010", carrier_do_no: "CDO-KBI-2026-010", forwarder_id: "sup_fds_forwarder", issued_date: "2026-08-26", expired_date: "2026-09-02", release_location: "Hai Phong CFS", container_no: "LCL-SHA-010", local_charge_amount: 2200000, currency_code: "VND", status: "RELEASED", note: "Released after customs clearance." }),
        base({ id: "cdo_011", shipment_id: "shp_011", carrier_do_no: "CDO-KBI-2026-011", forwarder_id: "sup_fds_forwarder", issued_date: "2026-09-04", expired_date: "2026-09-07", release_location: "Noi Bai Cargo", container_no: null, local_charge_amount: 1700000, currency_code: "VND", status: "ISSUED", note: "Awaiting customs clearance before airport release." }),
        base({ id: "cdo_012", shipment_id: "shp_012", carrier_do_no: "CDO-KBI-2026-012", forwarder_id: "sup_fds_forwarder", issued_date: "2026-09-18", expired_date: "2026-09-25", release_location: "Hai Phong Breakbulk Yard", container_no: null, local_charge_amount: 6400000, currency_code: "VND", status: "PENDING", note: "Oversized cargo requires yard handling order." }),
        base({ id: "cdo_013", shipment_id: "shp_013", carrier_do_no: "CDO-KBI-2026-013", forwarder_id: "sup_fds_forwarder", issued_date: "2026-08-13", expired_date: "2026-08-20", release_location: "Hai Phong Port", container_no: "MRKU2468135", local_charge_amount: 4100000, currency_code: "VND", status: "RELEASED", note: "Released to warehouse transport." }),
        base({ id: "cdo_014", shipment_id: "shp_014", carrier_do_no: "CDO-KBI-2026-014", forwarder_id: "sup_fds_forwarder", issued_date: "2026-08-29", expired_date: "2026-09-01", release_location: "Noi Bai Cargo", container_no: null, local_charge_amount: 2400000, currency_code: "VND", status: "RELEASED", note: "Priority release for high-value air cargo." })
    ],
    "domestic-transport-orders": [
        base({ id: "dto_001", dto_no: "DTO-KBI-2026-001", shipment_id: "shp_001", carrier_delivery_order_id: "cdo_001", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Container Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-17T01:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-17T09:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "QUOTE_CONFIRMED", note: "Ready to dispatch after release." }),
        base({ id: "dto_002", dto_no: "DTO-KBI-2026-002", shipment_id: "shp_002", carrier_delivery_order_id: "cdo_002", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Box Truck", vehicle_plate: "15C-12345", driver_name: "Nguyen Van B", driver_phone: "+84-900-000-002", scheduled_pickup_at: "2026-07-03T01:00:00.000Z", actual_pickup_at: "2026-07-03T01:30:00.000Z", scheduled_delivery_at: "2026-07-03T09:00:00.000Z", actual_delivery_at: "2026-07-03T08:45:00.000Z", pod_document_ref: "POD-002", status: "CLOSED", note: null }),
        base({ id: "dto_003", dto_no: "DTO-KBI-2026-003", shipment_id: "shp_003", carrier_delivery_order_id: "cdo_003", truck_vendor_id: "sup_vn_trucking", origin: "Noi Bai Cargo", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Van", vehicle_plate: "29H-33333", driver_name: "Tran Van C", driver_phone: "+84-900-000-003", scheduled_pickup_at: "2026-06-27T10:00:00.000Z", actual_pickup_at: "2026-06-27T10:20:00.000Z", scheduled_delivery_at: "2026-06-27T14:00:00.000Z", actual_delivery_at: "2026-06-27T13:40:00.000Z", pod_document_ref: "POD-003", status: "POD_RECEIVED", note: null }),
        base({ id: "dto_004", dto_no: "DTO-KBI-2026-004", shipment_id: "shp_004", carrier_delivery_order_id: "cdo_004", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-22T01:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-22T09:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "DRAFT", note: null }),
        base({ id: "dto_005", dto_no: "DTO-KBI-2026-005", shipment_id: "shp_005", carrier_delivery_order_id: "cdo_005", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "20GP Container Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-31T01:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-31T09:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "QUOTE_CONFIRMED", note: "Dispatch after CDO release." }),
        base({ id: "dto_006", dto_no: "DTO-KBI-2026-006", shipment_id: "shp_006", carrier_delivery_order_id: "cdo_006", truck_vendor_id: "sup_vn_trucking", origin: "Noi Bai Cargo", destination: "Kim Binh Factory", warehouse: "KBI Spare Parts Warehouse", vehicle_type: "Van", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-08-05T05:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-08-05T10:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "QUOTE_CONFIRMED", note: "Same-day airport delivery planned." }),
        base({ id: "dto_007", dto_no: "DTO-KBI-2026-007", shipment_id: "shp_007", carrier_delivery_order_id: "cdo_007", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong CFS", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Box Truck", vehicle_plate: "15C-77889", driver_name: "Pham Van D", driver_phone: "+84-900-000-007", scheduled_pickup_at: "2026-07-09T01:00:00.000Z", actual_pickup_at: "2026-07-09T01:20:00.000Z", scheduled_delivery_at: "2026-07-09T09:00:00.000Z", actual_delivery_at: "2026-07-09T08:50:00.000Z", pod_document_ref: "POD-007", status: "CLOSED", note: "Warehouse received full quantity." }),
        base({ id: "dto_008", dto_no: "DTO-KBI-2026-008", shipment_id: "shp_008", carrier_delivery_order_id: "cdo_008", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "40HC Container Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-23T01:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-23T09:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "DRAFT", delayed_days: 3, note: "Waiting for customs clearance." }),
        base({ id: "dto_009", dto_no: "DTO-KBI-2026-009", shipment_id: "shp_009", carrier_delivery_order_id: "cdo_009", truck_vendor_id: "sup_vn_trucking", origin: "Pingxiang Border", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Curtain Side Truck", vehicle_plate: "29C-90909", driver_name: "Le Van E", driver_phone: "+84-900-000-009", scheduled_pickup_at: "2026-08-12T02:00:00.000Z", actual_pickup_at: "2026-08-12T02:10:00.000Z", scheduled_delivery_at: "2026-08-14T09:00:00.000Z", actual_delivery_at: "2026-08-14T08:30:00.000Z", pod_document_ref: "POD-009", status: "CLOSED", note: "Delivered after border clearance." }),
        base({ id: "dto_010", dto_no: "DTO-KBI-2026-010", shipment_id: "shp_010", carrier_delivery_order_id: "cdo_010", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong CFS", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Box Truck", vehicle_plate: "15C-51010", driver_name: "Hoang Van H", driver_phone: "+84-900-000-010", scheduled_pickup_at: "2026-08-27T01:00:00.000Z", actual_pickup_at: "2026-08-27T01:10:00.000Z", scheduled_delivery_at: "2026-08-27T09:00:00.000Z", actual_delivery_at: "2026-08-27T08:55:00.000Z", pod_document_ref: "POD-010", status: "CLOSED", note: "Palletized LCL cargo received." }),
        base({ id: "dto_011", dto_no: "DTO-KBI-2026-011", shipment_id: "shp_011", carrier_delivery_order_id: "cdo_011", truck_vendor_id: "sup_vn_trucking", origin: "Noi Bai Cargo", destination: "Kim Binh Factory", warehouse: "KBI Spare Parts Warehouse", vehicle_type: "Van", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-09-04T06:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-09-04T11:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "QUOTE_CONFIRMED", note: "Dispatch after airport release." }),
        base({ id: "dto_012", dto_no: "DTO-KBI-2026-012", shipment_id: "shp_012", carrier_delivery_order_id: "cdo_012", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Breakbulk Yard", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Flatbed Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-09-19T01:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-09-19T10:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "DRAFT", note: "Needs crane slot before pickup." }),
        base({ id: "dto_013", dto_no: "DTO-KBI-2026-013", shipment_id: "shp_013", carrier_delivery_order_id: "cdo_013", truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "20GP Container Truck", vehicle_plate: "15C-51313", driver_name: "Dang Van K", driver_phone: "+84-900-000-013", scheduled_pickup_at: "2026-08-14T01:00:00.000Z", actual_pickup_at: "2026-08-14T01:30:00.000Z", scheduled_delivery_at: "2026-08-14T09:00:00.000Z", actual_delivery_at: "2026-08-14T09:15:00.000Z", pod_document_ref: "POD-013", status: "CLOSED", note: "Container returned empty same day." }),
        base({ id: "dto_014", dto_no: "DTO-KBI-2026-014", shipment_id: "shp_014", carrier_delivery_order_id: "cdo_014", truck_vendor_id: "sup_vn_trucking", origin: "Noi Bai Cargo", destination: "Kim Binh Factory", warehouse: "KBI Secure Cage", vehicle_type: "Secure Van", vehicle_plate: "29H-51414", driver_name: "Bui Van M", driver_phone: "+84-900-000-014", scheduled_pickup_at: "2026-08-29T09:00:00.000Z", actual_pickup_at: "2026-08-29T09:20:00.000Z", scheduled_delivery_at: "2026-08-29T13:00:00.000Z", actual_delivery_at: "2026-08-29T12:45:00.000Z", pod_document_ref: "POD-014", status: "POD_RECEIVED", note: "Received into secure cage pending QC." }),
        base({ id: "dto_015", dto_no: "DTO-KBI-2026-015", shipment_id: "shp_008", carrier_delivery_order_id: "cdo_008", truck_vendor_id: "sup_haiphong_trucking", origin: "Hai Phong Port", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "40HC Container Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-23T03:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-23T11:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "DRAFT", delayed_days: 3, note: "Second truck run for the second 40HC container." }),
        base({ id: "dto_016", dto_no: "DTO-KBI-2026-016", shipment_id: "shp_002", carrier_delivery_order_id: null, truck_vendor_id: "sup_vn_trucking", origin: "Hai Phong CFS", destination: "Kim Binh Factory", warehouse: "KBI Main Warehouse", vehicle_type: "Box Truck", vehicle_plate: null, driver_name: null, driver_phone: null, scheduled_pickup_at: "2026-07-09T02:00:00.000Z", actual_pickup_at: null, scheduled_delivery_at: "2026-07-09T10:00:00.000Z", actual_delivery_at: null, pod_document_ref: null, status: "QUOTE_CONFIRMED", note: "Consolidated LCL pickup for SHP-002 + SHP-007 (same POD VNHPH)." })
    ],
    "domestic-transport-order-lines": [
        base({ id: "dto_line_001", domestic_transport_order_id: "dto_001", purchase_order_line_id: "po_line_002", po_lot_id: "lot_003", item_id: "item_003", qty: 25, unit: "SET", sort_order: 1 }),
        base({ id: "dto_line_002", domestic_transport_order_id: "dto_002", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_003", domestic_transport_order_id: "dto_003", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty: 2, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_004", domestic_transport_order_id: "dto_004", purchase_order_line_id: "po_line_004", po_lot_id: "lot_010", item_id: "item_002", qty: 100, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_005", domestic_transport_order_id: "dto_005", purchase_order_line_id: "po_line_005", po_lot_id: "lot_005", item_id: "item_005", qty: 12, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_006", domestic_transport_order_id: "dto_006", purchase_order_line_id: "po_line_006", po_lot_id: "lot_006", item_id: "item_006", qty: 30, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_007", domestic_transport_order_id: "dto_007", purchase_order_line_id: "po_line_007", po_lot_id: "lot_007", item_id: "item_007", qty: 240, unit: "SET", sort_order: 1 }),
        base({ id: "dto_line_008", domestic_transport_order_id: "dto_008", purchase_order_line_id: "po_line_008", po_lot_id: "lot_008", item_id: "item_008", qty: 400, unit: "KIT", sort_order: 1 }),
        base({ id: "dto_line_009", domestic_transport_order_id: "dto_009", purchase_order_line_id: "po_line_009", po_lot_id: "lot_009", item_id: "item_009", qty: 18, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_010", domestic_transport_order_id: "dto_010", purchase_order_line_id: "po_line_010", po_lot_id: "lot_011", item_id: "item_010", qty: 120, unit: "KIT", sort_order: 1 }),
        base({ id: "dto_line_011", domestic_transport_order_id: "dto_011", purchase_order_line_id: "po_line_011", po_lot_id: "lot_012", item_id: "item_011", qty: 45, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_012", domestic_transport_order_id: "dto_012", purchase_order_line_id: "po_line_012", po_lot_id: "lot_013", item_id: "item_012", qty: 300, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_013", domestic_transport_order_id: "dto_013", purchase_order_line_id: "po_line_013", po_lot_id: "lot_014", item_id: "item_013", qty: 600, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_014", domestic_transport_order_id: "dto_014", purchase_order_line_id: "po_line_014", po_lot_id: "lot_015", item_id: "item_014", qty: 20, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_015", domestic_transport_order_id: "dto_015", purchase_order_line_id: "po_line_008", po_lot_id: "lot_008", item_id: "item_008", qty: 400, unit: "KIT", sort_order: 1 }),
        base({ id: "dto_line_016", domestic_transport_order_id: "dto_016", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_017", domestic_transport_order_id: "dto_016", purchase_order_line_id: "po_line_007", po_lot_id: "lot_007", item_id: "item_007", qty: 240, unit: "SET", sort_order: 2 })
    ],
    "shipment-dto-links": [
        base({ id: "sdl_001", shipment_id: "shp_001", dto_id: "dto_001" }),
        base({ id: "sdl_002", shipment_id: "shp_002", dto_id: "dto_002" }),
        base({ id: "sdl_003", shipment_id: "shp_003", dto_id: "dto_003" }),
        base({ id: "sdl_004", shipment_id: "shp_004", dto_id: "dto_004" }),
        base({ id: "sdl_005", shipment_id: "shp_005", dto_id: "dto_005" }),
        base({ id: "sdl_006", shipment_id: "shp_006", dto_id: "dto_006" }),
        base({ id: "sdl_007", shipment_id: "shp_007", dto_id: "dto_007" }),
        base({ id: "sdl_008", shipment_id: "shp_008", dto_id: "dto_008" }),
        base({ id: "sdl_009", shipment_id: "shp_009", dto_id: "dto_009" }),
        base({ id: "sdl_010", shipment_id: "shp_010", dto_id: "dto_010" }),
        base({ id: "sdl_011", shipment_id: "shp_011", dto_id: "dto_011" }),
        base({ id: "sdl_012", shipment_id: "shp_012", dto_id: "dto_012" }),
        base({ id: "sdl_013", shipment_id: "shp_013", dto_id: "dto_013" }),
        base({ id: "sdl_014", shipment_id: "shp_014", dto_id: "dto_014" }),
        base({ id: "sdl_015", shipment_id: "shp_008", dto_id: "dto_015" }),
        base({ id: "sdl_016", shipment_id: "shp_002", dto_id: "dto_016" }),
        base({ id: "sdl_017", shipment_id: "shp_007", dto_id: "dto_016" })
    ]
};

const itemWeightKg = {
    item_001: 820,
    item_002: 0.45,
    item_003: 145,
    item_004: 58,
    item_005: 18,
    item_006: 7,
    item_007: 0.85,
    item_008: 0.18,
    item_009: 32,
    item_010: 1.4,
    item_011: 9.5,
    item_012: 2.2,
    item_013: 0.55,
    item_014: 3.8
};

files["shipments"] = enrichShipmentTimeline(files);
files["domestic-transport-orders"] = enrichDomesticTransportTimeline(files);
files["purchase-orders"] = enrichPurchaseOrders(files);
files["po-lot-lines"] = enrichPoLotLines(files);
files["purchase-order-lines"] = enrichPurchaseOrderLines(files);
normalizeTransportModeReferences(files);

const screenFiles = buildScreenFiles(files);

export async function seedMockData() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(screensDir, { recursive: true });

    for (const [name, records] of Object.entries(files)) {
        await fs.writeFile(path.join(dataDir, `${name}.json`), `${JSON.stringify(records, null, 2)}\n`, "utf8");
    }

    for (const [name, screen] of Object.entries(screenFiles)) {
        await fs.writeFile(path.join(screensDir, `${name}.json`), `${JSON.stringify(screen, null, 2)}\n`, "utf8");
    }

    const reseedSummary = await reseedMasterData();

    return [
        ...Object.keys(files),
        ...Object.keys(screenFiles).map((name) => `screens/${name}`),
        ...Object.keys(reseedSummary.collections).map((name) => `reseed/${name}`)
    ];
}

if (process.argv[1] === scriptPath) {
    const seededCollections = await seedMockData();
    console.log(`Seeded ${seededCollections.length} mock-data collections.`);
}

function buildScreenFiles(seedFiles) {
    const purchaseOrdersById = Object.fromEntries(seedFiles["purchase-orders"].map((purchaseOrder) => [purchaseOrder.id, purchaseOrder]));
    const taskTemplatesById = Object.fromEntries((seedFiles["task-templates"] || []).map((template) => [template.id, template]));
    const rawItems = [
        taskScreenItem({
            id: "task_001",
            task_no: "TASK-001",
            task_name: "Confirm supplier cargo ready date",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "SUPPLIER_CONFIRMATION",
            role: "BUYER",
            assignee: { id: "user_buyer_001", name: "Nguyen Van A", department: "Procurement" },
            status: "PENDING",
            priority: "HIGH",
            due_at: "2026-07-01T17:00:00+07:00",
            progress: 0,
            note: "Supplier needs to confirm cargo ready date before LOT planning."
        }),
        taskScreenItem({
            id: "task_002",
            task_no: "TASK-002",
            task_name: "Review default LOT allocation",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "LOT_PLANNING",
            role: "LOGISTICS_PLANNER",
            assignee: { id: "user_log_001", name: "Tran Minh", department: "Logistics" },
            status: "IN_PROGRESS",
            priority: "HIGH",
            due_at: "2026-07-02T17:00:00+07:00",
            progress: 45,
            note: "Check whether the default LOT should be split into multiple cargo-ready batches."
        }),
        taskScreenItem({
            id: "task_003",
            task_no: "TASK-003",
            task_name: "Create internal delivery order",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "INTERNAL_DO",
            role: "LOGISTICS_PLANNER",
            assignee: { id: "user_log_002", name: "Le Hoai", department: "Logistics" },
            status: "PENDING",
            priority: "MEDIUM",
            due_at: "2026-07-03T17:00:00+07:00",
            progress: 0,
            note: "Create internal DO after LOT allocation is confirmed."
        }),
        taskScreenItem({
            id: "task_004",
            task_no: "TASK-004",
            task_name: "Request freight quotation",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "QUOTATION",
            role: "PIC_MANAGER",
            assignee: { id: "user_pic_001", name: "Pham Quang", department: "Logistics" },
            status: "BLOCKED",
            priority: "HIGH",
            due_at: "2026-07-04T12:00:00+07:00",
            progress: 20,
            blocked_reason: "Waiting for confirmed cargo ready date.",
            note: "Forwarder quotation can start after supplier confirmation."
        }),
        taskScreenItem({
            id: "task_005",
            task_no: "TASK-005",
            task_name: "Track shipment booking",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "SHIPMENT",
            role: "PORT_OFFICER",
            assignee: { id: "user_port_001", name: "Hoang Nam", department: "Port Ops" },
            status: "PENDING",
            priority: "MEDIUM",
            due_at: "2026-07-06T17:00:00+07:00",
            progress: 0,
            note: "Track booking and BL/AWB progress once shipment is created."
        }),
        taskScreenItem({
            id: "task_006",
            task_no: "TASK-006",
            task_name: "Prepare customs declaration",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "CUSTOMS",
            role: "CUSTOMS_OFFICER",
            assignee: { id: "user_customs_001", name: "Quoc Bao", department: "Customs" },
            status: "PENDING",
            priority: "MEDIUM",
            due_at: "2026-07-08T17:00:00+07:00",
            progress: 0,
            note: "Prepare HS code and invoice data after shipment documents are available."
        }),
        taskScreenItem({
            id: "task_007",
            task_no: "TASK-007",
            task_name: "Collect carrier delivery order",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "CARRIER_DO",
            role: "PORT_OFFICER",
            assignee: { id: "user_port_002", name: "Gia Huy", department: "Port Ops" },
            status: "PENDING",
            priority: "LOW",
            due_at: "2026-07-10T12:00:00+07:00",
            progress: 0,
            note: "Collect carrier DO after customs clearance."
        }),
        taskScreenItem({
            id: "task_008",
            task_no: "TASK-008",
            task_name: "Dispatch domestic transport order",
            ref_id: "po_001",
            ref_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
            stage: "DTO",
            role: "WAREHOUSE_STAFF",
            assignee: { id: "user_wh_001", name: "Minh Duc", department: "Warehouse" },
            status: "PENDING",
            priority: "MEDIUM",
            due_at: "2026-07-11T17:00:00+07:00",
            progress: 0,
            note: "Dispatch truck after carrier DO release."
        })
    ];
    const items = rawItems.map((item) => applyTaskTemplate(item, taskTemplatesById));
    const poTaskScreen = buildPoTaskScreen(purchaseOrdersById.po_001, items);

    return {
        "task-list": {
            items,
            summary: taskScreenSummary(items),
            filters: {
                stages: taskStages(),
                statuses: ["PENDING", "IN_PROGRESS", "WAITING", "BLOCKED", "COMPLETED", "CANCELLED"],
                priorities: ["LOW", "MEDIUM", "HIGH", "URGENT"]
            }
        },
        "task-detail-task_001": {
            ...items[0],
            description: "Screen-ready mock detail for confirming supplier cargo readiness before the PO can move through LOT planning.",
            related_records: {
                purchase_order: {
                    id: "po_001",
                    po_no: purchaseOrdersById.po_001?.po_no || "PO-KBI-2026-001",
                    status: purchaseOrdersById.po_001?.status || "CONFIRMED"
                }
            },
            activity: [
                {
                    event_code: "TASK_CREATED",
                    event_at: "2026-06-12T02:00:00.000Z",
                    note: "Mock task created for supplier confirmation stage."
                }
            ]
        },
        "po-tasks-po_001": poTaskScreen
    };
}

function taskScreenItem(record) {
    return {
        create_at: now,
        update_at: now,
        delete_at: null,
        is_delete: false,
        ref_type: "PURCHASE_ORDER",
        completed_at: null,
        blocked_reason: null,
        task_template_id: null,
        milestone_code: null,
        department: null,
        sla_hours: null,
        sla_text: null,
        related_documents: null,
        template_group_code: null,
        template_group_name: null,
        ...record
    };
}

function applyTaskTemplate(item, templatesById) {
    // Runtime PO-stage task -> SOP Task Template (master data) linkage.
    // Each operational task is mapped to the closest SOP task template so the Tasks
    // screen can surface milestone / department / SLA / required documents from the
    // canonical master-data catalog instead of duplicating that knowledge.
    const links = {
        task_001: "tt_005", // Supplier confirmation -> Gui PO & theo doi xac nhan NCC
        task_002: "tt_006", // LOT planning          -> Cap nhat trang thai PO theo tien do NCC
        task_003: "tt_003", // Internal DO           -> Xac nhan dich vu & ban giao Ops
        task_004: "tt_002", // Quotation             -> Chuan bi & gui bao gia (Quotation)
        task_005: "tt_007", // Shipment booking      -> Booking tau/chuyen bay voi Carrier (MS1)
        task_006: "tt_013", // Customs declaration   -> Chuan bi ho so thong quan (MS5)
        task_007: "tt_015", // Carrier DO / release  -> Theo doi & hoan tat thong quan (MS7)
        task_008: "tt_016"  // DTO dispatch          -> Van chuyen trucking tu cang ve kho KBI
    };
    const templateId = links[item.id] || null;
    const template = templateId ? templatesById[templateId] : null;

    return {
        ...item,
        task_template_id: templateId,
        milestone_code: template ? template.milestone_code ?? null : null,
        department: template ? template.department ?? null : null,
        sla_hours: template ? template.sla_hours ?? null : null,
        sla_text: template ? template.sla_text ?? null : null,
        related_documents: template ? template.related_documents ?? null : null,
        template_group_code: template ? template.group_code ?? null : null,
        template_group_name: template ? template.group_name ?? null : null
    };
}

function buildPoTaskScreen(purchaseOrder, items) {
    return {
        purchase_order: {
            id: purchaseOrder?.id || "po_001",
            po_no: purchaseOrder?.po_no || "PO-KBI-2026-001",
            status: purchaseOrder?.status || "CONFIRMED"
        },
        task_groups: taskStages().map((stage) => ({
            stage,
            tasks: items.filter((task) => task.ref_type === "PURCHASE_ORDER" && task.ref_id === "po_001" && task.stage === stage)
        }))
    };
}

function taskStages() {
    return [
        "SUPPLIER_CONFIRMATION",
        "LOT_PLANNING",
        "INTERNAL_DO",
        "QUOTATION",
        "SHIPMENT",
        "CUSTOMS",
        "CARRIER_DO",
        "DTO"
    ];
}

function taskScreenSummary(items) {
    return {
        total: items.length,
        pending: items.filter((task) => task.status === "PENDING").length,
        in_progress: items.filter((task) => task.status === "IN_PROGRESS").length,
        blocked: items.filter((task) => task.status === "BLOCKED").length,
        completed: items.filter((task) => task.status === "COMPLETED").length
    };
}

function enrichPurchaseOrderLines(seedFiles) {
    const itemsById = Object.fromEntries(seedFiles["item-master"].map((item) => [item.id, item]));
    const purchaseOrdersById = Object.fromEntries(seedFiles["purchase-orders"].map((purchaseOrder) => [purchaseOrder.id, purchaseOrder]));
    const profilesByItemId = new Map();

    for (const profile of seedFiles["item-customs-profiles"]) {
        if (!profilesByItemId.has(profile.item_id)) {
            profilesByItemId.set(profile.item_id, profile);
        }
    }

    return seedFiles["purchase-order-lines"].map((line) => {
        const item = itemsById[line.item_id];
        const purchaseOrder = purchaseOrdersById[line.purchase_order_id];
        const qtyConfirmed = sumBy(seedFiles["purchase-order-confirmation-lines"], (confirmationLine) => (
            confirmationLine.purchase_order_line_id === line.id ? confirmationLine.confirmed_qty : 0
        ));
        const qtyLotted = sumBy(seedFiles["po-lot-lines"], (lotLine) => (
            lotLine.purchase_order_line_id === line.id ? lotLine.qty_lotted : 0
        ));
        const qtyShipped = sumBy(seedFiles["shipment-lines"], (shipmentLine) => (
            shipmentLine.purchase_order_line_id === line.id ? shipmentLine.qty_shipped : 0
        ));
        const qtyReceived = sumBy(seedFiles["domestic-transport-order-lines"], (transportLine) => {
            if (transportLine.purchase_order_line_id !== line.id) {
                return 0;
            }

            const transportOrder = seedFiles["domestic-transport-orders"].find((row) => row.id === transportLine.domestic_transport_order_id);
            return transportOrder?.actual_delivery_at ? transportLine.qty : 0;
        });

        return {
            item_customs_profile_id: profilesByItemId.get(line.item_id)?.id || null,
            item_description: item?.item_name || null,
            gross_weight_kg: roundNumber(Number(line.qty_ordered || 0) * Number(itemWeightKg[line.item_id] || 0)),
            qty_confirmed: qtyConfirmed,
            qty_lotted: qtyLotted,
            qty_shipped: qtyShipped,
            qty_received: qtyReceived,
            expected_eta_line: purchaseOrder?.expected_eta || null,
            notes: null,
            ...line
        };
    });
}

function enrichPoLotLines(seedFiles) {
    return seedFiles["po-lot-lines"].map((line) => ({
        notes: null,
        ...line
    }));
}

function enrichShipmentTimeline(seedFiles) {
    return seedFiles["shipments"].map((shipment) => ({
        ...shipment,
        atd: shipment.atd || shipment.etd || null,
        ata: shipment.ata || shipment.eta || null
    }));
}

function enrichDomesticTransportTimeline(seedFiles) {
    return seedFiles["domestic-transport-orders"].map((order) => ({
        ...order,
        actual_pickup_at: order.actual_pickup_at || order.scheduled_pickup_at || null,
        actual_delivery_at: order.actual_delivery_at || order.scheduled_delivery_at || null
    }));
}

function enrichPurchaseOrders(seedFiles) {
    const deliveryOrdersByPoId = groupBy(seedFiles["delivery-orders"], "purchase_order_id");
    const shipmentsByDeliveryOrderId = groupBy(seedFiles["shipments"], "delivery_order_id");
    const domesticTransportOrdersByShipmentId = groupBy(seedFiles["domestic-transport-orders"], "shipment_id");
    const transportModeIdByCode = Object.fromEntries(
        seedFiles["transport-modes"].map((mode) => [mode.mode_code, mode.id])
    );

    return seedFiles["purchase-orders"].map((purchaseOrder, index) => {
        const deliveryOrders = deliveryOrdersByPoId.get(purchaseOrder.id) || [];
        const shipments = deliveryOrders.flatMap((deliveryOrder) => shipmentsByDeliveryOrderId.get(deliveryOrder.id) || []);
        const firstShipment = firstByDate(shipments, "etd");
        const domesticTransportOrders = shipments.flatMap((shipment) => domesticTransportOrdersByShipmentId.get(shipment.id) || []);
        const firstTransportOrder = firstByDate(domesticTransportOrders, "scheduled_delivery_at");
        const expectedWarehouseEta = firstTransportOrder?.scheduled_delivery_at || toWarehouseIso(purchaseOrder.expected_eta, 9);

        return {
            ...purchaseOrder,
            contract_no: purchaseOrder.contract_no || `KBI-CN-2026-${String(index + 1).padStart(3, "0")}`,
            transport_mode_id: normalizeTransportModeId(
                purchaseOrder.transport_mode_id || transportModeIdByCode[normalizeShipmentMode(firstShipment?.mode)] || "tm_sea"
            ),
            actual_etd: purchaseOrder.actual_etd || firstShipment?.atd || purchaseOrder.expected_etd || null,
            actual_eta: purchaseOrder.actual_eta || firstShipment?.ata || purchaseOrder.expected_eta || null,
            expected_warehouse_eta: purchaseOrder.expected_warehouse_eta || expectedWarehouseEta,
            actual_warehouse_ata: purchaseOrder.actual_warehouse_ata || firstTransportOrder?.actual_delivery_at || expectedWarehouseEta
        };
    });
}

function normalizeTransportModeReferences(seedFiles) {
    for (const rows of Object.values(seedFiles)) {
        if (!Array.isArray(rows)) {
            continue;
        }

        for (const row of rows) {
            if (row.transport_mode_id) {
                row.transport_mode_id = normalizeTransportModeId(row.transport_mode_id);
            }

            if (Array.isArray(row.transport_mode_ids)) {
                row.transport_mode_ids = Array.from(new Set(row.transport_mode_ids.map(normalizeTransportModeId)));
            }

            if (row.default_transport_mode_id) {
                row.default_transport_mode_id = normalizeTransportModeId(row.default_transport_mode_id);
            }
        }
    }
}

function normalizeTransportModeId(value) {
    const map = {
        tm_sea_fcl: "tm_sea",
        tm_sea_lcl: "tm_sea",
        tm_sea_breakbulk: "tm_sea",
        tm_trucking: "tm_road",
        tm_road_container: "tm_road",
        tm_road_box: "tm_road",
        tm_road_van: "tm_road"
    };
    return map[value] || value;
}

function normalizeShipmentMode(value) {
    const normalized = String(value || "").toUpperCase();

    if (normalized.includes("AIR")) return "AIR";
    if (normalized.includes("ROAD") || normalized.includes("TRUCK")) return "ROAD";
    if (normalized.includes("RAIL")) return "RAIL";
    if (normalized.includes("SEA")) return "SEA";
    return normalized;
}

function groupBy(rows, field) {
    const groups = new Map();

    for (const row of rows) {
        const value = row[field];
        if (!groups.has(value)) {
            groups.set(value, []);
        }
        groups.get(value).push(row);
    }

    return groups;
}

function firstByDate(rows, field) {
    return [...rows]
        .filter((row) => row[field])
        .sort((left, right) => new Date(left[field]).getTime() - new Date(right[field]).getTime())[0] || null;
}

function toWarehouseIso(date, hour) {
    if (!date) {
        return null;
    }

    return `${date.slice(0, 10)}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

function sumBy(rows, selector) {
    return rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
}

function roundNumber(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function buildMilestones() {
    const codes = [
        "BOOKING_CONFIRMED",
        "CARGO_READY",
        "PICKED_UP",
        "BL_ISSUED",
        "GATE_IN_POL",
        "ATD",
        "CUSTOMS_DRAFT",
        "ARRIVAL_NOTICE",
        "CUSTOMS_CLEARED",
        "DELIVERED"
    ];
    const doneByShipment = {
        shp_001: 1,
        shp_002: 9,
        shp_003: 10,
        shp_004: 1,
        shp_005: 9,
        shp_006: 6,
        shp_007: 9,
        shp_008: 8,
        shp_009: 10,
        shp_010: 9,
        shp_011: 6,
        shp_012: 1,
        shp_013: 10,
        shp_014: 10
    };
    let sequence = 1;
    return Object.keys(doneByShipment).flatMap((shipmentId) => codes.map((code, index) => base({
        id: `ms_${String(sequence++).padStart(3, "0")}`,
        shipment_id: shipmentId,
        milestone_code: code,
        milestone_name: code.replaceAll("_", " "),
        status: index < doneByShipment[shipmentId] ? "DONE" : "PENDING",
        planned_at: null,
        actual_at: index < doneByShipment[shipmentId] ? `2026-06-${String(20 + index).padStart(2, "0")}T02:00:00.000Z` : null,
        sort_order: index + 1
    })));
}
