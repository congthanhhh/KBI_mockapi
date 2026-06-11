import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import {
    confirmationHeaderColumns,
    confirmationLineColumns,
    deliverySlotColumns,
    lotColumns,
    lotLockedStatuses,
    lotStatuses,
    poStatuses,
    purchaseOrderColumns,
    purchaseOrderLineColumns,
    slotStatuses
} from "./purchaseOrders.constants.js";
import {
    countActiveLotsByDeliverySlot,
    countActiveLotLines,
    createDeliverySlot,
    createEmptyLot,
    createPurchaseOrderConfirmation,
    createPurchaseOrderLineWithDefaultLot,
    createPurchaseOrderWithDefaults,
    findActiveDeliverySlotByNo,
    findActiveLotByNo,
    findDeliverySlotById,
    findDefaultLotByPurchaseOrderId,
    findLotById,
    findLotPlanning,
    findPurchaseOrderById,
    findPurchaseOrderLineById,
    findPurchaseOrderLines,
    findPurchaseOrders,
    mergeLots,
    moveLotToSlot,
    reorderLots,
    resetLotPlanningToDefault,
    softDeleteDeliverySlot,
    softDeleteLot,
    softDeletePurchaseOrder,
    softDeletePurchaseOrderLine,
    splitLot,
    sumActiveLotQtyByLine,
    transferLotLines,
    updateDeliverySlot,
    updateLot,
    updatePurchaseOrder,
    updatePurchaseOrderLine,
    updatePurchaseOrderState
} from "./purchaseOrders.repository.js";

const dateColumns = [
    "expected_etd",
    "expected_eta",
    "expected_eta_line",
    "confirmed_at",
    "cargo_ready_date",
    "planned_cargo_ready_date",
    "planned_etd",
    "planned_eta"
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

function validatePositiveQty(value, field) {
    if (Number(value) <= 0 || Number.isNaN(Number(value))) {
        throw apiError(400, `${field} must be greater than 0`, "VALIDATION_ERROR");
    }
}

function validateNonNegativeNumber(value, field) {
    if (value === null || value === "" || Number(value) < 0 || Number.isNaN(Number(value))) {
        throw apiError(400, `${field} must be greater than or equal to 0`, "VALIDATION_ERROR");
    }
}

function validateRate(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || numberValue > 100 || Number.isNaN(numberValue)) {
        throw apiError(400, `${field} must be between 0 and 100`, "VALIDATION_ERROR");
    }
}

function validateLineNumbersAndAmounts(body) {
    if (Object.hasOwn(body, "unit_price")) {
        validateNonNegativeNumber(body.unit_price, "unit_price");
    }

    if (Object.hasOwn(body, "tax_rate")) {
        validateRate(body.tax_rate, "tax_rate");
    }

    if (Object.hasOwn(body, "discount_pct")) {
        validateRate(body.discount_pct, "discount_pct");
    }
}

function validatePurchaseOrderFields(body) {
    if (Object.hasOwn(body, "exchange_rate")) {
        validatePositiveQty(body.exchange_rate, "exchange_rate");
    }

    if (body.po_type && !["SEA", "AIR", "DOMESTIC"].includes(body.po_type)) {
        throw apiError(400, "po_type must be SEA, AIR, or DOMESTIC", "VALIDATION_ERROR");
    }
}

function ensureDraft(purchaseOrder) {
    if (purchaseOrder.status !== poStatuses.DRAFT) {
        throw apiError(409, "Purchase order must be in DRAFT status", "STATE_CONFLICT");
    }
}

function ensureLotIsMovable(lot) {
    if (lotLockedStatuses.includes(lot.status)) {
        throw apiError(409, "LOT cannot be moved or split in current status", "STATE_CONFLICT");
    }
}

function validateLineBody(body) {
    requireField(body, "item_id");
    requireField(body, "line_no");
    requireField(body, "qty_ordered");
    requireField(body, "unit");
    validatePositiveQty(body.qty_ordered, "qty_ordered");
    validateLineNumbersAndAmounts(body);
}

function mapLineData(body) {
    return objectFromFields(pickAllowedFields(body, purchaseOrderLineColumns));
}

function validateLineNumbers(lines) {
    const lineNumbers = new Set();

    for (const line of lines) {
        if (lineNumbers.has(line.line_no)) {
            throw apiError(400, "line_no must be unique in purchase order", "VALIDATION_ERROR");
        }

        lineNumbers.add(line.line_no);
    }
}

