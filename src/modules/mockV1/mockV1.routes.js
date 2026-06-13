import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./mockV1.controller.js";

const router = express.Router();

router.get("/mock/health", asyncHandler(controller.getMockHealth));
router.post("/mock/reset", asyncHandler(controller.resetMockData));
router.post("/mock/reload", asyncHandler(controller.reloadMockData));
router.get("/mock/:collection", asyncHandler(controller.listMockCollection));
router.post("/mock/:collection", asyncHandler(controller.createMockRecord));
router.get("/mock/:collection/:id", asyncHandler(controller.getMockRecord));
router.patch("/mock/:collection/:id", asyncHandler(controller.updateMockRecord));
router.delete("/mock/:collection/:id", asyncHandler(controller.deleteMockRecord));

router.get("/currencies", asyncHandler(controller.listCurrencies));
router.get("/incoterms", asyncHandler(controller.listIncoterms));
router.get("/transport-modes", asyncHandler(controller.listTransportModes));
router.get("/suppliers", asyncHandler(controller.listSuppliers));
router.get("/suppliers/:id", asyncHandler(controller.getSupplier));
router.get("/item-groups", asyncHandler(controller.listItemGroups));
router.get("/items", asyncHandler(controller.listItems));
router.get("/items/:id/customs-profiles", asyncHandler(controller.listItemCustomsProfiles));
router.get("/items/:id", asyncHandler(controller.getItem));

router.get("/purchase-orders", asyncHandler(controller.listPurchaseOrders));
router.post("/purchase-orders", asyncHandler(controller.createPurchaseOrder));
router.get("/purchase-orders/:id/lines", asyncHandler(controller.listPurchaseOrderLines));
router.post("/purchase-orders/:id/send", asyncHandler(controller.sendPurchaseOrder));
router.post("/purchase-orders/:id/confirm", asyncHandler(controller.confirmPurchaseOrder));
router.post("/purchase-orders/:id/cancel", asyncHandler(controller.cancelPurchaseOrder));
router.patch("/purchase-orders/:id", asyncHandler(controller.updatePurchaseOrder));
router.get("/purchase-orders/:id/confirmations", asyncHandler(controller.listPurchaseOrderConfirmations));
router.post("/purchase-orders/:id/confirmations", asyncHandler(controller.createPurchaseOrderConfirmation));
router.get("/purchase-orders/:id/lot-planning", asyncHandler(controller.getLotPlanning));
router.post("/purchase-orders/:id/lots", asyncHandler(controller.createLot));
router.get("/purchase-orders/:id/tasks", asyncHandler(controller.listPurchaseOrderTasks));
router.get("/purchase-orders/:id/delivery-orders", asyncHandler(controller.listDeliveryOrdersByPurchaseOrder));
router.get("/purchase-orders/:id", asyncHandler(controller.getPurchaseOrder));

router.get("/purchase-order-confirmations/:id", asyncHandler(controller.getPurchaseOrderConfirmation));

router.patch("/po-lots/reorder", asyncHandler(controller.reorderLots));
router.patch("/po-lots/:lotId", asyncHandler(controller.updateLot));
router.delete("/po-lots/:lotId", asyncHandler(controller.deleteLot));

router.patch("/po-lot-lines/reorder", asyncHandler(controller.reorderLotLines));
router.post("/po-lot-lines/:lineId/move", asyncHandler(controller.moveLotLine));
router.post("/po-lot-lines/:lineId/split", asyncHandler(controller.splitLotLine));

router.get("/delivery-orders", asyncHandler(controller.listDeliveryOrders));
router.get("/logistics-tasks", asyncHandler(controller.listLogisticsTasks));
router.get("/tasks", asyncHandler(controller.listTasks));
router.get("/tasks/:id", asyncHandler(controller.getTask));
router.patch("/tasks/:id", asyncHandler(controller.updateTask));
router.post("/tasks/:id/assign", asyncHandler(controller.assignTask));
router.post("/delivery-orders/from-lots", asyncHandler(controller.createDeliveryOrderFromLots));
router.get("/delivery-orders/:id/lots", asyncHandler(controller.listDeliveryOrderLots));
router.get("/delivery-orders/:id/lines", asyncHandler(controller.listDeliveryOrderLines));
router.get("/delivery-orders/:id/quotations", asyncHandler(controller.listQuotationsByDeliveryOrder));
router.post("/delivery-orders/:id/quotations", asyncHandler(controller.createQuotationForDeliveryOrder));
router.post("/delivery-orders/:id/ready-for-quotation", asyncHandler(controller.markDeliveryOrderReadyForQuotation));
router.post("/delivery-orders/:id/cancel", asyncHandler(controller.cancelDeliveryOrder));
router.patch("/delivery-orders/:id", asyncHandler(controller.updateDeliveryOrder));
router.get("/delivery-orders/:id", asyncHandler(controller.getDeliveryOrder));

