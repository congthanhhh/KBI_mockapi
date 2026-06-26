import { success } from "../../utils/apiResponse.js";
import * as service from "./mockV1.service.js";

export async function getMockHealth(req, res) {
    res.json(success(await service.getMockHealth()));
}

export async function resetMockData(req, res) {
    res.json(success(await service.resetMockData()));
}

export async function reloadMockData(req, res) {
    res.json(success(await service.reloadMockData()));
}

export async function listMockCollection(req, res) {
    res.json(success(await service.listMockCollection(req.params.collection, req.query)));
}

export async function getMockRecord(req, res) {
    res.json(success(await service.getMockRecord(req.params.collection, req.params.id)));
}

export async function createMockRecord(req, res) {
    res.status(201).json(success(await service.createMockRecord(req.params.collection, req.body)));
}

export async function updateMockRecord(req, res) {
    res.json(success(await service.updateMockRecord(req.params.collection, req.params.id, req.body)));
}

export async function deleteMockRecord(req, res) {
    res.json(success(await service.deleteMockRecord(req.params.collection, req.params.id)));
}

export async function listCurrencies(req, res) {
    res.json(success(await service.listCurrencies()));
}

export async function listIncoterms(req, res) {
    res.json(success(await service.listIncoterms()));
}

export async function listTransportModes(req, res) {
    res.json(success(await service.listTransportModes()));
}

export async function listSuppliers(req, res) {
    res.json(success(await service.listSuppliers()));
}

export async function getSupplier(req, res) {
    res.json(success(await service.getSupplier(req.params.id)));
}

export async function listItemGroups(req, res) {
    res.json(success(await service.listItemGroups()));
}

export async function listItems(req, res) {
    res.json(success(await service.listItems()));
}

export async function getItem(req, res) {
    res.json(success(await service.getItem(req.params.id)));
}

export async function listItemCustomsProfiles(req, res) {
    res.json(success(await service.listItemCustomsProfiles(req.params.id)));
}

export async function listPurchaseOrders(req, res) {
    const result = await service.listPurchaseOrders(req.query);
    res.json(success(result.data, result.meta));
}

export async function getPurchaseOrder(req, res) {
    res.json(success(await service.getPurchaseOrder(req.params.id)));
}

export async function createPurchaseOrder(req, res) {
    res.status(201).json(success(await service.createPurchaseOrder(req.body)));
}

export async function updatePurchaseOrder(req, res) {
    res.json(success(await service.updatePurchaseOrder(req.params.id, req.body)));
}

export async function listPurchaseOrderLines(req, res) {
    res.json(success(await service.listPurchaseOrderLines(req.params.id)));
}

export async function sendPurchaseOrder(req, res) {
    res.json(success(await service.sendPurchaseOrder(req.params.id)));
}

export async function confirmPurchaseOrder(req, res) {
    res.json(success(await service.confirmPurchaseOrder(req.params.id)));
}

export async function cancelPurchaseOrder(req, res) {
    res.json(success(await service.cancelPurchaseOrder(req.params.id)));
}

export async function listPurchaseOrderConfirmations(req, res) {
    res.json(success(await service.listPurchaseOrderConfirmations(req.params.id)));
}

export async function createPurchaseOrderConfirmation(req, res) {
    res.status(201).json(success(await service.createPurchaseOrderConfirmation(req.params.id, req.body)));
}

export async function getPurchaseOrderConfirmation(req, res) {
    res.json(success(await service.getPurchaseOrderConfirmation(req.params.id)));
}

export async function getLotPlanning(req, res) {
    res.json(success(await service.getLotPlanning(req.params.id)));
}

export async function createLot(req, res) {
    res.status(201).json(success(await service.createLot(req.params.id, req.body)));
}

export async function updateLot(req, res) {
    res.json(success(await service.updateLot(req.params.lotId, req.body)));
}

export async function deleteLot(req, res) {
    res.json(success(await service.deleteLot(req.params.lotId)));
}

export async function moveLotLine(req, res) {
    res.json(success(await service.moveLotLine(req.params.lineId, req.body)));
}

export async function splitLotLine(req, res) {
    res.status(201).json(success(await service.splitLotLine(req.params.lineId, req.body)));
}

export async function reorderLots(req, res) {
    res.json(success(await service.reorderLots(req.body)));
}

export async function reorderLotLines(req, res) {
    res.json(success(await service.reorderLotLines(req.body)));
}

