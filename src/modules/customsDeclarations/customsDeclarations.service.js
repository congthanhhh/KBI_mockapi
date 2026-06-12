import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import {
    customsChannels,
    customsDeclarationCreateColumns,
    customsDeclarationLineColumns,
    customsDeclarationStatuses,
    customsDeclarationTypes,
    customsDeclarationUpdateColumns,
    lockedCustomsDeclarationStatuses
} from "./customsDeclarations.constants.js";
import {
    cancelCustomsDeclaration,
    clearCustomsDeclaration,
    createCustomsDeclarationFromShipment,
    createCustomsDeclarationLine,
    findBrokerForCustoms,
    findCustomsDeclarationById,
    findCustomsDeclarationLineById,
    findCustomsDeclarationLines,
    findCustomsDeclarationsByShipmentId,
    findShipmentForCustoms,
    findShipmentLineForCustoms,
    openCustomsDraft,
    openCustomsOfficial,
    softDeleteCustomsDeclarationLine,
    updateCustomsDeclaration,
    updateCustomsDeclarationLine
} from "./customsDeclarations.repository.js";

const dateColumns = [
    "submitted_at",
    "opened_at",
    "cleared_at",
    "cancelled_at"
];

const positiveNumberColumns = [
    "line_no",
    "quantity"
];

const nonNegativeNumberColumns = [
    "customs_value"
];

const rateColumns = [
    "import_duty_rate",
    "preferential_tax_rate",
    "vat_rate"
];

function apiResult(data, meta = {}) {
    return {
        data,
        meta,
        errors: []
    };
}

function apiError(statusCode, message, code) {
    return httpError(statusCode, message, code);
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw apiError(400, `${field} is required`, "VALIDATION_ERROR");
    }
}

function normalizeValue(column, value) {
    if (value === undefined) {
        return value;
    }

    if (value === "") {
        return null;
    }

    if (dateColumns.includes(column) && value !== null) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw apiError(400, `${column} is invalid`, "VALIDATION_ERROR");
        }

        return date;
    }

    return value;
}

function normalizeFields(fields) {
    return fields
        .map(([column, value]) => [column, normalizeValue(column, value)])
        .filter(([, value]) => value !== undefined);
}

function objectFromFields(fields) {
    return Object.fromEntries(normalizeFields(fields));
}

function validatePositiveNumber(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue <= 0 || Number.isNaN(numberValue)) {
        throw apiError(400, `${field} must be greater than 0`, "VALIDATION_ERROR");
    }
}

function validateNonNegativeNumber(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || Number.isNaN(numberValue)) {
        throw apiError(400, `${field} must be greater than or equal to 0`, "VALIDATION_ERROR");
    }
}

function validateRate(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || numberValue > 100 || Number.isNaN(numberValue)) {
        throw apiError(400, `${field} must be between 0 and 100`, "VALIDATION_ERROR");
    }
}

function validateDeclarationBody(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "shipment_id");
    }

    if (Object.hasOwn(body, "customs_type") && !customsDeclarationTypes.includes(body.customs_type)) {
        throw apiError(400, "Invalid customs_type", "VALIDATION_ERROR");
    }

    if (
        Object.hasOwn(body, "customs_channel")
        && body.customs_channel !== null
        && body.customs_channel !== ""
        && !customsChannels.includes(body.customs_channel)
    ) {
        throw apiError(400, "Invalid customs_channel", "VALIDATION_ERROR");
    }
}

function validateLineBody(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "line_no");

        if (!body.shipment_line_id) {
            requireField(body, "purchase_order_line_id");
            requireField(body, "item_id");
            requireField(body, "quantity");
            requireField(body, "unit");
        }
    }

    for (const column of positiveNumberColumns) {
        if (Object.hasOwn(body, column)) {
            validatePositiveNumber(body[column], column);
        }
    }

    for (const column of nonNegativeNumberColumns) {
        if (Object.hasOwn(body, column)) {
            validateNonNegativeNumber(body[column], column);
        }
    }

    for (const column of rateColumns) {
        if (Object.hasOwn(body, column)) {
            validateRate(body[column], column);
        }
    }
}

function ensureDeclarationCanUpdate(declaration) {
    if (lockedCustomsDeclarationStatuses.includes(declaration.status)) {
        throw apiError(409, "Customs declaration is locked in current status", "STATE_CONFLICT");
    }
}

function ensureDeclarationCanChangeLines(declaration) {
    if (lockedCustomsDeclarationStatuses.includes(declaration.status)) {
        throw apiError(409, "Cannot change customs lines in current declaration status", "STATE_CONFLICT");
    }
}

