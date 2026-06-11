export const shipmentStatuses = {
    BOOKING_PENDING: "BOOKING_PENDING",
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
    CARGO_READY: "CARGO_READY",
    PICKED_UP: "PICKED_UP",
    BL_ISSUED: "BL_ISSUED",
    GATE_IN_POL: "GATE_IN_POL",
    IN_TRANSIT: "IN_TRANSIT",
    ARRIVED: "ARRIVED",
    CUSTOMS_DRAFT: "CUSTOMS_DRAFT",
    CUSTOMS_CLEARED: "CUSTOMS_CLEARED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED"
};

export const shipmentModes = [
    "SEA",
    "AIR",
    "ROAD",
    "RAIL",
    "MULTIMODAL",
    "TRUCKING",
    "OTHER"
];

export const shipmentCustomsChannels = [
    "GREEN",
    "YELLOW",
    "RED"
];

export const shipmentMilestoneCodes = [
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

export const shipmentDocumentTypes = [
    "COMMERCIAL_INVOICE",
    "PACKING_LIST",
    "CONTRACT",
    "BOOKING_CONFIRMATION",
    "BILL_OF_LADING",
    "AIR_WAYBILL",
    "ARRIVAL_NOTICE",
    "CERTIFICATE_OF_ORIGIN",
    "INSURANCE",
    "CUSTOMS_DECLARATION",
    "EDO",
    "POD",
    "OTHER"
];

export const shipmentDocumentStatuses = [
    "DRAFT",
    "RECEIVED",
    "VERIFIED",
    "REJECTED",
    "CANCELLED"
];

export const shipmentCreateColumns = [
    "shipment_no",
    "delivery_order_id",
    "final_quotation_id",
    "transport_mode_id",
    "forwarder_id",
    "carrier",
    "mode",
    "vessel_flight",
    "voyage_no",
    "bl_awb_no",
    "container_no",
    "pol",
    "pod",
    "etd",
    "eta",
    "notes"
];

export const shipmentUpdateColumns = [
    "transport_mode_id",
    "forwarder_id",
    "carrier",
    "mode",
    "vessel_flight",
    "voyage_no",
    "bl_awb_no",
    "container_no",
    "pol",
    "pod",
    "etd",
    "eta",
    "atd",
    "ata",
    "customs_channel",
    "package_qty",
    "gross_weight",
    "net_weight",
    "cbm",
    "notes"
];

export const shipmentDocumentCreateColumns = [
    "milestone_id",
    "document_type",
    "document_no",
    "file_url",
    "file_name",
    "mime_type",
    "issued_date",
    "received_at",
    "status",
    "notes"
];

export const shipmentDocumentUpdateColumns = [
    "milestone_id",
    "document_type",
    "document_no",
    "file_url",
    "file_name",
    "mime_type",
    "issued_date",
    "received_at",
    "status",
    "notes"
];