export async function createDeliveryOrderFromLots(req, res) {
    res.status(201).json(success(await service.createDeliveryOrderFromLots(req.body)));
}

export async function listDeliveryOrders(req, res) {
    const result = await service.listDeliveryOrders(req.query);
    res.json(success(result.data, result.meta));
}

export async function listLogisticsTasks(req, res) {
    res.json(success(await service.listLogisticsTasks()));
}

export async function listTasks(req, res) {
    const result = await service.listTasks(req.query);
    res.json(success(result.data, result.meta));
}

export async function getTask(req, res) {
    res.json(success(await service.getTask(req.params.id)));
}

export async function listPurchaseOrderTasks(req, res) {
    res.json(success(await service.listPurchaseOrderTasks(req.params.id)));
}

export async function createTask(req, res) {
    res.status(201).json(success(await service.createTask(req.body)));
}

export async function updateTask(req, res) {
    res.json(success(await service.updateTask(req.params.id, req.body)));
}

export async function assignTask(req, res) {
    res.json(success(await service.assignTask(req.params.id, req.body)));
}

export async function getDeliveryOrder(req, res) {
    res.json(success(await service.getDeliveryOrder(req.params.id)));
}

export async function listDeliveryOrderScreens(req, res) {
    res.json(success(await service.listDeliveryOrderScreens()));
}

export async function getDeliveryOrderScreen(req, res) {
    res.json(success(await service.getDeliveryOrderScreen(req.params.id)));
}

export async function listDeliveryOrderDocuments(req, res) {
    res.json(success(await service.listDeliveryOrderDocuments(req.params.id)));
}

export async function createDeliveryOrderDocument(req, res) {
    res.status(201).json(success(await service.createDeliveryOrderDocument(req.params.id, req.body)));
}

export async function updateDeliveryOrderDocument(req, res) {
    res.json(success(await service.updateDeliveryOrderDocument(req.params.documentId, req.body)));
}

export async function deleteDeliveryOrderDocument(req, res) {
    res.json(success(await service.deleteDeliveryOrderDocument(req.params.documentId)));
}

export async function listDeliveryOrdersByPurchaseOrder(req, res) {
    res.json(success(await service.listDeliveryOrdersByPurchaseOrder(req.params.id)));
}

export async function listDeliveryOrderLots(req, res) {
    res.json(success(await service.listDeliveryOrderLots(req.params.id)));
}

export async function listDeliveryOrderLines(req, res) {
    res.json(success(await service.listDeliveryOrderLines(req.params.id)));
}

export async function markDeliveryOrderReadyForQuotation(req, res) {
    res.json(success(await service.markDeliveryOrderReadyForQuotation(req.params.id)));
}

export async function cancelDeliveryOrder(req, res) {
    res.json(success(await service.cancelDeliveryOrder(req.params.id)));
}

export async function updateDeliveryOrder(req, res) {
    res.json(success(await service.updateDeliveryOrder(req.params.id, req.body)));
}

export async function createQuotationForDeliveryOrder(req, res) {
    res.status(201).json(success(await service.createQuotationForDeliveryOrder(req.params.id, req.body)));
}

export async function listQuotations(req, res) {
    const result = await service.listQuotations(req.query);
    res.json(success(result.data, result.meta));
}

export async function listQuotationsByDeliveryOrder(req, res) {
    res.json(success(await service.listQuotationsByDeliveryOrder(req.params.id)));
}

export async function createQuotationVersion(req, res) {
    res.status(201).json(success(await service.createQuotationVersion(req.params.id, req.body)));
}

export async function markQuotationFinal(req, res) {
    res.json(success(await service.markQuotationFinal(req.params.id)));
}

export async function confirmQuotationByKbi(req, res) {
    res.json(success(await service.confirmQuotationByKbi(req.params.id)));
}

export async function rejectQuotation(req, res) {
    res.json(success(await service.rejectQuotation(req.params.id)));
}

export async function cancelQuotation(req, res) {
    res.json(success(await service.cancelQuotation(req.params.id)));
}

export async function requestQuotation(req, res) {
    res.json(success(await service.requestQuotation(req.params.id)));
}

export async function receiveQuotation(req, res) {
    res.json(success(await service.receiveQuotation(req.params.id)));
}

export async function submitQuotationToKbi(req, res) {
    res.json(success(await service.submitQuotationToKbi(req.params.id)));
}

