export const purchaseOrderColumns = [
    "po_no",
    "contract_no",
    "supplier_id",
    "currency_id",
    "incoterm_id",
    "transport_mode_id",
    "po_type",
    "payment_term",
    "exchange_rate",
    "expected_etd",
    "expected_eta",
    "notes"
];

export const purchaseOrderLineColumns = [
    "item_id",
    "item_customs_profile_id",
    "line_no",
    "item_description",
    "qty_ordered",
    "unit",
    "unit_price",
    "tax_rate",
    "discount_pct",
    "expected_eta_line",
    "notes"
];

export const deliverySlotColumns = [
    "slot_no",
    "slot_name",
    "planned_cargo_ready_date",
    "planned_etd",
    "planned_eta",
    "delivery_address",
    "warehouse_name",
    "status",
    "sort_order",
    "notes"
];

export const lotColumns = [
    "lot_no",
    "lot_name",
    "status",
    "planned_cargo_ready_date",
    "planned_etd",
    "planned_eta",
    "sort_order",
    "notes"
];

export const confirmationHeaderColumns = [
    "confirmed_by",
    "confirmed_at",
    "supplier_ref_no",
    "is_full_shipment",
    "allow_partial_shipment",
    "note"
];

export const confirmationLineColumns = [
    "purchase_order_line_id",
    "confirmed_qty",
    "cargo_ready_date",
    "can_fulfill",
    "allow_partial_shipment",
    "note"
];

export const poStatuses = {
    DRAFT: "DRAFT",
    SENT: "SENT",
    CONFIRMED: "CONFIRMED",
    IN_PRODUCTION: "IN_PRODUCTION",
    READY_TO_SHIP: "READY_TO_SHIP",
    CANCELLED: "CANCELLED"
};

export const lotLockedStatuses = [
    "ASSIGNED_TO_SHIPMENT",
    "SHIPPED",
    "CANCELLED"
];

export const slotStatuses = [
    "PLANNED",
    "CONFIRMED",
    "CANCELLED"
];

export const lotStatuses = [
    "PLANNED",
    "READY",
    "ASSIGNED_TO_SHIPMENT",
    "SHIPPED",
    "CANCELLED"
];
