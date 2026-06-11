import { parsePagination } from "../../utils/pagination.js";
import {
    addDeliverySlot,
    addEmptyPurchaseOrderLot,
    addPurchaseOrder,
    addPurchaseOrderLine,
    cancelPurchaseOrder,
    confirmPurchaseOrder,
    editDeliverySlot,
    editPurchaseOrderLot,
    editPurchaseOrder,
    editPurchaseOrderLine,
    getLotPlanning,
    getPurchaseOrder,
    listPurchaseOrderLines,
    listPurchaseOrders,
    markPurchaseOrderInProduction,
    markPurchaseOrderReadyToShip,
    mergePurchaseOrderLotBackToDefault,
    mergePurchaseOrderLots,
    movePurchaseOrderLot,
    removeDeliverySlot,
    removePurchaseOrderLot,
    removePurchaseOrder,
    removePurchaseOrderLine,
    reorderPurchaseOrderLots,
    resetPurchaseOrderLotPlanning,
    sendPurchaseOrder,
    splitPurchaseOrderLot,
    transferPurchaseOrderLotLines
} from "./purchaseOrders.service.js";

export async function getPurchaseOrders(req, res) {
    const pagination = parsePagination(req.query);

    res.json(await listPurchaseOrders({
        search: req.query.search || req.query.q,
        status: req.query.status,
        supplierId: req.query.supplier_id,
        ...pagination
    }));
}

export async function getPurchaseOrderById(req, res) {
    res.json(await getPurchaseOrder(req.params.id));
}

export async function createPurchaseOrder(req, res) {
    res.status(201).json(await addPurchaseOrder(req.body));
}

export async function updatePurchaseOrder(req, res) {
    res.json(await editPurchaseOrder(req.params.id, req.body));
}

export async function deletePurchaseOrder(req, res) {
    res.json(await removePurchaseOrder(req.params.id));
}

export async function sendPurchaseOrderById(req, res) {
    res.json(await sendPurchaseOrder(req.params.id));
}

export async function confirmPurchaseOrderById(req, res) {
    res.status(201).json(await confirmPurchaseOrder(req.params.id, req.body));
}

export async function cancelPurchaseOrderById(req, res) {
    res.json(await cancelPurchaseOrder(req.params.id, req.body));
}

export async function markPurchaseOrderInProductionById(req, res) {
    res.json(await markPurchaseOrderInProduction(req.params.id));
}

export async function markPurchaseOrderReadyToShipById(req, res) {
    res.json(await markPurchaseOrderReadyToShip(req.params.id));
}

export async function getPurchaseOrderLines(req, res) {
    res.json(await listPurchaseOrderLines(req.params.id));
}

export async function createPurchaseOrderLine(req, res) {
    res.status(201).json(await addPurchaseOrderLine(req.params.id, req.body));
}

export async function updatePurchaseOrderLine(req, res) {
    res.json(await editPurchaseOrderLine(req.params.lineId, req.body));
}

export async function deletePurchaseOrderLine(req, res) {
    res.json(await removePurchaseOrderLine(req.params.lineId));
}

export async function getPurchaseOrderLotPlanning(req, res) {
    res.json(await getLotPlanning(req.params.id));
}

export async function createDeliverySlot(req, res) {
    res.status(201).json(await addDeliverySlot(req.params.id, req.body));
}

export async function updateDeliverySlot(req, res) {
    res.json(await editDeliverySlot(req.params.slotId, req.body));
}

export async function deleteDeliverySlot(req, res) {
    res.json(await removeDeliverySlot(req.params.slotId));
}

export async function createEmptyPoLot(req, res) {
    res.status(201).json(await addEmptyPurchaseOrderLot(req.params.id, req.body));
}

export async function updatePoLot(req, res) {
    res.json(await editPurchaseOrderLot(req.params.lotId, req.body));
}

export async function deletePoLot(req, res) {
    res.json(await removePurchaseOrderLot(req.params.lotId));
}

export async function splitPoLot(req, res) {
    res.status(201).json(await splitPurchaseOrderLot(req.params.lotId, req.body));
}

export async function mergePoLots(req, res) {
    res.json(await mergePurchaseOrderLots(req.params.lotId, req.body));
}

export async function mergePoLotBackToDefault(req, res) {
    res.json(await mergePurchaseOrderLotBackToDefault(req.params.lotId, req.body));
}

export async function transferPoLotLines(req, res) {
    res.json(await transferPurchaseOrderLotLines(req.params.lotId, req.body));
}

export async function resetPoLotPlanning(req, res) {
    res.json(await resetPurchaseOrderLotPlanning(req.params.id));
}

export async function movePoLotSlot(req, res) {
    res.json(await movePurchaseOrderLot(req.params.lotId, req.body));
}

export async function reorderPoLots(req, res) {
    res.json(await reorderPurchaseOrderLots(req.body));
}
