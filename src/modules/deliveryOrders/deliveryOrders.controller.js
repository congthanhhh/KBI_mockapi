import { parsePagination } from "../../utils/pagination.js";
import {
    addDeliveryOrder,
    addDeliveryOrderFromLots,
    assignDeliveryOrderToShipment,
    cancelDeliveryOrder,
    closeDeliveryOrder,
    confirmDeliveryOrderQuotation,
    editDeliveryOrder,
    getDeliveryOrder,
    listDeliveryOrderLines,
    listDeliveryOrderLots,
    listDeliveryOrders,
    listDeliveryOrdersByPurchaseOrder,
    markDeliveryOrderReadyForQuotation,
    removeDeliveryOrder
} from "./deliveryOrders.service.js";

export async function getDeliveryOrders(req, res) {
    const pagination = parsePagination(req.query);

    res.json(await listDeliveryOrders({
        search: req.query.search || req.query.q,
        status: req.query.status,
        purchaseOrderId: req.query.purchase_order_id,
        transportModeId: req.query.transport_mode_id,
        ...pagination
    }));
}

export async function getDeliveryOrderById(req, res) {
    res.json(await getDeliveryOrder(req.params.id));
}

export async function createDeliveryOrder(req, res) {
    res.status(201).json(await addDeliveryOrder(req.body));
}

export async function createDeliveryOrderFromLots(req, res) {
    res.status(201).json(await addDeliveryOrderFromLots(req.body));
}

export async function updateDeliveryOrder(req, res) {
    res.json(await editDeliveryOrder(req.params.id, req.body));
}

export async function deleteDeliveryOrder(req, res) {
    res.json(await removeDeliveryOrder(req.params.id));
}

export async function readyForQuotation(req, res) {
    res.json(await markDeliveryOrderReadyForQuotation(req.params.id));
}

export async function confirmQuotation(req, res) {
    res.json(await confirmDeliveryOrderQuotation(req.params.id));
}

export async function assignToShipment(req, res) {
    res.json(await assignDeliveryOrderToShipment(req.params.id));
}

export async function cancelById(req, res) {
    res.json(await cancelDeliveryOrder(req.params.id));
}

export async function closeById(req, res) {
    res.json(await closeDeliveryOrder(req.params.id));
}

export async function getPurchaseOrderDeliveryOrders(req, res) {
    res.json(await listDeliveryOrdersByPurchaseOrder(req.params.id));
}

export async function getDeliveryOrderLots(req, res) {
    res.json(await listDeliveryOrderLots(req.params.id));
}

export async function getDeliveryOrderLines(req, res) {
    res.json(await listDeliveryOrderLines(req.params.id));
}