async function getRequiredPurchaseOrder(id) {
    const purchaseOrder = await findPurchaseOrderById(id);

    if (!purchaseOrder) {
        throw apiError(404, "Purchase order not found", "VALIDATION_ERROR");
    }

    return purchaseOrder;
}

async function getRequiredLine(lineId) {
    const line = await findPurchaseOrderLineById(lineId);

    if (!line) {
        throw apiError(404, "Purchase order line not found", "VALIDATION_ERROR");
    }

    return line;
}

async function getRequiredLot(lotId) {
    const lot = await findLotById(lotId);

    if (!lot) {
        throw apiError(404, "LOT not found", "VALIDATION_ERROR");
    }

    return lot;
}

async function getRequiredDeliverySlot(slotId) {
    const deliverySlot = await findDeliverySlotById(slotId);

    if (!deliverySlot) {
        throw apiError(404, "Delivery slot not found", "VALIDATION_ERROR");
    }

    return deliverySlot;
}

async function ensureSlotNoIsAvailable(purchaseOrderId, slotNo, excludeSlotId = null) {
    const existingSlot = await findActiveDeliverySlotByNo(purchaseOrderId, slotNo, excludeSlotId);

    if (existingSlot) {
        throw apiError(409, "slot_no already exists in this purchase order", "STATE_CONFLICT");
    }
}

async function ensureLotNoIsAvailable(purchaseOrderId, lotNo, excludeLotId = null) {
    const existingLot = await findActiveLotByNo(purchaseOrderId, lotNo, excludeLotId);

    if (existingLot) {
        throw apiError(409, "lot_no already exists in this purchase order", "STATE_CONFLICT");
    }
}

export async function listPurchaseOrders({ search, status, supplierId, page, limit, offset }) {
    const { purchaseOrders, total } = await findPurchaseOrders({
        search,
        status,
        supplierId,
        limit,
        offset
    });

    return apiResult(purchaseOrders, {
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    });
}

export async function getPurchaseOrder(id) {
    return apiResult(await getRequiredPurchaseOrder(id));
}

export async function addPurchaseOrder(body) {
    requireField(body, "po_no");
    requireField(body, "supplier_id");
    validatePurchaseOrderFields(body);

    const fields = normalizeFields(pickAllowedFields(body, purchaseOrderColumns));
    const lines = Array.isArray(body.lines) ? body.lines : [];

    validateLineNumbers(lines);

    const lineData = lines.map((line) => {
        validateLineBody(line);
        return mapLineData(line);
    });

    const purchaseOrder = await createPurchaseOrderWithDefaults(fields, lineData);

    return apiResult(purchaseOrder, {
        message: "Created successfully"
    });
}

export async function editPurchaseOrder(id, body) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);
    ensureDraft(purchaseOrder);
    validatePurchaseOrderFields(body);

    const fields = normalizeFields(pickAllowedFields(body, purchaseOrderColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    return apiResult(await updatePurchaseOrder(id, fields), {
        message: "Updated successfully"
    });
}

export async function removePurchaseOrder(id) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);
    ensureDraft(purchaseOrder);

    return apiResult(await softDeletePurchaseOrder(id), {
        message: "Deleted successfully"
    });
}

export async function sendPurchaseOrder(id) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);

    if (purchaseOrder.status !== poStatuses.DRAFT) {
        throw apiError(409, "Only DRAFT purchase orders can be sent", "STATE_CONFLICT");
    }

    return apiResult(await updatePurchaseOrderState(id, {
        status: poStatuses.SENT,
        sent_at: new Date()
    }), {
        message: "Sent successfully"
    });
}

export async function cancelPurchaseOrder(id, body) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);

    if (![poStatuses.DRAFT, poStatuses.SENT].includes(purchaseOrder.status)) {
        throw apiError(409, "Only DRAFT or SENT purchase orders can be cancelled", "STATE_CONFLICT");
    }

    return apiResult(await updatePurchaseOrderState(id, {
        status: poStatuses.CANCELLED,
        cancelled_at: new Date(),
        cancel_reason: body.cancel_reason || null
    }), {
        message: "Cancelled successfully"
    });
}

export async function markPurchaseOrderInProduction(id) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);

    if (purchaseOrder.status !== poStatuses.CONFIRMED) {
        throw apiError(409, "Only CONFIRMED purchase orders can be marked in production", "STATE_CONFLICT");
    }

    return apiResult(await updatePurchaseOrderState(id, {
        status: poStatuses.IN_PRODUCTION
    }), {
        message: "Marked in production"
    });
}

