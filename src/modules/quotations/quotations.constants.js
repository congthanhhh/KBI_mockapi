export const quotationColumns = [
    "quotation_no",
    "supplier_id",
    "quotation_type",
    "currency_id",
    "exchange_rate",
    "quoted_at",
    "valid_until",
    "note"
];

export const quotationCreateColumns = [
    "quotation_no",
    "ref_type",
    "ref_id",
    ...quotationColumns.filter((column) => column !== "quotation_no")
];

export const quotationChargeLineColumns = [
    "line_no",
    "charge_type",
    "description",
    "quantity",
    "unit",
    "unit_price",
    "tax_rate",
    "note"
];

export const quotationStatuses = {
    DRAFT: "DRAFT",
    REQUESTED: "REQUESTED",
    RECEIVED: "RECEIVED",
    SUBMITTED_TO_KBI: "SUBMITTED_TO_KBI",
    CONFIRMED_BY_KBI: "CONFIRMED_BY_KBI",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED"
};

export const quotationTypes = [
    "FREIGHT",
    "LOCAL_CHARGE",
    "CUSTOMS",
    "TRUCKING",
    "MIXED"
];

export const quotationRefTypes = [
    "DELIVERY_ORDER",
    "PO",
    "SHIPMENT",
    "CARRIER_DO",
    "DTO"
];

export const quotationChargeTypes = [
    "OCEAN_FREIGHT",
    "AIR_FREIGHT",
    "LOCAL_CHARGE",
    "CUSTOMS_FEE",
    "TRUCKING",
    "DO_FEE",
    "DEMURRAGE",
    "DETENTION",
    "WAREHOUSE",
    "DOCUMENT_FEE",
    "OTHER"
];

export const lockedQuotationStatuses = [
    quotationStatuses.SUBMITTED_TO_KBI,
    quotationStatuses.CONFIRMED_BY_KBI,
    quotationStatuses.REJECTED,
    quotationStatuses.CANCELLED,
    quotationStatuses.EXPIRED
];

export const terminalQuotationStatuses = [
    quotationStatuses.CONFIRMED_BY_KBI,
    quotationStatuses.REJECTED,
    quotationStatuses.CANCELLED,
    quotationStatuses.EXPIRED
];

export const lockedDeliveryOrderStatusesForQuotation = [
    "ASSIGNED_TO_SHIPMENT",
    "CANCELLED",
    "CLOSED"
];
