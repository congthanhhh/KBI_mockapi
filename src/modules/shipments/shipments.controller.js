import { parsePagination } from "../../utils/pagination.js";
import {
    addShipmentDocument,
    addShipmentFromDeliveryOrder,
    cancelShipmentById,
    completeShipmentMilestone,
    editShipment,
    editShipmentDocument,
    getShipment,
    listShipmentDocuments,
    listShipmentLines,
    listShipmentMilestones,
    listShipments,
    removeShipmentDocument
} from "./shipments.service.js";

export async function getShipments(req, res) {
    const pagination = parsePagination(req.query);

    res.json(await listShipments({
        search: req.query.search || req.query.q,
        status: req.query.status,
        mode: req.query.mode,
        deliveryOrderId: req.query.delivery_order_id,
        purchaseOrderId: req.query.purchase_order_id,
        forwarderId: req.query.forwarder_id,
        transportModeId: req.query.transport_mode_id,
        fromDate: req.query.from_date,
        toDate: req.query.to_date,
        ...pagination
    }));
}

export async function getShipmentById(req, res) {
    res.json(await getShipment(req.params.id));
}

export async function createShipmentFromDeliveryOrder(req, res) {
    res.status(201).json(await addShipmentFromDeliveryOrder(req.body));
}

export async function updateShipment(req, res) {
    res.json(await editShipment(req.params.id, req.body));
}

export async function cancelShipment(req, res) {
    res.json(await cancelShipmentById(req.params.id, req.body));
}

export async function getShipmentLines(req, res) {
    res.json(await listShipmentLines(req.params.id));
}

export async function getShipmentMilestones(req, res) {
    res.json(await listShipmentMilestones(req.params.id));
}

export async function markShipmentMilestoneDone(req, res) {
    res.json(await completeShipmentMilestone(
        req.params.id,
        req.params.milestoneCode,
        req.body
    ));
}

export async function getShipmentDocuments(req, res) {
    res.json(await listShipmentDocuments(req.params.id));
}

export async function createShipmentDocument(req, res) {
    res.status(201).json(await addShipmentDocument(req.params.id, req.body));
}

export async function updateShipmentDocument(req, res) {
    res.json(await editShipmentDocument(req.params.documentId, req.body));
}

export async function deleteShipmentDocument(req, res) {
    res.json(await removeShipmentDocument(req.params.documentId));
}