export async function markPurchaseOrderReadyToShip(id) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);

    if (purchaseOrder.status !== poStatuses.IN_PRODUCTION) {
        throw apiError(409, "Only IN_PRODUCTION purchase orders can be marked ready to ship", "STATE_CONFLICT");
    }

    return apiResult(await updatePurchaseOrderState(id, {
        status: poStatuses.READY_TO_SHIP
    }), {
        message: "Marked ready to ship"
    });
}

export async function confirmPurchaseOrder(id, body) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);

    if (purchaseOrder.status !== poStatuses.SENT) {
        throw apiError(409, "Only SENT purchase orders can be confirmed", "STATE_CONFLICT");
    }

    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!lines.length) {
        throw apiError(400, "lines is required", "VALIDATION_ERROR");
    }

    const lineMap = new Map(purchaseOrder.lines.map((line) => [line.id, line]));
    const confirmedQtyByLine = new Map();
    const lineData = lines.map((line) => {
        requireField(line, "purchase_order_line_id");
        requireField(line, "confirmed_qty");
        validateNonNegativeNumber(line.confirmed_qty, "confirmed_qty");

        if (line.can_fulfill === false && Number(line.confirmed_qty) !== 0) {
            throw apiError(422, "confirmed_qty must be 0 when can_fulfill is false", "BUSINESS_RULE_VIOLATION");
        }

        const purchaseOrderLine = lineMap.get(line.purchase_order_line_id);

        if (!purchaseOrderLine) {
            throw apiError(400, "purchase_order_line_id must belong to purchase order", "VALIDATION_ERROR");
        }

        const nextConfirmedQty = (confirmedQtyByLine.get(line.purchase_order_line_id) || 0) + Number(line.confirmed_qty);
        confirmedQtyByLine.set(line.purchase_order_line_id, nextConfirmedQty);

        if (nextConfirmedQty > Number(purchaseOrderLine.qty_ordered)) {
            throw apiError(422, "confirmed_qty cannot exceed qty_ordered", "BUSINESS_RULE_VIOLATION");
        }

        return objectFromFields(pickAllowedFields(line, confirmationLineColumns));
    });

    const headerData = {
        ...objectFromFields(pickAllowedFields(body, confirmationHeaderColumns)),
        confirmed_at: body.confirmed_at ? new Date(body.confirmed_at) : new Date()
    };

    return apiResult(await createPurchaseOrderConfirmation(id, headerData, lineData), {
        message: "Confirmed successfully"
    });
}

export async function listPurchaseOrderLines(id) {
    await getRequiredPurchaseOrder(id);
    const lines = await findPurchaseOrderLines(id);

    return apiResult(lines, {
        total: lines.length
    });
}

export async function addPurchaseOrderLine(id, body) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);
    ensureDraft(purchaseOrder);
    validateLineBody(body);

    if (purchaseOrder.lines.some((line) => line.line_no === body.line_no)) {
        throw apiError(400, "line_no must be unique in purchase order", "VALIDATION_ERROR");
    }

    return apiResult(await createPurchaseOrderLineWithDefaultLot(id, mapLineData(body)), {
        message: "Created successfully"
    });
}

export async function editPurchaseOrderLine(lineId, body) {
    const line = await getRequiredLine(lineId);
    const purchaseOrder = await getRequiredPurchaseOrder(line.purchase_order_id);
    ensureDraft(purchaseOrder);

    const fields = normalizeFields(pickAllowedFields(body, purchaseOrderLineColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "qty_ordered")) {
        validatePositiveQty(body.qty_ordered, "qty_ordered");

        const lotQty = await sumActiveLotQtyByLine(lineId);

        if (Number(body.qty_ordered) < Number(lotQty)) {
            throw apiError(422, "qty_ordered cannot be less than current lotted quantity", "BUSINESS_RULE_VIOLATION");
        }
    }

    if (Object.hasOwn(body, "unit")) {
        requireField(body, "unit");
    }

    validateLineNumbersAndAmounts(body);

    if (Object.hasOwn(body, "line_no") && purchaseOrder.lines.some((poLine) => (
        poLine.id !== lineId && poLine.line_no === body.line_no
    ))) {
        throw apiError(400, "line_no must be unique in purchase order", "VALIDATION_ERROR");
    }

    return apiResult(await updatePurchaseOrderLine(lineId, fields), {
        message: "Updated successfully"
    });
}

