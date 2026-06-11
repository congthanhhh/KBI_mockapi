import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import {
    allowedPurchaseOrderStatusesForDeliveryOrder,
    deliveryOrderColumns,
    deliveryOrderCreateColumns,
    deliveryOrderStatuses,
    lockedDeliveryOrderStatuses,
    lockedLotStatuses
} from "./deliveryOrders.constants.js";
import {
    cancelDeliveryOrderWithLinks,
    createDeliveryOrder,
    createDeliveryOrderFromLots,
    findActiveDeliveryOrderLotsByPoLotIds,
    findDeliveryOrderById,
    findDeliveryOrderLines,
    findDeliveryOrderLots,
    findDeliveryOrders,
    findDeliveryOrdersByPurchaseOrderId,
    findPoLotsByIds,
    findPurchaseOrderForDeliveryOrder,
    softDeleteDeliveryOrder,
    updateDeliveryOrder,
    updateDeliveryOrderStatus
} from "./deliveryOrders.repository.js";

const dateColumns = [
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

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw apiError(400, `${field} is required`, "VALIDATION_ERROR");
    }
}

function ensureDeliveryOrderCanChangeStructure(deliveryOrder) {
    if (lockedDeliveryOrderStatuses.includes(deliveryOrder.status)) {
        throw apiError(409, "Delivery order is locked in current status", "STATE_CONFLICT");
    }
}

function ensurePurchaseOrderCanCreateDeliveryOrder(purchaseOrder) {
    if (!allowedPurchaseOrderStatusesForDeliveryOrder.includes(purchaseOrder.status)) {
        throw apiError(409, "Purchase order must be CONFIRMED, IN_PRODUCTION, or READY_TO_SHIP", "STATE_CONFLICT");
    }
}

function ensureTransition(deliveryOrder, allowedStatuses, nextStatus) {
    if (!allowedStatuses.includes(deliveryOrder.status)) {
        throw apiError(409, `Delivery order cannot move from ${deliveryOrder.status} to ${nextStatus}`, "STATE_CONFLICT");
    }
}

async function getRequiredDeliveryOrder(id) {
    const deliveryOrder = await findDeliveryOrderById(id);

    if (!deliveryOrder) {
        throw apiError(404, "Delivery order not found", "NOT_FOUND");
    }

    return deliveryOrder;
}

async function getRequiredPurchaseOrder(id) {
    const purchaseOrder = await findPurchaseOrderForDeliveryOrder(id);

    if (!purchaseOrder) {
        throw apiError(404, "Purchase order not found", "NOT_FOUND");
    }

    return purchaseOrder;
}

async function validateLotsForDeliveryOrder(purchaseOrderId, lotIds) {
    const uniqueLotIds = [...new Set(lotIds)];

    if (!uniqueLotIds.length) {
        throw apiError(400, "lot_ids is required", "VALIDATION_ERROR");
    }

    if (uniqueLotIds.length !== lotIds.length) {
        throw apiError(400, "lot_ids must be unique", "VALIDATION_ERROR");
    }

    const lots = await findPoLotsByIds(uniqueLotIds);

    if (lots.length !== uniqueLotIds.length) {
        throw apiError(404, "One or more LOTs were not found", "NOT_FOUND");
    }

    for (const lot of lots) {
        if (lot.purchase_order_id !== purchaseOrderId) {
            throw apiError(400, "lot_ids must belong to the purchase order", "VALIDATION_ERROR");
        }

        if (lockedLotStatuses.includes(lot.status)) {
            throw apiError(409, "LOT is locked in current status", "STATE_CONFLICT");
        }

        if (!lot.lot_lines.length) {
            throw apiError(422, "LOT must contain at least one active line", "BUSINESS_RULE_VIOLATION");
        }

        for (const lotLine of lot.lot_lines) {
            if (!lotLine.unit && !lotLine.purchase_order_line.unit) {
                throw apiError(422, "LOT line unit is required to create delivery order line", "BUSINESS_RULE_VIOLATION");
            }
        }
    }

    const usedLots = await findActiveDeliveryOrderLotsByPoLotIds(uniqueLotIds);

    if (usedLots.length) {
        throw apiError(409, "One or more LOTs already belong to an active delivery order", "STATE_CONFLICT");
    }

    const orderByRequest = new Map(uniqueLotIds.map((lotId, index) => [lotId, index]));

    return lots.sort((left, right) => orderByRequest.get(left.id) - orderByRequest.get(right.id));
}

function createFieldsFromBody(body) {
    return normalizeFields(pickAllowedFields(body, deliveryOrderCreateColumns));
}

export async function listDeliveryOrders({ search, status, purchaseOrderId, transportModeId, page, limit, offset }) {
    const { deliveryOrders, total } = await findDeliveryOrders({
        search,
        status,
        purchaseOrderId,
        transportModeId,
        limit,
        offset
    });

    return apiResult(deliveryOrders, {
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    });
}

