export const deliveryOrderColumns = [
    "do_no",
    "transport_mode_id",
    "planned_cargo_ready_date",
    "planned_etd",
    "planned_eta",
    "origin_address",
    "destination_address",
    "warehouse_name",
    "requested_by",
    "handled_by",
    "notes"
];

export const deliveryOrderCreateColumns = [
    "do_no",
    "purchase_order_id",
    ...deliveryOrderColumns.filter((column) => column !== "do_no")
];

export const deliveryOrderStatuses = {
    DRAFT: "DRAFT",
    READY_FOR_QUOTATION: "READY_FOR_QUOTATION",
    QUOTATION_CONFIRMED: "QUOTATION_CONFIRMED",
    ASSIGNED_TO_SHIPMENT: "ASSIGNED_TO_SHIPMENT",
    CANCELLED: "CANCELLED",
    CLOSED: "CLOSED"
};

export const allowedPurchaseOrderStatusesForDeliveryOrder = [
    "CONFIRMED",
    "IN_PRODUCTION",
    "READY_TO_SHIP"
];

export const lockedDeliveryOrderStatuses = [
    deliveryOrderStatuses.ASSIGNED_TO_SHIPMENT,
    deliveryOrderStatuses.CANCELLED,
    deliveryOrderStatuses.CLOSED
];

export const lockedLotStatuses = [
    "ASSIGNED_TO_SHIPMENT",
    "SHIPPED",
    "CANCELLED"
];