export async function removePurchaseOrderLine(lineId) {
    const line = await getRequiredLine(lineId);
    const purchaseOrder = await getRequiredPurchaseOrder(line.purchase_order_id);
    ensureDraft(purchaseOrder);

    return apiResult(await softDeletePurchaseOrderLine(lineId), {
        message: "Deleted successfully"
    });
}

export async function getLotPlanning(id) {
    const planning = await findLotPlanning(id);

    if (!planning) {
        throw apiError(404, "Purchase order not found", "VALIDATION_ERROR");
    }

    return apiResult(planning);
}

export async function addDeliverySlot(id, body) {
    await getRequiredPurchaseOrder(id);
    requireField(body, "slot_no");

    if (body.status && !slotStatuses.includes(body.status)) {
        throw apiError(400, "Invalid slot status", "VALIDATION_ERROR");
    }

    await ensureSlotNoIsAvailable(id, body.slot_no);

    return apiResult(await createDeliverySlot(id, normalizeFields(pickAllowedFields(body, deliverySlotColumns))), {
        message: "Created successfully"
    });
}

export async function editDeliverySlot(slotId, body) {
    const deliverySlot = await getRequiredDeliverySlot(slotId);
    const fields = normalizeFields(pickAllowedFields(body, deliverySlotColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (body.status && !slotStatuses.includes(body.status)) {
        throw apiError(400, "Invalid slot status", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "slot_no")) {
        requireField(body, "slot_no");

        if (body.slot_no !== deliverySlot.slot_no) {
            await ensureSlotNoIsAvailable(deliverySlot.purchase_order_id, body.slot_no, deliverySlot.id);
        }
    }

    return apiResult(await updateDeliverySlot(deliverySlot.id, fields), {
        message: "Updated successfully"
    });
}

export async function removeDeliverySlot(slotId) {
    const deliverySlot = await getRequiredDeliverySlot(slotId);
    const activeLotCount = await countActiveLotsByDeliverySlot(deliverySlot.id);

    if (activeLotCount > 0) {
        throw apiError(409, "Delivery slot must be empty before delete", "STATE_CONFLICT");
    }

    return apiResult(await softDeleteDeliverySlot(deliverySlot.id), {
        message: "Deleted successfully"
    });
}

export async function addEmptyPurchaseOrderLot(id, body) {
    await getRequiredPurchaseOrder(id);
    requireField(body, "delivery_slot_id");
    requireField(body, "lot_no");

    const deliverySlot = await getRequiredDeliverySlot(body.delivery_slot_id);

    if (deliverySlot.purchase_order_id !== id) {
        throw apiError(400, "delivery_slot_id must belong to the purchase order", "VALIDATION_ERROR");
    }

    await ensureLotNoIsAvailable(id, body.lot_no);

    const fields = {
        ...objectFromFields(pickAllowedFields(body, lotColumns)),
        purchase_order_id: id,
        delivery_slot_id: deliverySlot.id,
        status: body.status || "PLANNED",
        sort_order: body.sort_order ?? 1
    };

    if (!lotStatuses.includes(fields.status)) {
        throw apiError(400, "Invalid LOT status", "VALIDATION_ERROR");
    }

    return apiResult(await createEmptyLot(fields), {
        message: "Created successfully"
    });
}

export async function editPurchaseOrderLot(lotId, body) {
    const lot = await getRequiredLot(lotId);
    const fields = normalizeFields(pickAllowedFields(body, lotColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (body.status && !lotStatuses.includes(body.status)) {
        throw apiError(400, "Invalid LOT status", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "lot_no")) {
        requireField(body, "lot_no");

        if (body.lot_no !== lot.lot_no) {
            await ensureLotNoIsAvailable(lot.purchase_order_id, body.lot_no, lot.id);
        }
    }

    return apiResult(await updateLot(lot.id, fields), {
        message: "Updated successfully"
    });
}

export async function removePurchaseOrderLot(lotId) {
    const lot = await getRequiredLot(lotId);
    ensureLotIsMovable(lot);

    const activeLineCount = await countActiveLotLines(lot.id);

    if (activeLineCount > 0) {
        throw apiError(409, "LOT must be empty before delete", "STATE_CONFLICT");
    }

    return apiResult(await softDeleteLot(lot.id), {
        message: "Deleted successfully"
    });
}

export async function mergePurchaseOrderLots(targetLotId, body) {
    const targetLot = await getRequiredLot(targetLotId);
    ensureLotIsMovable(targetLot);

    const sourceLotIds = Array.isArray(body.source_lot_ids) ? body.source_lot_ids : [];

    if (!sourceLotIds.length) {
        throw apiError(400, "source_lot_ids is required", "VALIDATION_ERROR");
    }

    const uniqueSourceLotIds = [...new Set(sourceLotIds)];

    if (uniqueSourceLotIds.includes(targetLot.id)) {
        throw apiError(400, "source_lot_ids cannot include target LOT", "VALIDATION_ERROR");
    }

    for (const sourceLotId of uniqueSourceLotIds) {
        const sourceLot = await getRequiredLot(sourceLotId);
        ensureLotIsMovable(sourceLot);

        if (sourceLot.purchase_order_id !== targetLot.purchase_order_id) {
            throw apiError(400, "source LOTs must belong to the same purchase order", "VALIDATION_ERROR");
        }
    }

    return apiResult(await mergeLots(targetLot.id, {
        sourceLotIds: uniqueSourceLotIds,
        deleteEmptySourceLots: body.delete_empty_source_lots !== false
    }), {
        message: "Merged successfully"
    });
}

export async function mergePurchaseOrderLotBackToDefault(sourceLotId, body = {}) {
    const sourceLot = await getRequiredLot(sourceLotId);
    ensureLotIsMovable(sourceLot);

    const defaultLot = await findDefaultLotByPurchaseOrderId(sourceLot.purchase_order_id);

    if (!defaultLot) {
        throw apiError(404, "Default LOT not found", "VALIDATION_ERROR");
    }

    if (defaultLot.id === sourceLot.id) {
        throw apiError(400, "source LOT is already the default LOT", "VALIDATION_ERROR");
    }

    ensureLotIsMovable(defaultLot);

    return apiResult(await mergeLots(defaultLot.id, {
        sourceLotIds: [sourceLot.id],
        deleteEmptySourceLots: body.delete_empty_source_lots !== false
    }), {
        message: "Merged back to default LOT successfully"
    });
}

export async function transferPurchaseOrderLotLines(sourceLotId, body) {
    const sourceLot = await getRequiredLot(sourceLotId);
    ensureLotIsMovable(sourceLot);
    requireField(body, "target_lot_id");

    const targetLot = await getRequiredLot(body.target_lot_id);
    ensureLotIsMovable(targetLot);

    if (targetLot.id === sourceLot.id) {
        throw apiError(400, "target_lot_id must be different from source LOT", "VALIDATION_ERROR");
    }

    if (targetLot.purchase_order_id !== sourceLot.purchase_order_id) {
        throw apiError(400, "target_lot_id must belong to the same purchase order", "VALIDATION_ERROR");
    }

    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!lines.length) {
        throw apiError(400, "lines is required", "VALIDATION_ERROR");
    }

    const transferLines = lines.map((line) => {
        requireField(line, "purchase_order_line_id");
        requireField(line, "transfer_qty");
        validatePositiveQty(line.transfer_qty, "transfer_qty");

        const sourceLine = sourceLot.lot_lines.find((lotLine) => (
            lotLine.purchase_order_line_id === line.purchase_order_line_id
        ));

        if (!sourceLine) {
            throw apiError(400, "purchase_order_line_id must exist in source LOT", "VALIDATION_ERROR");
        }

        if (Number(line.transfer_qty) > Number(sourceLine.qty_lotted)) {
            throw apiError(422, "transfer_qty cannot exceed source LOT line quantity", "BUSINESS_RULE_VIOLATION");
        }

        return {
            purchase_order_line_id: line.purchase_order_line_id,
            transfer_qty: line.transfer_qty,
            notes: line.notes
        };
    });

    return apiResult(await transferLotLines(sourceLot.id, {
        targetLotId: targetLot.id,
        transferLines
    }), {
        message: "Transferred successfully"
    });
}

export async function resetPurchaseOrderLotPlanning(id) {
    const purchaseOrder = await getRequiredPurchaseOrder(id);
    const lots = purchaseOrder.delivery_slots.flatMap((slot) => slot.lots);

    if (lots.some((lot) => lotLockedStatuses.includes(lot.status))) {
        throw apiError(409, "Cannot reset LOT planning when a LOT is assigned, shipped, or cancelled", "STATE_CONFLICT");
    }

    return apiResult(await resetLotPlanningToDefault(id), {
        message: "Reset successfully"
    });
}

export async function splitPurchaseOrderLot(lotId, body) {
    const lot = await getRequiredLot(lotId);
    ensureLotIsMovable(lot);
    requireField(body, "new_lot_no");
    requireField(body, "target_slot_id");

    const targetSlot = await getRequiredDeliverySlot(body.target_slot_id);

    if (targetSlot.purchase_order_id !== lot.purchase_order_id) {
        throw apiError(400, "target_slot_id must belong to the same purchase order", "VALIDATION_ERROR");
    }

    await ensureLotNoIsAvailable(lot.purchase_order_id, body.new_lot_no);

    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!lines.length) {
        throw apiError(400, "lines is required", "VALIDATION_ERROR");
    }

    const splitLines = lines.map((line) => {
        requireField(line, "purchase_order_line_id");
        requireField(line, "split_qty");
        validatePositiveQty(line.split_qty, "split_qty");

        const sourceLine = lot.lot_lines.find((lotLine) => (
            lotLine.purchase_order_line_id === line.purchase_order_line_id
        ));

        if (!sourceLine) {
            throw apiError(400, "purchase_order_line_id must exist in source LOT", "VALIDATION_ERROR");
        }

        if (Number(line.split_qty) > Number(sourceLine.qty_lotted)) {
            throw apiError(422, "split_qty cannot exceed source LOT line quantity", "BUSINESS_RULE_VIOLATION");
        }

        return {
            purchase_order_line_id: line.purchase_order_line_id,
            split_qty: line.split_qty,
            notes: line.notes
        };
    });

    const newLotData = {
        purchase_order_id: lot.purchase_order_id,
        delivery_slot_id: targetSlot.id,
        lot_no: body.new_lot_no,
        lot_name: body.new_lot_name || body.lot_name || null,
        status: body.status || "PLANNED",
        planned_cargo_ready_date: body.planned_cargo_ready_date ? new Date(body.planned_cargo_ready_date) : null,
        planned_etd: body.planned_etd ? new Date(body.planned_etd) : null,
        planned_eta: body.planned_eta ? new Date(body.planned_eta) : null,
        sort_order: body.sort_order || 1,
        notes: body.notes || null
    };

    if (!lotStatuses.includes(newLotData.status)) {
        throw apiError(400, "Invalid LOT status", "VALIDATION_ERROR");
    }

    return apiResult(await splitLot(lotId, {
        newLotData,
        splitLines
    }), {
        message: "Split successfully"
    });
}

export async function movePurchaseOrderLot(lotId, body) {
    const lot = await getRequiredLot(lotId);
    ensureLotIsMovable(lot);
    requireField(body, "target_slot_id");

    const targetSlot = await getRequiredDeliverySlot(body.target_slot_id);

    if (targetSlot.purchase_order_id !== lot.purchase_order_id) {
        throw apiError(400, "target_slot_id must belong to the same purchase order", "VALIDATION_ERROR");
    }

    return apiResult(await moveLotToSlot(lotId, {
        delivery_slot_id: targetSlot.id,
        sort_order: body.new_sort_order ?? body.sort_order ?? lot.sort_order
    }), {
        message: "Moved successfully"
    });
}

export async function reorderPurchaseOrderLots(body) {
    const lots = Array.isArray(body.lots) ? body.lots : [];

    if (!lots.length) {
        throw apiError(400, "lots is required", "VALIDATION_ERROR");
    }

    const reorderLines = [];

    for (const line of lots) {
        requireField(line, "lot_id");
        requireField(line, "delivery_slot_id");
        requireField(line, "sort_order");

        const lot = await getRequiredLot(line.lot_id);
        ensureLotIsMovable(lot);

        const targetSlot = await getRequiredDeliverySlot(line.delivery_slot_id);

        if (targetSlot.purchase_order_id !== lot.purchase_order_id) {
            throw apiError(400, "delivery_slot_id must belong to the same purchase order", "VALIDATION_ERROR");
        }

        reorderLines.push({
            lot_id: line.lot_id,
            delivery_slot_id: line.delivery_slot_id,
            sort_order: line.sort_order
        });
    }

    return apiResult(await reorderLots(reorderLines), {
        message: "Reordered successfully"
    });
}