async function getRequiredShipment(id) {
    const shipment = await findShipmentForCustoms(id);

    if (!shipment) {
        throw apiError(404, "Shipment not found", "NOT_FOUND");
    }

    return shipment;
}

async function getRequiredDeclaration(id) {
    const declaration = await findCustomsDeclarationById(id);

    if (!declaration) {
        throw apiError(404, "Customs declaration not found", "NOT_FOUND");
    }

    return declaration;
}

async function getRequiredLine(id) {
    const line = await findCustomsDeclarationLineById(id);

    if (!line) {
        throw apiError(404, "Customs declaration line not found", "NOT_FOUND");
    }

    return line;
}

async function ensureActiveBroker(id) {
    if (!id) {
        return;
    }

    const broker = await findBrokerForCustoms(id);

    if (!broker) {
        throw apiError(404, "Customs broker not found", "NOT_FOUND");
    }

    if (!broker.is_active) {
        throw apiError(409, "Customs broker is inactive", "STATE_CONFLICT");
    }
}

async function resolveShipmentLine(declaration, body) {
    if (!body.shipment_line_id) {
        return null;
    }

    const shipmentLine = await findShipmentLineForCustoms(body.shipment_line_id);

    if (!shipmentLine) {
        throw apiError(404, "Shipment line not found", "NOT_FOUND");
    }

    if (shipmentLine.shipment_id !== declaration.shipment_id) {
        throw apiError(409, "Shipment line does not belong to declaration shipment", "STATE_CONFLICT");
    }

    return shipmentLine;
}

function mapDeclarationData(body, columns = customsDeclarationUpdateColumns) {
    return objectFromFields(pickAllowedFields(body, columns));
}

function mapLineData(body) {
    return objectFromFields(pickAllowedFields(body, customsDeclarationLineColumns));
}

function mapLineDataWithShipmentLine(body, shipmentLine) {
    return mapLineData({
        ...body,
        purchase_order_line_id: body.purchase_order_line_id ?? shipmentLine?.purchase_order_line_id,
        item_id: body.item_id ?? shipmentLine?.item_id,
        quantity: body.quantity ?? shipmentLine?.qty_shipped,
        unit: body.unit ?? shipmentLine?.unit,
        item_description: body.item_description ?? shipmentLine?.item_description
    });
}

export async function listShipmentCustomsDeclarations(shipmentId) {
    await getRequiredShipment(shipmentId);
    const declarations = await findCustomsDeclarationsByShipmentId(shipmentId);

    return apiResult(declarations, {
        total: declarations.length
    });
}

export async function addShipmentCustomsDeclaration(shipmentId, body) {
    const requestBody = {
        ...body,
        shipment_id: shipmentId,
        customs_type: body.customs_type || "IMPORT"
    };

    validateDeclarationBody(requestBody, { isCreate: true });

    const shipment = await getRequiredShipment(shipmentId);

    if (shipment.status === "CANCELLED") {
        throw apiError(409, "Cannot create customs declaration for cancelled shipment", "STATE_CONFLICT");
    }

    if (!shipment.lines.length) {
        throw apiError(422, "Shipment must have lines before creating customs declaration", "BUSINESS_RULE_VIOLATION");
    }

    await ensureActiveBroker(requestBody.broker_id);

    return apiResult(await createCustomsDeclarationFromShipment(
        mapDeclarationData(requestBody, customsDeclarationCreateColumns)
    ), {
        message: "Created successfully"
    });
}

export async function getCustomsDeclaration(id) {
    return apiResult(await getRequiredDeclaration(id));
}