export async function getDeliveryOrder(id) {
    return apiResult(await getRequiredDeliveryOrder(id));
}

export async function addDeliveryOrder(body) {
    requireField(body, "do_no");
    requireField(body, "purchase_order_id");

    const purchaseOrder = await getRequiredPurchaseOrder(body.purchase_order_id);
    ensurePurchaseOrderCanCreateDeliveryOrder(purchaseOrder);

    return apiResult(await createDeliveryOrder(createFieldsFromBody(body)), {
        message: "Created successfully"
    });
}

export async function addDeliveryOrderFromLots(body) {
    requireField(body, "do_no");
    requireField(body, "purchase_order_id");

    const lotIds = Array.isArray(body.lot_ids) ? body.lot_ids : [];
    const purchaseOrder = await getRequiredPurchaseOrder(body.purchase_order_id);
    ensurePurchaseOrderCanCreateDeliveryOrder(purchaseOrder);

    const lots = await validateLotsForDeliveryOrder(body.purchase_order_id, lotIds);

    return apiResult(await createDeliveryOrderFromLots(createFieldsFromBody(body), lots), {
        message: "Created successfully"
    });
}

export async function editDeliveryOrder(id, body) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureDeliveryOrderCanChangeStructure(deliveryOrder);

    const fields = normalizeFields(pickAllowedFields(body, deliveryOrderColumns));

    if (!fields.length) {
        throw apiError(400, "No valid fields to update", "VALIDATION_ERROR");
    }

    if (Object.hasOwn(body, "do_no")) {
        requireField(body, "do_no");
    }

    return apiResult(await updateDeliveryOrder(id, fields), {
        message: "Updated successfully"
    });
}

export async function removeDeliveryOrder(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureDeliveryOrderCanChangeStructure(deliveryOrder);

    return apiResult(await softDeleteDeliveryOrder(id), {
        message: "Deleted successfully"
    });
}

export async function markDeliveryOrderReadyForQuotation(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureTransition(deliveryOrder, [deliveryOrderStatuses.DRAFT], deliveryOrderStatuses.READY_FOR_QUOTATION);

    return apiResult(await updateDeliveryOrderStatus(id, deliveryOrderStatuses.READY_FOR_QUOTATION), {
        message: "Marked ready for quotation"
    });
}

export async function confirmDeliveryOrderQuotation(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureTransition(
        deliveryOrder,
        [deliveryOrderStatuses.READY_FOR_QUOTATION],
        deliveryOrderStatuses.QUOTATION_CONFIRMED
    );

    return apiResult(await updateDeliveryOrderStatus(id, deliveryOrderStatuses.QUOTATION_CONFIRMED), {
        message: "Quotation confirmed"
    });
}

export async function assignDeliveryOrderToShipment(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureTransition(
        deliveryOrder,
        [deliveryOrderStatuses.QUOTATION_CONFIRMED],
        deliveryOrderStatuses.ASSIGNED_TO_SHIPMENT
    );

    if (!deliveryOrder.lots.length) {
        throw apiError(422, "Delivery order must contain at least one LOT", "BUSINESS_RULE_VIOLATION");
    }

    return apiResult(await updateDeliveryOrderStatus(id, deliveryOrderStatuses.ASSIGNED_TO_SHIPMENT), {
        message: "Assigned to shipment"
    });
}

export async function cancelDeliveryOrder(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureTransition(
        deliveryOrder,
        [
            deliveryOrderStatuses.DRAFT,
            deliveryOrderStatuses.READY_FOR_QUOTATION,
            deliveryOrderStatuses.QUOTATION_CONFIRMED
        ],
        deliveryOrderStatuses.CANCELLED
    );

    return apiResult(await cancelDeliveryOrderWithLinks(id), {
        message: "Cancelled successfully"
    });
}

export async function closeDeliveryOrder(id) {
    const deliveryOrder = await getRequiredDeliveryOrder(id);
    ensureTransition(deliveryOrder, [deliveryOrderStatuses.ASSIGNED_TO_SHIPMENT], deliveryOrderStatuses.CLOSED);

    return apiResult(await updateDeliveryOrderStatus(id, deliveryOrderStatuses.CLOSED), {
        message: "Closed successfully"
    });
}

export async function listDeliveryOrdersByPurchaseOrder(purchaseOrderId) {
    await getRequiredPurchaseOrder(purchaseOrderId);
    const deliveryOrders = await findDeliveryOrdersByPurchaseOrderId(purchaseOrderId);

    return apiResult(deliveryOrders, {
        total: deliveryOrders.length
    });
}

export async function listDeliveryOrderLots(id) {
    await getRequiredDeliveryOrder(id);
    const lots = await findDeliveryOrderLots(id);

    return apiResult(lots, {
        total: lots.length
    });
}

export async function listDeliveryOrderLines(id) {
    await getRequiredDeliveryOrder(id);
    const lines = await findDeliveryOrderLines(id);

    return apiResult(lines, {
        total: lines.length
    });
}
