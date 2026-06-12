export const customsDeclarationStatuses = {
    DRAFT: "DRAFT",
    DRAFT_OPENED: "DRAFT_OPENED",
    OFFICIAL_OPENED: "OFFICIAL_OPENED",
    SUBMITTED: "SUBMITTED",
    INSPECTION: "INSPECTION",
    CLEARED: "CLEARED",
    CANCELLED: "CANCELLED"
};

export const customsDeclarationTypes = [
    "IMPORT",
    "TEMP_IMPORT",
    "RE_IMPORT",
    "OTHER"
];

export const customsChannels = [
    "GREEN",
    "YELLOW",
    "RED"
];

export const lockedCustomsDeclarationStatuses = [
    customsDeclarationStatuses.CLEARED,
    customsDeclarationStatuses.CANCELLED
];

export const customsDeclarationCreateColumns = [
    "shipment_id",
    "declaration_no",
    "customs_type",
    "customs_channel",
    "broker_id",
    "note"
];

export const customsDeclarationUpdateColumns = [
    "declaration_no",
    "customs_type",
    "customs_channel",
    "broker_id",
    "submitted_at",
    "note",
    "cancel_reason"
];

export const customsDeclarationLineColumns = [
    "shipment_line_id",
    "purchase_order_line_id",
    "item_id",
    "item_customs_profile_id",
    "line_no",
    "hs_code",
    "item_description",
    "quantity",
    "unit",
    "customs_value",
    "currency_id",
    "import_duty_rate",
    "preferential_tax_rate",
    "vat_rate",
    "co_form",
    "note"
];