export async function editCustomsDeclaration(id, body) {
    const declaration = await getRequiredDeclaration(id);
    ensureDeclarationCanUpdate(declaration);
    validateDeclarationBody(body);
    await ensureActiveBroker(body.broker_id);

    const data = mapDeclarationData(body);

    if (!Object.keys(data).length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    return apiResult(await updateCustomsDeclaration(id, data), {
        message: "Updated successfully"
    });
}

export async function listCustomsDeclarationLines(id) {
    await getRequiredDeclaration(id);
    const lines = await findCustomsDeclarationLines(id);

    return apiResult(lines, {
        total: lines.length
    });
}

export async function addCustomsDeclarationLine(id, body) {
    const declaration = await getRequiredDeclaration(id);
    ensureDeclarationCanChangeLines(declaration);
    validateLineBody(body, { isCreate: true });

    if (declaration.lines.some((line) => line.line_no === body.line_no)) {
        throw apiError(400, "line_no must be unique in customs declaration", "VALIDATION_ERROR");
    }

    const shipmentLine = await resolveShipmentLine(declaration, body);

    return apiResult(await createCustomsDeclarationLine(
        id,
        mapLineDataWithShipmentLine(body, shipmentLine)
    ), {
        message: "Created successfully"
    });
}

export async function editCustomsDeclarationLine(lineId, body) {
    const line = await getRequiredLine(lineId);
    const declaration = await getRequiredDeclaration(line.customs_declaration_id);
    ensureDeclarationCanChangeLines(declaration);
    validateLineBody(body);

    const shipmentLine = await resolveShipmentLine(declaration, body);
    const data = mapLineDataWithShipmentLine(body, shipmentLine);

    if (!Object.keys(data).length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (
        Object.hasOwn(body, "line_no")
        && declaration.lines.some((item) => item.id !== lineId && item.line_no === body.line_no)
    ) {
        throw apiError(400, "line_no must be unique in customs declaration", "VALIDATION_ERROR");
    }

    return apiResult(await updateCustomsDeclarationLine(lineId, data), {
        message: "Updated successfully"
    });
}

export async function removeCustomsDeclarationLine(lineId) {
    const line = await getRequiredLine(lineId);
    const declaration = await getRequiredDeclaration(line.customs_declaration_id);
    ensureDeclarationCanChangeLines(declaration);

    return apiResult(await softDeleteCustomsDeclarationLine(lineId), {
        message: "Deleted successfully"
    });
}

export async function openCustomsDeclarationDraft(id, body = {}) {
    const declaration = await getRequiredDeclaration(id);

    if (declaration.status !== customsDeclarationStatuses.DRAFT) {
        throw apiError(409, "Customs draft can only be opened from DRAFT", "STATE_CONFLICT");
    }

    return apiResult(await openCustomsDraft(
        id,
        normalizeValue("opened_at", body.opened_at || new Date())
    ), {
        message: "Draft opened successfully"
    });
}

export async function openCustomsDeclarationOfficial(id, body = {}) {
    const declaration = await getRequiredDeclaration(id);

    if (![customsDeclarationStatuses.DRAFT, customsDeclarationStatuses.DRAFT_OPENED].includes(declaration.status)) {
        throw apiError(409, "Customs official can only be opened from DRAFT or DRAFT_OPENED", "STATE_CONFLICT");
    }

    requireField(body, "declaration_no");
    requireField(body, "customs_channel");

    if (!customsChannels.includes(body.customs_channel)) {
        throw apiError(400, "Invalid customs_channel", "VALIDATION_ERROR");
    }

    return apiResult(await openCustomsOfficial(id, {
        declarationNo: body.declaration_no,
        customsChannel: body.customs_channel,
        openedAt: normalizeValue("opened_at", body.opened_at || new Date())
    }), {
        message: "Official opened successfully"
    });
}

export async function clearCustomsDeclarationById(id, body = {}) {
    const declaration = await getRequiredDeclaration(id);

    if (![
        customsDeclarationStatuses.OFFICIAL_OPENED,
        customsDeclarationStatuses.SUBMITTED,
        customsDeclarationStatuses.INSPECTION
    ].includes(declaration.status)) {
        throw apiError(409, "Customs declaration must be official before clearing", "STATE_CONFLICT");
    }

    if (!declaration.lines.length) {
        throw apiError(422, "Cannot clear customs declaration without lines", "BUSINESS_RULE_VIOLATION");
    }

    return apiResult(await clearCustomsDeclaration(id, {
        clearedAt: normalizeValue("cleared_at", body.cleared_at || new Date()),
        note: body.note || null
    }), {
        message: "Cleared successfully"
    });
}

export async function cancelCustomsDeclarationById(id, body = {}) {
    const declaration = await getRequiredDeclaration(id);

    if (declaration.status === customsDeclarationStatuses.CLEARED) {
        throw apiError(409, "Cleared customs declaration cannot be cancelled", "STATE_CONFLICT");
    }

    if (declaration.status === customsDeclarationStatuses.CANCELLED) {
        throw apiError(409, "Customs declaration is already cancelled", "STATE_CONFLICT");
    }

    return apiResult(await cancelCustomsDeclaration(id, {
        cancelledAt: normalizeValue("cancelled_at", body.cancelled_at || new Date()),
        cancelReason: body.cancel_reason || body.reason || null,
        note: body.note ?? undefined
    }), {
        message: "Cancelled successfully"
    });
}
