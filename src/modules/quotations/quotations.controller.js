import { parsePagination } from "../../utils/pagination.js";
import {
    addDeliveryOrderQuotation,
    addQuotationChargeLine,
    addQuotationVersion,
    cancelQuotation,
    confirmQuotationByKbi,
    editQuotation,
    editQuotationChargeLine,
    expireQuotation,
    getQuotation,
    listDeliveryOrderQuotations,
    listQuotationChargeLines,
    listQuotationEvents,
    listQuotationVersions,
    listQuotations,
    receiveQuotation,
    rejectQuotation,
    removeQuotation,
    removeQuotationChargeLine,
    requestQuotation,
    submitQuotationToKbi
} from "./quotations.service.js";

export async function getQuotations(req, res) {
    const pagination = parsePagination(req.query);

    res.json(await listQuotations({
        search: req.query.search || req.query.q,
        refType: req.query.ref_type,
        refId: req.query.ref_id,
        status: req.query.status,
        supplierId: req.query.supplier_id,
        fromDate: req.query.from_date,
        toDate: req.query.to_date,
        ...pagination
    }));
}

export async function getQuotationById(req, res) {
    res.json(await getQuotation(req.params.quotationId));
}

export async function updateQuotation(req, res) {
    res.json(await editQuotation(req.params.quotationId, req.body));
}

export async function deleteQuotation(req, res) {
    res.json(await removeQuotation(req.params.quotationId));
}

export async function getDeliveryOrderQuotations(req, res) {
    res.json(await listDeliveryOrderQuotations(req.params.deliveryOrderId));
}

export async function createDeliveryOrderQuotation(req, res) {
    res.status(201).json(await addDeliveryOrderQuotation(req.params.deliveryOrderId, req.body));
}

export async function requestQuotationById(req, res) {
    res.json(await requestQuotation(req.params.quotationId));
}

export async function receiveQuotationById(req, res) {
    res.json(await receiveQuotation(req.params.quotationId));
}

export async function submitQuotationToKbiById(req, res) {
    res.json(await submitQuotationToKbi(req.params.quotationId));
}

export async function confirmQuotationByKbiById(req, res) {
    res.json(await confirmQuotationByKbi(req.params.quotationId, req.body));
}

export async function rejectQuotationById(req, res) {
    res.json(await rejectQuotation(req.params.quotationId, req.body));
}

export async function cancelQuotationById(req, res) {
    res.json(await cancelQuotation(req.params.quotationId, req.body));
}

export async function expireQuotationById(req, res) {
    res.json(await expireQuotation(req.params.quotationId, req.body));
}

export async function createQuotationVersion(req, res) {
    res.status(201).json(await addQuotationVersion(req.params.quotationId, req.body));
}

export async function getQuotationVersions(req, res) {
    res.json(await listQuotationVersions(req.params.quotationId));
}

export async function getQuotationChargeLines(req, res) {
    res.json(await listQuotationChargeLines(req.params.quotationId));
}

export async function createQuotationChargeLine(req, res) {
    res.status(201).json(await addQuotationChargeLine(req.params.quotationId, req.body));
}

export async function updateQuotationChargeLine(req, res) {
    res.json(await editQuotationChargeLine(req.params.lineId, req.body));
}

export async function deleteQuotationChargeLine(req, res) {
    res.json(await removeQuotationChargeLine(req.params.lineId));
}

export async function getQuotationEvents(req, res) {
    res.json(await listQuotationEvents(req.params.quotationId));
}
