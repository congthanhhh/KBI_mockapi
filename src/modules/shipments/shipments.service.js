import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import {
    shipmentCreateColumns,
    shipmentCustomsChannels,
    shipmentDocumentCreateColumns,
    shipmentDocumentStatuses,
    shipmentDocumentTypes,
    shipmentDocumentUpdateColumns,
    shipmentMilestoneCodes,
    shipmentModes,
    shipmentStatuses,
    shipmentUpdateColumns
} from "./shipments.constants.js";
import {
    cancelShipment,
    createShipmentDocument,
    createShipmentFromDeliveryOrder as createShipmentFromDeliveryOrderRecord,
    findDeliveryOrderForShipment,
    findFinalQuotationForDeliveryOrder,
    findQuotationForShipment,
    findShipmentById,
    findShipmentDocumentById,
    findShipmentDocuments,
    findShipmentLines,
    findShipmentMilestoneByCode,
    findShipmentMilestoneById,
    findShipmentMilestones,
    findShipments,
    findSupplierForShipment,
    findTransportModeForShipment,
    markShipmentMilestoneDone,
    softDeleteShipmentDocument,
    updateShipment,
    updateShipmentDocument
} from "./shipments.repository.js";

const dateColumns = [
    "etd",
    "eta",
    "atd",
    "ata",
    "actual_at",
    "issued_date",
    "received_at"
];

const nonNegativeColumns = [
    "package_qty",
    "gross_weight",
    "net_weight",
    "cbm"
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

function normalizeDateFilter(value, endOfDay = false) {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw apiError(400, "Invalid date filter", "VALIDATION_ERROR");
    }

    if (endOfDay) {
        date.setHours(23, 59, 59, 999);
    }

    return date;
}

function normalizeFields(fields) {
    return fields.map(([column, value]) => [column, normalizeValue(column, value)]);
}

function objectFromFields(fields) {
    return Object.fromEntries(normalizeFields(fields).filter(([, value]) => value !== undefined));
}

function validateNonNegativeNumber(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || Number.isNaN(numberValue)) {
        throw apiError(400, `${field} must be greater than or equal to 0`, "VALIDATION_ERROR");
    }
}

function validateShipmentHeader(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "shipment_no");
        requireField(body, "delivery_order_id");
    }

    if (Object.hasOwn(body, "shipment_no")) {
        requireField(body, "shipment_no");
    }

    if (Object.hasOwn(body, "mode") && !shipmentModes.includes(body.mode)) {
        throw apiError(400, "Invalid shipment mode", "VALIDATION_ERROR");
    }

    if (
        Object.hasOwn(body, "customs_channel")
        && body.customs_channel !== null
        && body.customs_channel !== ""
        && !shipmentCustomsChannels.includes(body.customs_channel)
    ) {
        throw apiError(400, "Invalid customs_channel", "VALIDATION_ERROR");
    }

    for (const column of nonNegativeColumns) {
        if (Object.hasOwn(body, column)) {
            validateNonNegativeNumber(body[column], column);
        }
    }
}

function validateDocumentBody(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "document_type");
    }

    if (Object.hasOwn(body, "document_type") && !shipmentDocumentTypes.includes(body.document_type)) {
        throw apiError(400, "Invalid document_type", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "status") && !shipmentDocumentStatuses.includes(body.status)) {
        throw apiError(400, "Invalid document status", "VALIDATION_ERROR");
    }
}

function mapShipmentData(body, columns = shipmentUpdateColumns) {
    return objectFromFields(pickAllowedFields(body, columns));
}

function mapDocumentData(body, columns = shipmentDocumentUpdateColumns) {
    return objectFromFields(pickAllowedFields(body, columns));
}

async function getRequiredShipment(id) {
    const shipment = await findShipmentById(id);

    if (!shipment) {
        throw apiError(404, "Shipment not found", "NOT_FOUND");
    }

    return shipment;
}

async function getRequiredDeliveryOrder(id) {
    const deliveryOrder = await findDeliveryOrderForShipment(id);

    if (!deliveryOrder) {
        throw apiError(404, "Delivery order not found", "NOT_FOUND");
    }

    return deliveryOrder;
}

async function getRequiredDocument(id) {
    const document = await findShipmentDocumentById(id);

    if (!document) {
        throw apiError(404, "Shipment document not found", "NOT_FOUND");
    }

    return document;
}

function ensureShipmentCanUpdate(shipment) {
    if ([shipmentStatuses.DELIVERED, shipmentStatuses.CANCELLED].includes(shipment.status)) {
        throw apiError(409, "Shipment is locked in current status", "STATE_CONFLICT");
    }
}

