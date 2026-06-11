import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import {
    lockedDeliveryOrderStatusesForQuotation,
    lockedQuotationStatuses,
    quotationChargeLineColumns,
    quotationChargeTypes,
    quotationColumns,
    quotationCreateColumns,
    quotationRefTypes,
    quotationStatuses,
    quotationTypes,
    terminalQuotationStatuses
} from "./quotations.constants.js";
import {
    createQuotation,
    createQuotationChargeLine,
    createQuotationVersion,
    findChargeLineById,
    findChargeLinesByQuotationId,
    findCurrencyForQuotation,
    findDeliveryOrderForQuotation,
    findEventsByQuotationId,
    findQuotationById,
    findQuotationVersions,
    findQuotations,
    findQuotationsByDeliveryOrderId,
    findSupplierForQuotation,
    markQuotationFinal,
    softDeleteQuotation,
    softDeleteQuotationChargeLine,
    updateQuotation,
    updateQuotationChargeLine,
    updateQuotationStatus
} from "./quotations.repository.js";

const dateColumns = [
    "quoted_at",
    "valid_until"
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

function normalizeValue(column, value) {
    if (value === undefined) {
        return value;
    }

    if (value === "") {
        return null;
    }

    if (dateColumns.includes(column) && value !== null) {
        return new Date(value);
    }

    return value;
}

function normalizeFields(fields) {
    return fields.map(([column, value]) => [column, normalizeValue(column, value)]);
}

function objectFromFields(fields) {
    return Object.fromEntries(normalizeFields(fields));
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw apiError(400, `${field} is required`, "VALIDATION_ERROR");
    }
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

function validateQuotationHeader(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "quotation_no");
        requireField(body, "ref_type");
        requireField(body, "ref_id");
        requireField(body, "supplier_id");
        requireField(body, "quotation_type");
        requireField(body, "currency_id");
    }

    if (Object.hasOwn(body, "quotation_no")) {
        requireField(body, "quotation_no");
    }

    if (Object.hasOwn(body, "supplier_id")) {
        requireField(body, "supplier_id");
    }

    if (Object.hasOwn(body, "currency_id")) {
        requireField(body, "currency_id");
    }

    if (Object.hasOwn(body, "ref_type") && !quotationRefTypes.includes(body.ref_type)) {
        throw apiError(400, "Invalid quotation ref_type", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "quotation_type") && !quotationTypes.includes(body.quotation_type)) {
        throw apiError(400, "Invalid quotation_type", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "exchange_rate")) {
        validatePositiveNumber(body.exchange_rate, "exchange_rate");
    }
}

function validateChargeLineBody(body, { isCreate = false } = {}) {
    if (isCreate) {
        requireField(body, "line_no");
        requireField(body, "charge_type");
        requireField(body, "description");
    }

    if (Object.hasOwn(body, "line_no")) {
        validatePositiveNumber(body.line_no, "line_no");
    }

    if (Object.hasOwn(body, "charge_type") && !quotationChargeTypes.includes(body.charge_type)) {
        throw apiError(400, "Invalid charge_type", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "description")) {
        requireField(body, "description");
    }

    if (Object.hasOwn(body, "quantity")) {
        validatePositiveNumber(body.quantity, "quantity");
    }

    if (Object.hasOwn(body, "unit_price")) {
        validateNonNegativeNumber(body.unit_price, "unit_price");
    }

    if (Object.hasOwn(body, "tax_rate")) {
        validateRate(body.tax_rate, "tax_rate");
    }
}

function validateUniqueLineNumbers(chargeLines) {
    const lineNumbers = new Set();

    for (const line of chargeLines) {
        if (lineNumbers.has(line.line_no)) {
            throw apiError(400, "line_no must be unique in quotation", "VALIDATION_ERROR");
        }

        lineNumbers.add(line.line_no);
    }
}

function ensureQuotationCanUpdateHeader(quotation) {
    if (lockedQuotationStatuses.includes(quotation.status)) {
        throw apiError(409, "Quotation is locked in current status", "STATE_CONFLICT");
    }
}

function ensureQuotationCanChangeChargeLines(quotation) {
    if (lockedQuotationStatuses.includes(quotation.status)) {
        throw apiError(409, "Cannot change charge lines in current quotation status", "STATE_CONFLICT");
    }
}

function ensureTransition(quotation, allowedStatuses, nextStatus) {
    if (!allowedStatuses.includes(quotation.status)) {
        throw apiError(409, `Quotation cannot move from ${quotation.status} to ${nextStatus}`, "STATE_CONFLICT");
    }
}

async function getRequiredQuotation(id) {
    const quotation = await findQuotationById(id);

    if (!quotation) {
        throw apiError(404, "Quotation not found", "NOT_FOUND");
    }

    return quotation;
}

async function getRequiredDeliveryOrder(id) {
    const deliveryOrder = await findDeliveryOrderForQuotation(id);

    if (!deliveryOrder) {
        throw apiError(404, "Delivery order not found", "NOT_FOUND");
    }

    return deliveryOrder;
}