export async function getQuotation(req, res) {
    res.json(success(await service.getQuotation(req.params.id)));
}

export async function listQuotationChargeLines(req, res) {
    res.json(success(await service.listQuotationChargeLines(req.params.id)));
}

export async function createQuotationChargeLine(req, res) {
    res.status(201).json(success(await service.createQuotationChargeLine(req.params.id, req.body)));
}

export async function updateQuotationChargeLine(req, res) {
    res.json(success(await service.updateQuotationChargeLine(req.params.lineId, req.body)));
}

export async function deleteQuotationChargeLine(req, res) {
    res.json(success(await service.deleteQuotationChargeLine(req.params.lineId)));
}

export async function listQuotationEvents(req, res) {
    res.json(success(await service.listQuotationEvents(req.params.id)));
}

export async function createShipmentFromDeliveryOrder(req, res) {
    res.status(201).json(success(await service.createShipmentFromDeliveryOrder(req.body)));
}

export async function listShipments(req, res) {
    const result = await service.listShipments(req.query);
    res.json(success(result.data, result.meta));
}

export async function getShipment(req, res) {
    res.json(success(await service.getShipment(req.params.id)));
}

export async function markShipmentMilestoneDone(req, res) {
    res.json(success(await service.markShipmentMilestoneDone(req.params.id, req.params.code, req.body)));
}

export async function listShipmentLines(req, res) {
    res.json(success(await service.listShipmentLines(req.params.id)));
}

export async function listShipmentMilestones(req, res) {
    res.json(success(await service.listShipmentMilestones(req.params.id)));
}

export async function listShipmentDocuments(req, res) {
    res.json(success(await service.listShipmentDocuments(req.params.id)));
}

export async function createShipmentDocument(req, res) {
    res.status(201).json(success(await service.createShipmentDocument(req.params.id, req.body)));
}

export async function updateShipmentDocument(req, res) {
    res.json(success(await service.updateShipmentDocument(req.params.documentId, req.body)));
}

export async function deleteShipmentDocument(req, res) {
    res.json(success(await service.deleteShipmentDocument(req.params.documentId)));
}

export async function listShipmentContainers(req, res) {
    res.json(success(await service.listShipmentContainers(req.params.id)));
}

export async function createShipmentContainer(req, res) {
    res.status(201).json(success(await service.createShipmentContainer(req.params.id, req.body)));
}

export async function updateShipmentContainer(req, res) {
    res.json(success(await service.updateShipmentContainer(req.params.containerId, req.body)));
}

export async function deleteShipmentContainer(req, res) {
    res.json(success(await service.deleteShipmentContainer(req.params.containerId)));
}

export async function listShipmentCosts(req, res) {
    res.json(success(await service.listShipmentCosts(req.params.id)));
}

export async function createShipmentCost(req, res) {
    res.status(201).json(success(await service.createShipmentCost(req.params.id, req.body)));
}

export async function updateShipmentCost(req, res) {
    res.json(success(await service.updateShipmentCost(req.params.costId, req.body)));
}

export async function deleteShipmentCost(req, res) {
    res.json(success(await service.deleteShipmentCost(req.params.costId)));
}

export async function cancelShipment(req, res) {
    res.json(success(await service.cancelShipment(req.params.id)));
}

export async function updateShipment(req, res) {
    res.json(success(await service.updateShipment(req.params.id, req.body)));
}

export async function listCustomsDeclarationsByShipment(req, res) {
    res.json(success(await service.listCustomsDeclarationsByShipment(req.params.shipmentId || req.params.id)));
}

export async function createCustomsDeclaration(req, res) {
    res.status(201).json(success(await service.createCustomsDeclaration(req.params.shipmentId || req.params.id, req.body)));
}

export async function clearCustomsDeclaration(req, res) {
    res.json(success(await service.clearCustomsDeclaration(req.params.id, req.body)));
}

export async function getCustomsDeclaration(req, res) {
    res.json(success(await service.getCustomsDeclaration(req.params.id)));
}

export async function updateCustomsDeclaration(req, res) {
    res.json(success(await service.updateCustomsDeclaration(req.params.id, req.body)));
}

export async function listCustomsDeclarationLines(req, res) {
    res.json(success(await service.listCustomsDeclarationLines(req.params.id)));
}

export async function createCustomsDeclarationLine(req, res) {
    res.status(201).json(success(await service.createCustomsDeclarationLine(req.params.id, req.body)));
}