function ensureShipmentCanReceiveDocument(shipment) {
    if (shipment.status === shipmentStatuses.CANCELLED) {
        throw apiError(409, "Cannot change documents for cancelled shipment", "STATE_CONFLICT");
    }
}

async function ensureActiveTransportMode(id) {
    if (!id) {
        return;
    }

    const transportMode = await findTransportModeForShipment(id);

    if (!transportMode) {
        throw apiError(404, "Transport mode not found", "NOT_FOUND");
    }

    if (!transportMode.is_active) {
        throw apiError(409, "Transport mode is inactive", "STATE_CONFLICT");
    }
}

async function ensureActiveForwarder(id) {
    if (!id) {
        return;
    }

    const supplier = await findSupplierForShipment(id);

    if (!supplier) {
        throw apiError(404, "Forwarder not found", "NOT_FOUND");
    }

    if (!supplier.is_active) {
        throw apiError(409, "Forwarder is inactive", "STATE_CONFLICT");
    }
}

async function resolveFinalQuotation(deliveryOrderId, finalQuotationId) {
    const quotation = finalQuotationId
        ? await findQuotationForShipment(finalQuotationId)
        : await findFinalQuotationForDeliveryOrder(deliveryOrderId);

    if (!quotation) {
        throw apiError(422, "Final quotation is required before creating shipment", "BUSINESS_RULE_VIOLATION");
    }

    if (
        !quotation.is_final
        || quotation.status !== "CONFIRMED_BY_KBI"
        || quotation.ref_type !== "DELIVERY_ORDER"
        || quotation.ref_id !== deliveryOrderId
    ) {
        throw apiError(409, "Quotation must be final, confirmed, and belong to this delivery order", "STATE_CONFLICT");
    }

    return quotation;
}

async function resolveMilestone(shipmentId, body) {
    if (!body.milestone_id && !body.milestone_code) {
        return null;
    }

    const milestone = body.milestone_id
        ? await findShipmentMilestoneById(body.milestone_id)
        : await findShipmentMilestoneByCode(shipmentId, body.milestone_code);

    if (!milestone || milestone.shipment_id !== shipmentId) {
        throw apiError(404, "Shipment milestone not found", "NOT_FOUND");
    }

    if (body.milestone_code && milestone.milestone_code !== body.milestone_code) {
        throw apiError(400, "milestone_id does not match milestone_code", "VALIDATION_ERROR");
    }

    return milestone;
}

export async function listShipments({
    search,
    status,
    mode,
    deliveryOrderId,
    purchaseOrderId,
    forwarderId,
    transportModeId,
    fromDate,
    toDate,
    page,
    limit,
    offset
}) {
    if (status && !Object.values(shipmentStatuses).includes(status)) {
        throw apiError(400, "Invalid shipment status", "VALIDATION_ERROR");
    }

    if (mode && !shipmentModes.includes(mode)) {
        throw apiError(400, "Invalid shipment mode", "VALIDATION_ERROR");
    }

    const { shipments, total } = await findShipments({
        search,
        status,
        mode,
        deliveryOrderId,
        purchaseOrderId,
        forwarderId,
        transportModeId,
        fromDate: normalizeDateFilter(fromDate),
        toDate: normalizeDateFilter(toDate, true),
        limit,
        offset
    });

    return apiResult(shipments, {
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    });
}

export async function getShipment(id) {
    return apiResult(await getRequiredShipment(id));
}

export async function addShipmentFromDeliveryOrder(body) {
    validateShipmentHeader(body, { isCreate: true });

    const deliveryOrder = await getRequiredDeliveryOrder(body.delivery_order_id);

    if (deliveryOrder.status !== "QUOTATION_CONFIRMED") {
        throw apiError(409, "Delivery order must be QUOTATION_CONFIRMED before creating shipment", "STATE_CONFLICT");
    }

    if (!deliveryOrder.lines.length) {
        throw apiError(422, "Delivery order must have lines before creating shipment", "BUSINESS_RULE_VIOLATION");
    }

    if (deliveryOrder.shipments.length) {
        throw apiError(409, "Delivery order already has an active shipment", "STATE_CONFLICT");
    }

    await ensureActiveTransportMode(body.transport_mode_id || deliveryOrder.transport_mode_id);
    await ensureActiveForwarder(body.forwarder_id);

    const finalQuotation = await resolveFinalQuotation(
        body.delivery_order_id,
        body.final_quotation_id
    );

    const data = mapShipmentData({
        ...body,
        mode: body.mode || "SEA",
        transport_mode_id: body.transport_mode_id || deliveryOrder.transport_mode_id,
        final_quotation_id: finalQuotation.id
    }, shipmentCreateColumns);

    return apiResult(await createShipmentFromDeliveryOrderRecord(data), {
        message: "Created successfully"
    });
}