async function getRequiredChargeLine(id) {
    const chargeLine = await findChargeLineById(id);

    if (!chargeLine) {
        throw apiError(404, "Quotation charge line not found", "NOT_FOUND");
    }

    return chargeLine;
}

async function ensureActiveSupplier(id) {
    const supplier = await findSupplierForQuotation(id);

    if (!supplier) {
        throw apiError(404, "Supplier not found", "NOT_FOUND");
    }

    if (!supplier.is_active) {
        throw apiError(409, "Supplier is inactive", "STATE_CONFLICT");
    }
}

async function ensureActiveCurrency(id) {
    const currency = await findCurrencyForQuotation(id);

    if (!currency) {
        throw apiError(404, "Currency not found", "NOT_FOUND");
    }

    if (!currency.is_active) {
        throw apiError(409, "Currency is inactive", "STATE_CONFLICT");
    }
}

async function ensureDeliveryOrderCanReceiveQuotation(deliveryOrder) {
    if (lockedDeliveryOrderStatusesForQuotation.includes(deliveryOrder.status)) {
        throw apiError(409, "Delivery order is locked for quotation", "STATE_CONFLICT");
    }
}

async function validateQuotationReferences(body) {
    if (body.ref_type === "DELIVERY_ORDER") {
        const deliveryOrder = await getRequiredDeliveryOrder(body.ref_id);
        await ensureDeliveryOrderCanReceiveQuotation(deliveryOrder);
    }

    if (body.supplier_id) {
        await ensureActiveSupplier(body.supplier_id);
    }

    if (body.currency_id) {
        await ensureActiveCurrency(body.currency_id);
    }
}

function mapQuotationData(body, columns = quotationColumns) {
    return objectFromFields(pickAllowedFields(body, columns));
}

function mapChargeLineData(body) {
    return objectFromFields(pickAllowedFields(body, quotationChargeLineColumns));
}

export async function listQuotations({
    search,
    refType,
    refId,
    status,
    supplierId,
    fromDate,
    toDate,
    page,
    limit,
    offset
}) {
    if (status && !Object.values(quotationStatuses).includes(status)) {
        throw apiError(400, "Invalid quotation status", "VALIDATION_ERROR");
    }

    if (refType && !quotationRefTypes.includes(refType)) {
        throw apiError(400, "Invalid quotation ref_type", "VALIDATION_ERROR");
    }

    const { quotations, total } = await findQuotations({
        search,
        refType,
        refId,
        status,
        supplierId,
        fromDate: normalizeDateFilter(fromDate),
        toDate: normalizeDateFilter(toDate, true),
        limit,
        offset
    });

    return apiResult(quotations, {
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    });
}

export async function getQuotation(id) {
    return apiResult(await getRequiredQuotation(id));
}

export async function listDeliveryOrderQuotations(deliveryOrderId) {
    await getRequiredDeliveryOrder(deliveryOrderId);
    const quotations = await findQuotationsByDeliveryOrderId(deliveryOrderId);

    return apiResult(quotations, {
        total: quotations.length
    });
}

export async function addDeliveryOrderQuotation(deliveryOrderId, body) {
    const deliveryOrder = await getRequiredDeliveryOrder(deliveryOrderId);
    await ensureDeliveryOrderCanReceiveQuotation(deliveryOrder);

    const quotationBody = {
        ...body,
        ref_type: "DELIVERY_ORDER",
        ref_id: deliveryOrderId
    };

    validateQuotationHeader(quotationBody, { isCreate: true });
    await validateQuotationReferences(quotationBody);

    const chargeLines = Array.isArray(body.charge_lines) ? body.charge_lines : [];
    validateUniqueLineNumbers(chargeLines);

    const chargeLineData = chargeLines.map((line) => {
        validateChargeLineBody(line, { isCreate: true });
        return mapChargeLineData(line);
    });

    return apiResult(await createQuotation(
        Object.entries(mapQuotationData(quotationBody, quotationCreateColumns)),
        chargeLineData
    ), {
        message: "Created successfully"
    });
}

export async function editQuotation(id, body) {
    const quotation = await getRequiredQuotation(id);
    ensureQuotationCanUpdateHeader(quotation);
    validateQuotationHeader(body);

    if (body.supplier_id) {
        await ensureActiveSupplier(body.supplier_id);
    }

    if (body.currency_id) {
        await ensureActiveCurrency(body.currency_id);
    }

    const fields = normalizeFields(pickAllowedFields(body, quotationColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    return apiResult(await updateQuotation(id, fields), {
        message: "Updated successfully"
    });
}

export async function removeQuotation(id) {
    const quotation = await getRequiredQuotation(id);
    ensureQuotationCanUpdateHeader(quotation);

    return apiResult(await softDeleteQuotation(id), {
        message: "Deleted successfully"
    });
}

export async function requestQuotation(id) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [quotationStatuses.DRAFT], quotationStatuses.REQUESTED);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.REQUESTED
    }), {
        message: "Requested successfully"
    });
}

export async function receiveQuotation(id) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [
        quotationStatuses.DRAFT,
        quotationStatuses.REQUESTED
    ], quotationStatuses.RECEIVED);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.RECEIVED,
        quoted_at: quotation.quoted_at || new Date()
    }), {
        message: "Received successfully"
    });
}

