import {
    addCustomsDeclarationLine,
    addShipmentCustomsDeclaration,
    cancelCustomsDeclarationById,
    clearCustomsDeclarationById,
    editCustomsDeclaration,
    editCustomsDeclarationLine,
    getCustomsDeclaration,
    listCustomsDeclarationLines,
    listShipmentCustomsDeclarations,
    openCustomsDeclarationDraft,
    openCustomsDeclarationOfficial,
    removeCustomsDeclarationLine
} from "./customsDeclarations.service.js";

export async function getShipmentCustomsDeclarations(req, res) {
    res.json(await listShipmentCustomsDeclarations(req.params.shipmentId));
}

export async function createShipmentCustomsDeclaration(req, res) {
    res.status(201).json(await addShipmentCustomsDeclaration(req.params.shipmentId, req.body));
}

export async function getCustomsDeclarationById(req, res) {
    res.json(await getCustomsDeclaration(req.params.id));
}

export async function updateCustomsDeclaration(req, res) {
    res.json(await editCustomsDeclaration(req.params.id, req.body));
}

export async function getCustomsDeclarationLines(req, res) {
    res.json(await listCustomsDeclarationLines(req.params.id));
}

export async function createCustomsDeclarationLine(req, res) {
    res.status(201).json(await addCustomsDeclarationLine(req.params.id, req.body));
}

export async function updateCustomsDeclarationLine(req, res) {
    res.json(await editCustomsDeclarationLine(req.params.lineId, req.body));
}

export async function deleteCustomsDeclarationLine(req, res) {
    res.json(await removeCustomsDeclarationLine(req.params.lineId));
}

export async function openDraftCustomsDeclaration(req, res) {
    res.json(await openCustomsDeclarationDraft(req.params.id, req.body));
}

export async function openOfficialCustomsDeclaration(req, res) {
    res.json(await openCustomsDeclarationOfficial(req.params.id, req.body));
}

export async function clearCustomsDeclaration(req, res) {
    res.json(await clearCustomsDeclarationById(req.params.id, req.body));
}

export async function cancelCustomsDeclaration(req, res) {
    res.json(await cancelCustomsDeclarationById(req.params.id, req.body));
}