export async function editShipment(id, body) {
    const shipment = await getRequiredShipment(id);
    ensureShipmentCanUpdate(shipment);
    validateShipmentHeader(body);

    await ensureActiveTransportMode(body.transport_mode_id);
    await ensureActiveForwarder(body.forwarder_id);

    const data = mapShipmentData(body);

    if (!Object.keys(data).length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    return apiResult(await updateShipment(id, data), {
        message: "Updated successfully"
    });
}

export async function cancelShipmentById(id, body = {}) {
    const shipment = await getRequiredShipment(id);

    if (shipment.status === shipmentStatuses.DELIVERED) {
        throw apiError(409, "Delivered shipment cannot be cancelled", "STATE_CONFLICT");
    }

    if (shipment.status === shipmentStatuses.CANCELLED) {
        throw apiError(409, "Shipment is already cancelled", "STATE_CONFLICT");
    }

    return apiResult(await cancelShipment(id, body.notes ?? body.note), {
        message: "Cancelled successfully"
    });
}

export async function listShipmentLines(id) {
    await getRequiredShipment(id);
    const lines = await findShipmentLines(id);

    return apiResult(lines, {
        total: lines.length
    });
}

export async function listShipmentMilestones(id) {
    await getRequiredShipment(id);
    const milestones = await findShipmentMilestones(id);

    return apiResult(milestones, {
        total: milestones.length
    });
}

export async function completeShipmentMilestone(id, milestoneCode, body = {}) {
    const shipment = await getRequiredShipment(id);

    if (!shipmentMilestoneCodes.includes(milestoneCode)) {
        throw apiError(400, "Invalid milestone code", "VALIDATION_ERROR");
    }

    if (shipment.status === shipmentStatuses.CANCELLED) {
        throw apiError(409, "Cancelled shipment cannot update milestones", "STATE_CONFLICT");
    }

    if (shipment.status === shipmentStatuses.DELIVERED) {
        throw apiError(409, "Delivered shipment cannot update milestones", "STATE_CONFLICT");
    }

    const milestone = await findShipmentMilestoneByCode(id, milestoneCode);

    if (!milestone) {
        throw apiError(404, "Shipment milestone not found", "NOT_FOUND");
    }

    return apiResult(await markShipmentMilestoneDone(id, milestoneCode, {
        actualAt: normalizeValue("actual_at", body.actual_at || new Date()),
        notes: body.notes ?? body.note ?? null
    }), {
        message: "Milestone completed successfully"
    });
}

export async function listShipmentDocuments(id) {
    await getRequiredShipment(id);
    const documents = await findShipmentDocuments(id);

    return apiResult(documents, {
        total: documents.length
    });
}

export async function addShipmentDocument(id, body) {
    const shipment = await getRequiredShipment(id);
    ensureShipmentCanReceiveDocument(shipment);
    validateDocumentBody(body, { isCreate: true });

    const milestone = await resolveMilestone(id, body);
    const data = mapDocumentData({
        ...body,
        milestone_id: milestone?.id || body.milestone_id || null,
        status: body.status || "RECEIVED"
    }, shipmentDocumentCreateColumns);

    return apiResult(await createShipmentDocument(id, data), {
        message: "Created successfully"
    });
}

export async function editShipmentDocument(id, body) {
    const document = await getRequiredDocument(id);
    const shipment = await getRequiredShipment(document.shipment_id);
    ensureShipmentCanReceiveDocument(shipment);
    validateDocumentBody(body);

    const milestone = await resolveMilestone(document.shipment_id, body);
    const data = mapDocumentData({
        ...body,
        milestone_id: milestone ? milestone.id : body.milestone_id
    });

    if (!Object.keys(data).length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    return apiResult(await updateShipmentDocument(id, data), {
        message: "Updated successfully"
    });
}

export async function removeShipmentDocument(id) {
    const document = await getRequiredDocument(id);
    const shipment = await getRequiredShipment(document.shipment_id);
    ensureShipmentCanReceiveDocument(shipment);

    return apiResult(await softDeleteShipmentDocument(id), {
        message: "Deleted successfully"
    });
}