export async function submitQuotationToKbi(id) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [quotationStatuses.RECEIVED], quotationStatuses.SUBMITTED_TO_KBI);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.SUBMITTED_TO_KBI,
        submitted_at: new Date()
    }), {
        message: "Submitted to KBI successfully"
    });
}

export async function confirmQuotationByKbi(id, body = {}) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [
        quotationStatuses.RECEIVED,
        quotationStatuses.SUBMITTED_TO_KBI
    ], quotationStatuses.CONFIRMED_BY_KBI);

    if (!quotation.charge_lines.length) {
        throw apiError(422, "Cannot confirm quotation without charge lines", "BUSINESS_RULE_VIOLATION");
    }

    return apiResult(await markQuotationFinal(id, {
        actorName: body.actor_name || null,
        note: body.note || null
    }), {
        message: "Confirmed by KBI successfully"
    });
}

export async function rejectQuotation(id, body = {}) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [
        quotationStatuses.REQUESTED,
        quotationStatuses.RECEIVED,
        quotationStatuses.SUBMITTED_TO_KBI
    ], quotationStatuses.REJECTED);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.REJECTED,
        rejected_at: new Date(),
        note: body.note ?? quotation.note
    }), {
        message: "Rejected successfully"
    });
}

export async function cancelQuotation(id, body = {}) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [
        quotationStatuses.DRAFT,
        quotationStatuses.REQUESTED,
        quotationStatuses.RECEIVED
    ], quotationStatuses.CANCELLED);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.CANCELLED,
        cancelled_at: new Date(),
        note: body.note ?? quotation.note
    }), {
        message: "Cancelled successfully"
    });
}

export async function expireQuotation(id, body = {}) {
    const quotation = await getRequiredQuotation(id);
    ensureTransition(quotation, [
        quotationStatuses.REQUESTED,
        quotationStatuses.RECEIVED,
        quotationStatuses.SUBMITTED_TO_KBI
    ], quotationStatuses.EXPIRED);

    return apiResult(await updateQuotationStatus(id, {
        status: quotationStatuses.EXPIRED,
        note: body.note ?? quotation.note
    }), {
        message: "Expired successfully"
    });
}

export async function addQuotationVersion(id, body = {}) {
    const quotation = await getRequiredQuotation(id);

    if ([
        quotationStatuses.CANCELLED,
        quotationStatuses.EXPIRED
    ].includes(quotation.status)) {
        throw apiError(409, "Cannot create version from cancelled or expired quotation", "STATE_CONFLICT");
    }

    return apiResult(await createQuotationVersion(id, {
        newQuotationNo: body.new_quotation_no || null,
        actorName: body.actor_name || null,
        note: body.note || null
    }), {
        message: "Version created successfully"
    });
}

export async function listQuotationVersions(id) {
    const quotation = await getRequiredQuotation(id);
    const versions = await findQuotationVersions(quotation.quotation_group_id);

    return apiResult(versions, {
        total: versions.length
    });
}

export async function listQuotationChargeLines(id) {
    await getRequiredQuotation(id);
    const chargeLines = await findChargeLinesByQuotationId(id);

    return apiResult(chargeLines, {
        total: chargeLines.length
    });
}

export async function addQuotationChargeLine(id, body) {
    const quotation = await getRequiredQuotation(id);
    ensureQuotationCanChangeChargeLines(quotation);
    validateChargeLineBody(body, { isCreate: true });

    if (quotation.charge_lines.some((line) => line.line_no === body.line_no)) {
        throw apiError(400, "line_no must be unique in quotation", "VALIDATION_ERROR");
    }

    return apiResult(await createQuotationChargeLine(id, mapChargeLineData(body)), {
        message: "Created successfully"
    });
}

export async function editQuotationChargeLine(lineId, body) {
    const chargeLine = await getRequiredChargeLine(lineId);
    const quotation = await getRequiredQuotation(chargeLine.quotation_id);
    ensureQuotationCanChangeChargeLines(quotation);
    validateChargeLineBody(body);

    const data = mapChargeLineData(body);

    if (!Object.keys(data).length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (
        Object.hasOwn(body, "line_no")
        && quotation.charge_lines.some((line) => line.id !== lineId && line.line_no === body.line_no)
    ) {
        throw apiError(400, "line_no must be unique in quotation", "VALIDATION_ERROR");
    }

    return apiResult(await updateQuotationChargeLine(lineId, data), {
        message: "Updated successfully"
    });
}

export async function removeQuotationChargeLine(lineId) {
    const chargeLine = await getRequiredChargeLine(lineId);
    const quotation = await getRequiredQuotation(chargeLine.quotation_id);
    ensureQuotationCanChangeChargeLines(quotation);

    return apiResult(await softDeleteQuotationChargeLine(lineId), {
        message: "Deleted successfully"
    });
}

export async function listQuotationEvents(id) {
    await getRequiredQuotation(id);
    const events = await findEventsByQuotationId(id);

    return apiResult(events, {
        total: events.length
    });
}
