import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = fileURLToPath(import.meta.url);
const dataDir = path.join(rootDir, "mock-data");
const screensDir = path.join(dataDir, "screens");
const now = "2026-06-12T00:00:00.000Z";

const base = (record) => ({
    create_at: now,
    update_at: now,
    delete_at: null,
    is_delete: false,
    ...record
});

const files = {
    "currencies": [
        base({ id: "cur_vnd", currency_code: "VND", currency_name: "Vietnam Dong", symbol: "d", exchange_rate_to_vnd: 1, is_active: true }),
        base({ id: "cur_usd", currency_code: "USD", currency_name: "US Dollar", symbol: "$", exchange_rate_to_vnd: 25000, is_active: true }),
        base({ id: "cur_cny", currency_code: "CNY", currency_name: "Chinese Yuan", symbol: "CNY", exchange_rate_to_vnd: 3500, is_active: true }),
        base({ id: "cur_eur", currency_code: "EUR", currency_name: "Euro", symbol: "EUR", exchange_rate_to_vnd: 27000, is_active: true })
    ],
    "incoterms": [
        base({ id: "inc_exw", incoterm_code: "EXW", incoterm_name: "Ex Works", description: "Supplier makes goods available at origin.", is_active: true }),
        base({ id: "inc_fob", incoterm_code: "FOB", incoterm_name: "Free On Board", description: "Supplier loads goods at port of loading.", is_active: true }),
        base({ id: "inc_cif", incoterm_code: "CIF", incoterm_name: "Cost Insurance Freight", description: "Supplier arranges freight and insurance.", is_active: true }),
        base({ id: "inc_ddp", incoterm_code: "DDP", incoterm_name: "Delivered Duty Paid", description: "Supplier delivers duty paid.", is_active: true })
    ],
    "transport-modes": [
        base({ id: "tm_sea_fcl", mode_code: "SEA_FCL", mode_name: "Sea FCL", is_active: true }),
        base({ id: "tm_sea_lcl", mode_code: "SEA_LCL", mode_name: "Sea LCL", is_active: true }),
        base({ id: "tm_air", mode_code: "AIR", mode_name: "Air Freight", is_active: true }),
        base({ id: "tm_trucking", mode_code: "TRUCKING", mode_name: "Domestic Trucking", is_active: true }),
        base({ id: "tm_sea_breakbulk", mode_code: "SEA_BREAKBULK", mode_name: "Sea Breakbulk", is_active: true })
    ],
    "suppliers": [
        base({ id: "sup_sdec", supplier_code: "SDEC", supplier_name: "SDEC Supplier", supplier_type: "MANUFACTURER", country: "CN", contact_name: "Li Wei", email: "sales@sdec.example", phone: "+86-21-1000-0001", is_active: true }),
        base({ id: "sup_shanghai_oem", supplier_code: "SH-OEM", supplier_name: "Shanghai OEM Parts", supplier_type: "MANUFACTURER", country: "CN", contact_name: "Chen Ming", email: "export@shoem.example", phone: "+86-21-1000-0002", is_active: true }),
        base({ id: "sup_fds_forwarder", supplier_code: "FDS-FWD", supplier_name: "FDS Forwarder", supplier_type: "FORWARDER", country: "VN", contact_name: "FDS Ops", email: "ops@fds.example", phone: "+84-24-1000-0003", is_active: true }),
        base({ id: "sup_vn_trucking", supplier_code: "VN-TRK", supplier_name: "Vietnam Trucking Vendor", supplier_type: "TRUCKING", country: "VN", contact_name: "Nguyen Van An", email: "dispatch@vntrucking.example", phone: "+84-24-1000-0004", is_active: true })
    ],
    "supplier-transport-modes": [
        base({ id: "stm_001", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_sea_fcl", service_level: "STANDARD", is_active: true }),
        base({ id: "stm_002", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_sea_lcl", service_level: "STANDARD", is_active: true }),
        base({ id: "stm_003", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_air", service_level: "EXPRESS", is_active: true }),
        base({ id: "stm_004", supplier_id: "sup_vn_trucking", transport_mode_id: "tm_trucking", service_level: "LOCAL", is_active: true }),
        base({ id: "stm_005", supplier_id: "sup_fds_forwarder", transport_mode_id: "tm_sea_breakbulk", service_level: "OVERSIZED", is_active: true })
    ],
    "item-groups": [
        base({ id: "grp_engine", group_code: "ENGINE", group_name: "Engine Parts", is_active: true }),
        base({ id: "grp_electrical", group_code: "ELECTRICAL", group_name: "Electrical Control Parts", is_active: true }),
        base({ id: "grp_hydraulic", group_code: "HYDRAULIC", group_name: "Hydraulic Parts", is_active: true }),
        base({ id: "grp_consumables", group_code: "CONSUMABLE", group_name: "Consumables", is_active: true })
    ],
    "item-master": [
        base({ id: "item_001", item_code: "ENG-001", item_name: "Diesel Engine Assembly", item_group_id: "grp_engine", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_002", item_code: "FLT-001", item_name: "Oil Filter Element", item_group_id: "grp_consumables", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_003", item_code: "ELC-001", item_name: "Control Cabinet", item_group_id: "grp_electrical", unit: "SET", origin_country: "CN", is_active: true }),
        base({ id: "item_004", item_code: "HYD-001", item_name: "Hydraulic Pump", item_group_id: "grp_hydraulic", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_005", item_code: "ENG-TRB-002", item_name: "Turbocharger Cartridge", item_group_id: "grp_engine", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_006", item_code: "ELC-ALT-001", item_name: "Alternator Assembly 24V", item_group_id: "grp_electrical", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_007", item_code: "ENG-INJ-004", item_name: "Fuel Injector Nozzle Set", item_group_id: "grp_engine", unit: "SET", origin_country: "CN", is_active: true }),
        base({ id: "item_008", item_code: "HYD-SEAL-010", item_name: "Hydraulic Seal Kit", item_group_id: "grp_hydraulic", unit: "KIT", origin_country: "CN", is_active: true }),
        base({ id: "item_009", item_code: "ENG-RAD-003", item_name: "Radiator Core Assembly", item_group_id: "grp_engine", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_010", item_code: "ENG-GSK-011", item_name: "Engine Overhaul Gasket Kit", item_group_id: "grp_engine", unit: "KIT", origin_country: "CN", is_active: true }),
        base({ id: "item_011", item_code: "ELC-STR-002", item_name: "Starter Motor 24V", item_group_id: "grp_electrical", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_012", item_code: "HYD-HOSE-020", item_name: "High Pressure Hydraulic Hose Assembly", item_group_id: "grp_hydraulic", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_013", item_code: "FLT-FWS-006", item_name: "Fuel Water Separator Filter", item_group_id: "grp_consumables", unit: "PCS", origin_country: "CN", is_active: true }),
        base({ id: "item_014", item_code: "ELC-ECU-005", item_name: "Engine ECU Controller Module", item_group_id: "grp_electrical", unit: "PCS", origin_country: "CN", is_active: true })
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
    "purchase-orders": [
        base({ id: "po_001", po_no: "PO-KBI-2026-001", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, 70% before shipment", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", expected_etd: "2026-07-03", expected_eta: "2026-07-10", notes: "Multi-item split LOT demo PO for drag/drop testing." }),
        base({ id: "po_002", po_no: "PO-KBI-2026-002", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_cif", payment_term: "Net 30", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-08", expected_eta: "2026-07-16", notes: "Ready cargo from Shanghai OEM." }),
        base({ id: "po_003", po_no: "PO-KBI-2026-003", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-06-24", expected_eta: "2026-07-02", notes: "Already shipped demo." }),
        base({ id: "po_004", po_no: "PO-KBI-2026-004", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 45", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-07-18", expected_eta: "2026-07-26", notes: "Confirmed, pending LOT planning." }),
        base({ id: "po_005", po_no: "PO-KBI-2026-005", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, balance before ETD", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-22", expected_eta: "2026-07-30", notes: "Urgent turbocharger replenishment for service stock." }),
        base({ id: "po_006", po_no: "PO-KBI-2026-006", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 45 after invoice", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-08-04", expected_eta: "2026-08-05", notes: "Air freight for alternator shortage." }),
        base({ id: "po_007", po_no: "PO-KBI-2026-007", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_cif", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-06-30", expected_eta: "2026-07-08", notes: "Fuel injector shipment already on water." }),
        base({ id: "po_008", po_no: "PO-KBI-2026-008", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "Net 30", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-07-14", expected_eta: "2026-07-22", notes: "Hydraulic seal kits for monthly maintenance demand." }),
        base({ id: "po_009", po_no: "PO-KBI-2026-009", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_cif", payment_term: "20% deposit, 80% against BL copy", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED", expected_etd: "2026-08-12", expected_eta: "2026-08-14", notes: "Cross-border trucking option for radiator assemblies." }),
        base({ id: "po_010", po_no: "PO-KBI-2026-010", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "30% deposit, balance before vessel departure", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-08-18", expected_eta: "2026-08-26", notes: "Gasket kits shipped by LCL for overhaul campaign." }),
        base({ id: "po_011", po_no: "PO-KBI-2026-011", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_exw", payment_term: "Net 30 after pickup confirmation", currency_code: "CNY", exchange_rate: 3500, status: "CONFIRMED", expected_etd: "2026-09-03", expected_eta: "2026-09-04", notes: "Starter motors moved by air due to urgent service demand." }),
        base({ id: "po_012", po_no: "PO-KBI-2026-012", supplier_id: "sup_sdec", po_type: "IMPORT", incoterm_id: "inc_fob", payment_term: "LC at sight", currency_code: "USD", exchange_rate: 25000, status: "READY_TO_SHIP", expected_etd: "2026-09-08", expected_eta: "2026-09-18", notes: "Oversized hydraulic hose assemblies booked as breakbulk." }),
        base({ id: "po_013", po_no: "PO-KBI-2026-013", supplier_id: "sup_shanghai_oem", po_type: "IMPORT", incoterm_id: "inc_cif", payment_term: "Net 45", currency_code: "USD", exchange_rate: 25000, status: "SHIPPED", expected_etd: "2026-08-05", expected_eta: "2026-08-13", notes: "Fuel water separator filters delivered to replenish maintenance stock." }),
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
        base({ id: "lot_001", purchase_order_id: "po_001", lot_no: "LOT-001", lot_name: "Priority Service Lot", status: "PLANNED", planned_cargo_ready_date: "2026-07-01", planned_etd: "2026-07-03", planned_eta: "2026-07-10", sort_order: 1, notes: "Mixed urgent service parts for drag/drop demo." }),
        base({ id: "lot_002", purchase_order_id: "po_001", lot_no: "LOT-002", lot_name: "Balance Replenishment Lot", status: "PLANNED", planned_cargo_ready_date: "2026-07-02", planned_etd: "2026-07-05", planned_eta: "2026-07-12", sort_order: 2, notes: "Balance stock and later-ready kits for split demo." }),
        base({ id: "lot_003", purchase_order_id: "po_002", lot_no: "LOT-003", lot_name: "Shanghai OEM Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-06", planned_etd: "2026-07-08", planned_eta: "2026-07-16", sort_order: 1, notes: null }),
        base({ id: "lot_004", purchase_order_id: "po_003", lot_no: "LOT-004", lot_name: "Shipped Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-06-20", planned_etd: "2026-06-24", planned_eta: "2026-07-02", sort_order: 1, notes: null }),
        base({ id: "lot_010", purchase_order_id: "po_004", lot_no: "LOT-010", lot_name: "Filter Domestic Transfer Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-15", planned_etd: "2026-07-20", planned_eta: "2026-07-21", sort_order: 1, notes: "Partial release for urgent maintenance stock." }),
        base({ id: "lot_005", purchase_order_id: "po_005", lot_no: "LOT-005", lot_name: "Turbocharger FCL Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-20", planned_etd: "2026-07-22", planned_eta: "2026-07-30", sort_order: 1, notes: "Two crates, keep dry." }),
        base({ id: "lot_006", purchase_order_id: "po_006", lot_no: "LOT-006", lot_name: "Alternator Air Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-04", planned_eta: "2026-08-05", sort_order: 1, notes: "Air freight due to low inventory." }),
        base({ id: "lot_007", purchase_order_id: "po_007", lot_no: "LOT-007", lot_name: "Injector LCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-06-28", planned_etd: "2026-06-30", planned_eta: "2026-07-08", sort_order: 1, notes: "Consolidated LCL cargo." }),
        base({ id: "lot_008", purchase_order_id: "po_008", lot_no: "LOT-008", lot_name: "Seal Kit FCL Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-07-12", planned_etd: "2026-07-14", planned_eta: "2026-07-22", sort_order: 1, notes: "Palletized cartons." }),
        base({ id: "lot_009", purchase_order_id: "po_009", lot_no: "LOT-009", lot_name: "Radiator Cross Border Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-10", planned_etd: "2026-08-12", planned_eta: "2026-08-14", sort_order: 1, notes: "Road transport through border gate." }),
        base({ id: "lot_011", purchase_order_id: "po_010", lot_no: "LOT-011", lot_name: "Gasket Kit LCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-15", planned_etd: "2026-08-18", planned_eta: "2026-08-26", sort_order: 1, notes: "Two pallet LCL release." }),
        base({ id: "lot_012", purchase_order_id: "po_011", lot_no: "LOT-012", lot_name: "Starter Motor Air Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-09-01", planned_etd: "2026-09-03", planned_eta: "2026-09-04", sort_order: 1, notes: "Urgent air freight lot." }),
        base({ id: "lot_013", purchase_order_id: "po_012", lot_no: "LOT-013", lot_name: "Hydraulic Hose Breakbulk Lot", status: "ASSIGNED_TO_SHIPMENT", planned_cargo_ready_date: "2026-09-05", planned_etd: "2026-09-08", planned_eta: "2026-09-18", sort_order: 1, notes: "Oversized bundles need breakbulk handling." }),
        base({ id: "lot_014", purchase_order_id: "po_013", lot_no: "LOT-014", lot_name: "Separator Filter FCL Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-02", planned_etd: "2026-08-05", planned_eta: "2026-08-13", sort_order: 1, notes: "Fast moving consumable restock." }),
        base({ id: "lot_015", purchase_order_id: "po_014", lot_no: "LOT-015", lot_name: "ECU Air Lot", status: "SHIPPED", planned_cargo_ready_date: "2026-08-26", planned_etd: "2026-08-28", planned_eta: "2026-08-29", sort_order: 1, notes: "High-value electronics lot." })
    ],
    "po-delivery-slots": [
        base({ id: "slot_001", purchase_order_id: "po_001", slot_no: "SLOT-001", slot_name: "Legacy slot 1", status: "DEPRECATED", planned_cargo_ready_date: "2026-07-01", planned_etd: "2026-07-03", planned_eta: "2026-07-10", note: "Legacy table coverage only. Active LOT Planning ignores slots." }),
        base({ id: "slot_002", purchase_order_id: "po_002", slot_no: "SLOT-002", slot_name: "Legacy slot 2", status: "DEPRECATED", planned_cargo_ready_date: "2026-07-06", planned_etd: "2026-07-08", planned_eta: "2026-07-16", note: "Legacy table coverage only. Active LOT Planning ignores slots." }),
        base({ id: "slot_003", purchase_order_id: "po_003", slot_no: "SLOT-003", slot_name: "Legacy slot 3", status: "DEPRECATED", planned_cargo_ready_date: "2026-06-20", planned_etd: "2026-06-24", planned_eta: "2026-07-02", note: "Legacy table coverage only. Active LOT Planning ignores slots." }),
        base({ id: "slot_004", purchase_order_id: "po_004", slot_no: "SLOT-004", slot_name: "Legacy slot 4", status: "DEPRECATED", planned_cargo_ready_date: "2026-07-15", planned_etd: "2026-07-18", planned_eta: "2026-07-26", note: "Legacy table coverage only. Active LOT Planning ignores slots." })
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
        base({ id: "do_001", delivery_order_no: "DO-KBI-2026-001", purchase_order_id: "po_002", transport_mode_id: "tm_sea_fcl", status: "QUOTATION_CONFIRMED", requested_pickup_date: "2026-07-06", planned_cargo_ready_date: "2026-07-06", planned_etd: "2026-07-08", planned_eta: "2026-07-16", origin_address: "Shanghai Port", destination_address: "CatLai Port", warehouse_name: "Kim Binh Main Warehouse", notes: "Ready for shipment creation." }),
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
        base({ id: "qt_001", quotation_group_id: "qg_do_001", quotation_no: "QT-KBI-2026-001", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_001", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-10T02:00:00.000Z", valid_until: "2026-07-10", note: "Final freight quote." }),
        base({ id: "qt_002", quotation_group_id: "qg_do_002", quotation_no: "QT-KBI-2026-002", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_002", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-18T02:00:00.000Z", valid_until: "2026-07-18", note: "Shipped DO quote." }),
        base({ id: "qt_003", quotation_group_id: "qg_shp_001", quotation_no: "QT-KBI-2026-003", version: 1, ref_type: "SHIPMENT", ref_id: "shp_001", supplier_id: "sup_fds_forwarder", quotation_type: "LOCAL_CHARGE", currency_code: "VND", exchange_rate: 1, status: "RECEIVED", is_final: false, quoted_at: "2026-06-20T02:00:00.000Z", valid_until: "2026-07-20", note: "Local charge draft." }),
        base({ id: "qt_004", quotation_group_id: "qg_dto_001", quotation_no: "QT-KBI-2026-004", version: 1, ref_type: "DTO", ref_id: "dto_001", supplier_id: "sup_vn_trucking", quotation_type: "TRUCKING", currency_code: "VND", exchange_rate: 1, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-21T02:00:00.000Z", valid_until: "2026-07-21", note: "Trucking quote." }),
        base({ id: "qt_005", quotation_group_id: "qg_do_005", quotation_no: "QT-KBI-2026-005", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_005", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-22T02:00:00.000Z", valid_until: "2026-07-22", note: "FCL Shanghai to Hai Phong, all-in ocean charge." }),
        base({ id: "qt_006", quotation_group_id: "qg_do_006", quotation_no: "QT-KBI-2026-006", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_006", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-23T02:00:00.000Z", valid_until: "2026-07-23", note: "Air freight based on 210 kg chargeable weight." }),
        base({ id: "qt_007", quotation_group_id: "qg_do_007", quotation_no: "QT-KBI-2026-007", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_007", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-19T02:00:00.000Z", valid_until: "2026-07-19", note: "LCL charge including CFS origin handling." }),
        base({ id: "qt_008", quotation_group_id: "qg_do_008", quotation_no: "QT-KBI-2026-008", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_008", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-24T02:00:00.000Z", valid_until: "2026-07-24", note: "FCL with two free demurrage days at destination." }),
        base({ id: "qt_009", quotation_group_id: "qg_do_009", quotation_no: "QT-KBI-2026-009", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_009", supplier_id: "sup_vn_trucking", quotation_type: "TRUCKING", currency_code: "VND", exchange_rate: 1, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-06-25T02:00:00.000Z", valid_until: "2026-07-25", note: "Cross-border trucking from Pingxiang to Kim Binh." }),
        base({ id: "qt_010", quotation_group_id: "qg_do_010", quotation_no: "QT-KBI-2026-010", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_010", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-07-18T02:00:00.000Z", valid_until: "2026-08-18", note: "LCL freight including origin CFS handling." }),
        base({ id: "qt_011", quotation_group_id: "qg_do_011", quotation_no: "QT-KBI-2026-011", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_011", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-07-21T02:00:00.000Z", valid_until: "2026-08-21", note: "Direct PVG-HAN air freight for electrical parts." }),
        base({ id: "qt_012", quotation_group_id: "qg_do_012", quotation_no: "QT-KBI-2026-012", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_012", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-07-25T02:00:00.000Z", valid_until: "2026-08-25", note: "Breakbulk freight for non-containerized hose bundles." }),
        base({ id: "qt_013", quotation_group_id: "qg_do_013", quotation_no: "QT-KBI-2026-013", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_013", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-07-12T02:00:00.000Z", valid_until: "2026-08-12", note: "Supplier CIF shipment, local tracking quote retained for demo." }),
        base({ id: "qt_014", quotation_group_id: "qg_do_014", quotation_no: "QT-KBI-2026-014", version: 1, ref_type: "DELIVERY_ORDER", ref_id: "do_014", supplier_id: "sup_fds_forwarder", quotation_type: "FREIGHT", currency_code: "USD", exchange_rate: 25000, status: "CONFIRMED_BY_KBI", is_final: true, quoted_at: "2026-07-26T02:00:00.000Z", valid_until: "2026-08-26", note: "Air freight for high-value ECU modules." })
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
        base({ id: "qt_line_014", quotation_id: "qt_014", charge_type: "AIR_FREIGHT", description: "PVG to HAN high-value cargo", quantity: 95, unit_price: 5.8, amount: 551, currency_code: "USD", tax_rate: 0, note: "Includes security screening surcharge." })
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
        base({ id: "shp_001", shipment_no: "SHP-KBI-2026-001", delivery_order_id: "do_001", mode: "SEA_FCL", forwarder_id: "sup_fds_forwarder", carrier: "COSCO", vessel_flight: "COSCO STAR 126E", bl_awb_no: "BL-SHA-001", container_no: "CBHU1234567", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-08", eta: "2026-07-16", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_002", shipment_no: "SHP-KBI-2026-002", delivery_order_id: "do_002", mode: "SEA_LCL", forwarder_id: "sup_fds_forwarder", carrier: "OOCL", vessel_flight: "OOCL ASIA 021S", bl_awb_no: "BL-SHA-002", container_no: "LCL-SHA-002", pol: "CNSHA", pod: "VNHPH", etd: "2026-06-24", eta: "2026-07-02", atd: "2026-06-24", ata: null, status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_003", shipment_no: "SHP-KBI-2026-003", delivery_order_id: "do_002", mode: "AIR", forwarder_id: "sup_fds_forwarder", carrier: "VN Cargo", vessel_flight: "VN996", bl_awb_no: "AWB-003", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-06-26", eta: "2026-06-27", atd: "2026-06-26", ata: "2026-06-27", status: "DELIVERED" }),
        base({ id: "shp_004", shipment_no: "SHP-KBI-2026-004", delivery_order_id: "do_004", mode: "TRUCKING", forwarder_id: "sup_vn_trucking", carrier: "VN Trucking", vessel_flight: null, bl_awb_no: null, container_no: "TRUCK-004", pol: "Hai Phong", pod: "Kim Binh", etd: "2026-07-20", eta: "2026-07-21", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_005", shipment_no: "SHP-KBI-2026-005", delivery_order_id: "do_005", mode: "SEA_FCL", forwarder_id: "sup_fds_forwarder", carrier: "MAERSK", vessel_flight: "MAERSK NANSHA 241S", bl_awb_no: "BL-SHA-005", container_no: "MSKU7654321", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-22", eta: "2026-07-30", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_006", shipment_no: "SHP-KBI-2026-006", delivery_order_id: "do_006", mode: "AIR", forwarder_id: "sup_fds_forwarder", carrier: "Cathay Cargo", vessel_flight: "CX052", bl_awb_no: "AWB-006", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-08-04", eta: "2026-08-05", atd: "2026-08-04", ata: null, status: "ATD" }),
        base({ id: "shp_007", shipment_no: "SHP-KBI-2026-007", delivery_order_id: "do_007", mode: "SEA_LCL", forwarder_id: "sup_fds_forwarder", carrier: "SITC", vessel_flight: "SITC HAIPHONG 088S", bl_awb_no: "BL-NGB-007", container_no: "LCL-NGB-007", pol: "CNNGB", pod: "VNHPH", etd: "2026-06-30", eta: "2026-07-08", atd: "2026-06-30", ata: "2026-07-08", status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_008", shipment_no: "SHP-KBI-2026-008", delivery_order_id: "do_008", mode: "SEA_FCL", forwarder_id: "sup_fds_forwarder", carrier: "ONE", vessel_flight: "ONE ORPHEUS 077S", bl_awb_no: "BL-SHA-008", container_no: "TGBU9876543", pol: "CNSHA", pod: "VNHPH", etd: "2026-07-14", eta: "2026-07-22", atd: "2026-07-14", ata: null, status: "ARRIVAL_NOTICE" }),
        base({ id: "shp_009", shipment_no: "SHP-KBI-2026-009", delivery_order_id: "do_009", mode: "TRUCKING", forwarder_id: "sup_vn_trucking", carrier: "VN Cross Border Trucking", vessel_flight: null, bl_awb_no: "CMR-CB-009", container_no: "TRUCK-CB-009", pol: "Pingxiang Border", pod: "Kim Binh", etd: "2026-08-12", eta: "2026-08-14", atd: "2026-08-12", ata: "2026-08-14", status: "DELIVERED" }),
        base({ id: "shp_010", shipment_no: "SHP-KBI-2026-010", delivery_order_id: "do_010", mode: "SEA_LCL", forwarder_id: "sup_fds_forwarder", carrier: "SITC", vessel_flight: "SITC SHANGHAI 116S", bl_awb_no: "BL-SHA-010", container_no: "LCL-SHA-010", pol: "CNSHA", pod: "VNHPH", etd: "2026-08-18", eta: "2026-08-26", atd: "2026-08-18", ata: "2026-08-26", status: "CUSTOMS_CLEARED" }),
        base({ id: "shp_011", shipment_no: "SHP-KBI-2026-011", delivery_order_id: "do_011", mode: "AIR", forwarder_id: "sup_fds_forwarder", carrier: "China Eastern Cargo", vessel_flight: "MU7711", bl_awb_no: "AWB-011", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-09-03", eta: "2026-09-04", atd: "2026-09-03", ata: null, status: "ATD" }),
        base({ id: "shp_012", shipment_no: "SHP-KBI-2026-012", delivery_order_id: "do_012", mode: "SEA_BREAKBULK", forwarder_id: "sup_fds_forwarder", carrier: "COSCO", vessel_flight: "COSCO HEAVY 031S", bl_awb_no: "BBL-SHA-012", container_no: null, pol: "CNSHA", pod: "VNHPH", etd: "2026-09-08", eta: "2026-09-18", atd: null, ata: null, status: "BOOKING_CONFIRMED" }),
        base({ id: "shp_013", shipment_no: "SHP-KBI-2026-013", delivery_order_id: "do_013", mode: "SEA_FCL", forwarder_id: "sup_fds_forwarder", carrier: "MAERSK", vessel_flight: "MAERSK SHANGHAI 193S", bl_awb_no: "BL-SHA-013", container_no: "MRKU2468135", pol: "CNSHA", pod: "VNHPH", etd: "2026-08-05", eta: "2026-08-13", atd: "2026-08-05", ata: "2026-08-13", status: "DELIVERED" }),
        base({ id: "shp_014", shipment_no: "SHP-KBI-2026-014", delivery_order_id: "do_014", mode: "AIR", forwarder_id: "sup_fds_forwarder", carrier: "SF Airlines", vessel_flight: "O36918", bl_awb_no: "AWB-014", container_no: null, pol: "PVG", pod: "HAN", etd: "2026-08-28", eta: "2026-08-29", atd: "2026-08-28", ata: "2026-08-29", status: "DELIVERED" })
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
        base({ id: "shp_doc_001", shipment_id: "shp_001", document_type: "BOOKING_CONFIRMATION", document_no: "BK-001", file_url: "/mock/files/bk-001.pdf", issued_date: "2026-07-01", received_date: "2026-07-01", note: null }),
        base({ id: "shp_doc_002", shipment_id: "shp_002", document_type: "BILL_OF_LADING", document_no: "BL-SHA-002", file_url: "/mock/files/bl-002.pdf", issued_date: "2026-06-24", received_date: "2026-06-25", note: null }),
        base({ id: "shp_doc_003", shipment_id: "shp_003", document_type: "AIR_WAYBILL", document_no: "AWB-003", file_url: "/mock/files/awb-003.pdf", issued_date: "2026-06-26", received_date: "2026-06-26", note: null }),
        base({ id: "shp_doc_004", shipment_id: "shp_004", document_type: "COMMERCIAL_INVOICE", document_no: "CI-004", file_url: "/mock/files/ci-004.pdf", issued_date: "2026-07-15", received_date: "2026-07-15", note: null }),
        base({ id: "shp_doc_005", shipment_id: "shp_005", document_type: "BOOKING_CONFIRMATION", document_no: "BK-SHA-005", file_url: "/mock/files/bk-sha-005.pdf", issued_date: "2026-07-18", received_date: "2026-07-18", note: "20GP booking confirmation." }),
        base({ id: "shp_doc_006", shipment_id: "shp_006", document_type: "AIR_WAYBILL", document_no: "AWB-006", file_url: "/mock/files/awb-006.pdf", issued_date: "2026-08-04", received_date: "2026-08-04", note: "Direct PVG-HAN flight." }),
        base({ id: "shp_doc_007", shipment_id: "shp_007", document_type: "BILL_OF_LADING", document_no: "BL-NGB-007", file_url: "/mock/files/bl-ngb-007.pdf", issued_date: "2026-06-30", received_date: "2026-07-01", note: "LCL house bill." }),
        base({ id: "shp_doc_008", shipment_id: "shp_008", document_type: "ARRIVAL_NOTICE", document_no: "AN-SHA-008", file_url: "/mock/files/an-sha-008.pdf", issued_date: "2026-07-20", received_date: "2026-07-20", note: "Arrival notice pending customs draft." }),
        base({ id: "shp_doc_009", shipment_id: "shp_009", document_type: "CMR", document_no: "CMR-CB-009", file_url: "/mock/files/cmr-cb-009.pdf", issued_date: "2026-08-12", received_date: "2026-08-12", note: "Cross-border road consignment note." }),
        base({ id: "shp_doc_010", shipment_id: "shp_010", document_type: "BILL_OF_LADING", document_no: "BL-SHA-010", file_url: "/mock/files/bl-sha-010.pdf", issued_date: "2026-08-18", received_date: "2026-08-19", note: "LCL house bill for gasket kits." }),
        base({ id: "shp_doc_011", shipment_id: "shp_011", document_type: "AIR_WAYBILL", document_no: "AWB-011", file_url: "/mock/files/awb-011.pdf", issued_date: "2026-09-03", received_date: "2026-09-03", note: "Air waybill received after departure." }),
        base({ id: "shp_doc_012", shipment_id: "shp_012", document_type: "BOOKING_CONFIRMATION", document_no: "BK-BB-012", file_url: "/mock/files/bk-bb-012.pdf", issued_date: "2026-09-01", received_date: "2026-09-01", note: "Breakbulk booking confirmation." }),
        base({ id: "shp_doc_013", shipment_id: "shp_013", document_type: "BILL_OF_LADING", document_no: "BL-SHA-013", file_url: "/mock/files/bl-sha-013.pdf", issued_date: "2026-08-05", received_date: "2026-08-06", note: "FCL master bill." }),
        base({ id: "shp_doc_014", shipment_id: "shp_014", document_type: "AIR_WAYBILL", document_no: "AWB-014", file_url: "/mock/files/awb-014.pdf", issued_date: "2026-08-28", received_date: "2026-08-28", note: "High-value electronics air waybill." })
    ],
    "customs-declarations": [
        base({ id: "cd_001", shipment_id: "shp_001", declaration_no: "CD-KBI-2026-001", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-07-12T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: null }),
        base({ id: "cd_002", shipment_id: "shp_002", declaration_no: "CD-KBI-2026-002", customs_type: "IMPORT", customs_channel: "YELLOW", draft_opened_at: "2026-06-29T02:00:00.000Z", official_opened_at: "2026-07-01T02:00:00.000Z", cleared_at: "2026-07-02T02:00:00.000Z", status: "CLEARED", note: "Cleared shipment." }),
        base({ id: "cd_003", shipment_id: "shp_003", declaration_no: "CD-KBI-2026-003", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-06-27T02:00:00.000Z", official_opened_at: "2026-06-27T05:00:00.000Z", cleared_at: "2026-06-27T08:00:00.000Z", status: "CLEARED", note: "Air shipment cleared." }),
        base({ id: "cd_004", shipment_id: "shp_004", declaration_no: "CD-KBI-2026-004", customs_type: "IMPORT", customs_channel: "RED", draft_opened_at: "2026-07-20T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Inspection expected." }),
        base({ id: "cd_005", shipment_id: "shp_005", declaration_no: "CD-KBI-2026-005", customs_type: "IMPORT", customs_channel: "GREEN", draft_opened_at: "2026-07-28T02:00:00.000Z", official_opened_at: null, cleared_at: null, status: "DRAFT", note: "Draft prepared from supplier invoice." }),
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
        base({ id: "cdo_005", shipment_id: "shp_005", carrier_do_no: "CDO-KBI-2026-005", forwarder_id: "sup_fds_forwarder", issued_date: "2026-07-30", expired_date: "2026-08-06", release_location: "Hai Phong Port", container_no: "MSKU7654321", local_charge_amount: 4200000, currency_code: "VND", status: "PENDING", note: "Pending customs clearance." }),
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
        base({ id: "dto_014", dto_no: "DTO-KBI-2026-014", shipment_id: "shp_014", carrier_delivery_order_id: "cdo_014", truck_vendor_id: "sup_vn_trucking", origin: "Noi Bai Cargo", destination: "Kim Binh Factory", warehouse: "KBI Secure Cage", vehicle_type: "Secure Van", vehicle_plate: "29H-51414", driver_name: "Bui Van M", driver_phone: "+84-900-000-014", scheduled_pickup_at: "2026-08-29T09:00:00.000Z", actual_pickup_at: "2026-08-29T09:20:00.000Z", scheduled_delivery_at: "2026-08-29T13:00:00.000Z", actual_delivery_at: "2026-08-29T12:45:00.000Z", pod_document_ref: "POD-014", status: "POD_RECEIVED", note: "Received into secure cage pending QC." })
    ],
    "domestic-transport-order-lines": [
        base({ id: "dto_line_001", domestic_transport_order_id: "dto_001", purchase_order_line_id: "po_line_002", po_lot_id: "lot_003", item_id: "item_003", qty: 25, unit: "SET", sort_order: 1 }),
        base({ id: "dto_line_002", domestic_transport_order_id: "dto_002", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty: 10, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_003", domestic_transport_order_id: "dto_003", purchase_order_line_id: "po_line_003", po_lot_id: "lot_004", item_id: "item_004", qty: 2, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_004", domestic_transport_order_id: "dto_004", purchase_order_line_id: "po_line_004", po_lot_id: "lot_010", item_id: "item_002", qty: 100, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_005", domestic_transport_order_id: "dto_005", purchase_order_line_id: "po_line_005", po_lot_id: "lot_005", item_id: "item_005", qty: 12, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_006", domestic_transport_order_id: "dto_006", purchase_order_line_id: "po_line_006", po_lot_id: "lot_006", item_id: "item_006", qty: 30, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_007", domestic_transport_order_id: "dto_007", purchase_order_line_id: "po_line_007", po_lot_id: "lot_007", item_id: "item_007", qty: 240, unit: "SET", sort_order: 1 }),
        base({ id: "dto_line_008", domestic_transport_order_id: "dto_008", purchase_order_line_id: "po_line_008", po_lot_id: "lot_008", item_id: "item_008", qty: 800, unit: "KIT", sort_order: 1 }),
        base({ id: "dto_line_009", domestic_transport_order_id: "dto_009", purchase_order_line_id: "po_line_009", po_lot_id: "lot_009", item_id: "item_009", qty: 18, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_010", domestic_transport_order_id: "dto_010", purchase_order_line_id: "po_line_010", po_lot_id: "lot_011", item_id: "item_010", qty: 120, unit: "KIT", sort_order: 1 }),
        base({ id: "dto_line_011", domestic_transport_order_id: "dto_011", purchase_order_line_id: "po_line_011", po_lot_id: "lot_012", item_id: "item_011", qty: 45, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_012", domestic_transport_order_id: "dto_012", purchase_order_line_id: "po_line_012", po_lot_id: "lot_013", item_id: "item_012", qty: 300, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_013", domestic_transport_order_id: "dto_013", purchase_order_line_id: "po_line_013", po_lot_id: "lot_014", item_id: "item_013", qty: 600, unit: "PCS", sort_order: 1 }),
        base({ id: "dto_line_014", domestic_transport_order_id: "dto_014", purchase_order_line_id: "po_line_014", po_lot_id: "lot_015", item_id: "item_014", qty: 20, unit: "PCS", sort_order: 1 })
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

    return [
        ...Object.keys(files),
        ...Object.keys(screenFiles).map((name) => `screens/${name}`)
    ];
}

if (process.argv[1] === scriptPath) {
    const seededCollections = await seedMockData();
    console.log(`Seeded ${seededCollections.length} mock-data collections.`);
}

function buildScreenFiles(seedFiles) {
    const purchaseOrdersById = Object.fromEntries(seedFiles["purchase-orders"].map((purchaseOrder) => [purchaseOrder.id, purchaseOrder]));
    const items = [
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
        ...record
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
            transport_mode_id: purchaseOrder.transport_mode_id || transportModeIdByCode[firstShipment?.mode] || "tm_sea_fcl",
            actual_etd: purchaseOrder.actual_etd || firstShipment?.atd || purchaseOrder.expected_etd || null,
            actual_eta: purchaseOrder.actual_eta || firstShipment?.ata || purchaseOrder.expected_eta || null,
            expected_warehouse_eta: purchaseOrder.expected_warehouse_eta || expectedWarehouseEta,
            actual_warehouse_ata: purchaseOrder.actual_warehouse_ata || firstTransportOrder?.actual_delivery_at || expectedWarehouseEta
        };
    });
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
        shp_005: 1,
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