router.get("/quotations", asyncHandler(controller.listQuotations));
router.post("/quotations/:id/create-version", asyncHandler(controller.createQuotationVersion));
router.post("/quotations/:id/mark-final", asyncHandler(controller.markQuotationFinal));
router.post("/quotations/:id/confirm-by-kbi", asyncHandler(controller.confirmQuotationByKbi));
router.post("/quotations/:id/reject", asyncHandler(controller.rejectQuotation));
router.post("/quotations/:id/cancel", asyncHandler(controller.cancelQuotation));
router.get("/quotations/:id/charge-lines", asyncHandler(controller.listQuotationChargeLines));
router.post("/quotations/:id/charge-lines", asyncHandler(controller.createQuotationChargeLine));
router.get("/quotations/:id/events", asyncHandler(controller.listQuotationEvents));
router.get("/quotations/:id", asyncHandler(controller.getQuotation));
router.patch("/quotation-charge-lines/:lineId", asyncHandler(controller.updateQuotationChargeLine));
router.delete("/quotation-charge-lines/:lineId", asyncHandler(controller.deleteQuotationChargeLine));

router.get("/shipments", asyncHandler(controller.listShipments));
router.post("/shipments/from-delivery-order", asyncHandler(controller.createShipmentFromDeliveryOrder));
router.get("/shipments/:id/lines", asyncHandler(controller.listShipmentLines));
router.get("/shipments/:id/milestones", asyncHandler(controller.listShipmentMilestones));
router.post("/shipments/:id/milestones/:code/done", asyncHandler(controller.markShipmentMilestoneDone));
router.get("/shipments/:id/documents", asyncHandler(controller.listShipmentDocuments));
router.post("/shipments/:id/documents", asyncHandler(controller.createShipmentDocument));
router.post("/shipments/:id/cancel", asyncHandler(controller.cancelShipment));
router.patch("/shipments/:id", asyncHandler(controller.updateShipment));
router.get("/shipments/:shipmentId/customs-declarations", asyncHandler(controller.listCustomsDeclarationsByShipment));
router.post("/shipments/:shipmentId/customs-declarations", asyncHandler(controller.createCustomsDeclaration));
router.post("/shipments/:shipmentId/carrier-delivery-orders", asyncHandler(controller.createCarrierDeliveryOrder));
router.post("/shipments/:shipmentId/domestic-transport-orders", asyncHandler(controller.createDomesticTransportOrder));
router.get("/shipments/:id", asyncHandler(controller.getShipment));
router.patch("/shipment-documents/:documentId", asyncHandler(controller.updateShipmentDocument));
router.delete("/shipment-documents/:documentId", asyncHandler(controller.deleteShipmentDocument));

router.get("/customs-declarations/:id/lines", asyncHandler(controller.listCustomsDeclarationLines));
router.post("/customs-declarations/:id/lines", asyncHandler(controller.createCustomsDeclarationLine));
router.post("/customs-declarations/:id/open-draft", asyncHandler(controller.openCustomsDraft));
router.post("/customs-declarations/:id/open-official", asyncHandler(controller.openCustomsOfficial));
router.post("/customs-declarations/:id/clear", asyncHandler(controller.clearCustomsDeclaration));
router.post("/customs-declarations/:id/cancel", asyncHandler(controller.cancelCustomsDeclaration));
router.get("/customs-declarations/:id", asyncHandler(controller.getCustomsDeclaration));
router.patch("/customs-declarations/:id", asyncHandler(controller.updateCustomsDeclaration));
router.patch("/customs-declaration-lines/:lineId", asyncHandler(controller.updateCustomsDeclarationLine));
router.delete("/customs-declaration-lines/:lineId", asyncHandler(controller.deleteCustomsDeclarationLine));

router.get("/carrier-delivery-orders", asyncHandler(controller.listCarrierDeliveryOrders));
router.post("/carrier-delivery-orders/:id/issue", asyncHandler(controller.issueCarrierDeliveryOrder));
router.post("/carrier-delivery-orders/:id/release", asyncHandler(controller.releaseCarrierDeliveryOrder));
router.post("/carrier-delivery-orders/:id/cancel", asyncHandler(controller.cancelCarrierDeliveryOrder));
router.get("/carrier-delivery-orders/:id", asyncHandler(controller.getCarrierDeliveryOrder));

router.get("/domestic-transport-orders", asyncHandler(controller.listDomesticTransportOrders));
router.post("/domestic-transport-orders/:id/quote-pending", asyncHandler(controller.markDomesticTransportOrderQuotePending));
router.post("/domestic-transport-orders/:id/confirm-quote", asyncHandler(controller.confirmDomesticTransportOrderQuote));
router.post("/domestic-transport-orders/:id/dispatch", asyncHandler(controller.dispatchDomesticTransportOrder));
router.post("/domestic-transport-orders/:id/start-transit", asyncHandler(controller.startDomesticTransportOrderTransit));
router.post("/domestic-transport-orders/:id/deliver", asyncHandler(controller.deliverDomesticTransportOrder));
router.post("/domestic-transport-orders/:id/close", asyncHandler(controller.closeDomesticTransportOrder));
router.post("/domestic-transport-orders/:id/cancel", asyncHandler(controller.cancelDomesticTransportOrder));
router.get("/domestic-transport-orders/:id", asyncHandler(controller.getDomesticTransportOrder));
router.patch("/domestic-transport-orders/:id", asyncHandler(controller.updateDomesticTransportOrder));

export default router;