export async function updateCustomsDeclarationLine(req, res) {
    res.json(success(await service.updateCustomsDeclarationLine(req.params.lineId, req.body)));
}

export async function deleteCustomsDeclarationLine(req, res) {
    res.json(success(await service.deleteCustomsDeclarationLine(req.params.lineId)));
}

export async function openCustomsDraft(req, res) {
    res.json(success(await service.openCustomsDraft(req.params.id, req.body)));
}

export async function openCustomsOfficial(req, res) {
    res.json(success(await service.openCustomsOfficial(req.params.id, req.body)));
}

export async function cancelCustomsDeclaration(req, res) {
    res.json(success(await service.cancelCustomsDeclaration(req.params.id, req.body)));
}

export async function createCarrierDeliveryOrder(req, res) {
    res.status(201).json(success(await service.createCarrierDeliveryOrder(req.params.shipmentId || req.params.id, req.body)));
}

export async function listCarrierDeliveryOrders(req, res) {
    res.json(success(await service.listCarrierDeliveryOrders()));
}

export async function listShipmentCarrierDeliveryOrders(req, res) {
    res.json(success(await service.listCarrierDeliveryOrdersByShipment(req.params.shipmentId || req.params.id)));
}

export async function getCarrierDeliveryOrder(req, res) {
    res.json(success(await service.getCarrierDeliveryOrder(req.params.id)));
}

export async function issueCarrierDeliveryOrder(req, res) {
    res.json(success(await service.issueCarrierDeliveryOrder(req.params.id)));
}

export async function releaseCarrierDeliveryOrder(req, res) {
    res.json(success(await service.releaseCarrierDeliveryOrder(req.params.id)));
}

export async function cancelCarrierDeliveryOrder(req, res) {
    res.json(success(await service.cancelCarrierDeliveryOrder(req.params.id)));
}

export async function createDomesticTransportOrder(req, res) {
    res.status(201).json(success(await service.createDomesticTransportOrder(req.params.shipmentId || req.params.id, req.body)));
}

export async function consolidateDomesticTransportOrder(req, res) {
    res.status(201).json(success(await service.consolidateDomesticTransportOrder(req.body)));
}

export async function listDomesticTransportOrders(req, res) {
    const result = await service.listDomesticTransportOrders(req.query);
    res.json(success(result.data, result.meta));
}

export async function getDomesticTransportOrder(req, res) {
    res.json(success(await service.getDomesticTransportOrder(req.params.id)));
}

export async function updateDomesticTransportOrder(req, res) {
    res.json(success(await service.updateDomesticTransportOrder(req.params.id, req.body)));
}

export async function markDomesticTransportOrderQuotePending(req, res) {
    res.json(success(await service.markDomesticTransportOrderQuotePending(req.params.id)));
}

export async function confirmDomesticTransportOrderQuote(req, res) {
    res.json(success(await service.confirmDomesticTransportOrderQuote(req.params.id)));
}

export async function dispatchDomesticTransportOrder(req, res) {
    res.json(success(await service.dispatchDomesticTransportOrder(req.params.id)));
}

export async function startDomesticTransportOrderTransit(req, res) {
    res.json(success(await service.startDomesticTransportOrderTransit(req.params.id)));
}

export async function deliverDomesticTransportOrder(req, res) {
    res.json(success(await service.deliverDomesticTransportOrder(req.params.id)));
}

export async function markDomesticTransportOrderPodReceived(req, res) {
    res.json(success(await service.markDomesticTransportOrderPodReceived(req.params.id)));
}

export async function closeDomesticTransportOrder(req, res) {
    res.json(success(await service.closeDomesticTransportOrder(req.params.id)));
}

export async function cancelDomesticTransportOrder(req, res) {
    res.json(success(await service.cancelDomesticTransportOrder(req.params.id)));
}

export async function listShipmentDomesticTransportOrders(req, res) {
    const data = await service.listShipmentDomesticTransportOrders(req.params.shipmentId, req.query);
    res.json(success(data.data, data.meta));
}

export async function linkDtoToShipment(req, res) {
    const dto = await service.linkDtoToShipment(req.params.shipmentId, req.body);
    res.json(success(dto));
}

export async function unlinkDtoFromShipment(req, res) {
    const dto = await service.unlinkDtoFromShipment(req.params.shipmentId, req.params.dtoId);
    res.json(success(dto));
}
