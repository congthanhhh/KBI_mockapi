import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    cancelPurchaseOrderById,
    confirmPurchaseOrderById,
    createDeliverySlot,
    createEmptyPoLot,
    createPurchaseOrder,
    createPurchaseOrderLine,
    deletePurchaseOrder,
    deleteDeliverySlot,
    deletePoLot,
    deletePurchaseOrderLine,
    getPurchaseOrderById,
    getPurchaseOrderLines,
    getPurchaseOrderLotPlanning,
    markPurchaseOrderInProductionById,
    markPurchaseOrderReadyToShipById,
    getPurchaseOrders,
    mergePoLotBackToDefault,
    mergePoLots,
    movePoLotSlot,
    reorderPoLots,
    resetPoLotPlanning,
    sendPurchaseOrderById,
    splitPoLot,
    transferPoLotLines,
    updateDeliverySlot,
    updatePoLot,
    updatePurchaseOrder,
    updatePurchaseOrderLine
} from "./purchaseOrders.controller.js";

const router = express.Router();

router.get("/purchase-orders", asyncHandler(getPurchaseOrders));
router.get("/purchase-orders/:id", asyncHandler(getPurchaseOrderById));
router.post("/purchase-orders", asyncHandler(createPurchaseOrder));
router.patch("/purchase-orders/:id", asyncHandler(updatePurchaseOrder));
router.delete("/purchase-orders/:id", asyncHandler(deletePurchaseOrder));

router.post("/purchase-orders/:id/send", asyncHandler(sendPurchaseOrderById));
router.post("/purchase-orders/:id/confirm", asyncHandler(confirmPurchaseOrderById));
router.post("/purchase-orders/:id/cancel", asyncHandler(cancelPurchaseOrderById));
router.post("/purchase-orders/:id/mark-in-production", asyncHandler(markPurchaseOrderInProductionById));
router.post("/purchase-orders/:id/mark-ready-to-ship", asyncHandler(markPurchaseOrderReadyToShipById));

router.get("/purchase-orders/:id/lines", asyncHandler(getPurchaseOrderLines));
router.post("/purchase-orders/:id/lines", asyncHandler(createPurchaseOrderLine));
router.patch("/purchase-order-lines/:lineId", asyncHandler(updatePurchaseOrderLine));
router.delete("/purchase-order-lines/:lineId", asyncHandler(deletePurchaseOrderLine));

router.get("/purchase-orders/:id/lot-planning", asyncHandler(getPurchaseOrderLotPlanning));
router.post("/purchase-orders/:id/lot-planning/reset-default", asyncHandler(resetPoLotPlanning));
router.post("/purchase-orders/:id/delivery-slots", asyncHandler(createDeliverySlot));
router.post("/purchase-orders/:id/lots", asyncHandler(createEmptyPoLot));
router.patch("/po-delivery-slots/:slotId", asyncHandler(updateDeliverySlot));
router.delete("/po-delivery-slots/:slotId", asyncHandler(deleteDeliverySlot));
router.patch("/po-lots/reorder", asyncHandler(reorderPoLots));
router.patch("/po-lots/:lotId", asyncHandler(updatePoLot));
router.delete("/po-lots/:lotId", asyncHandler(deletePoLot));
router.post("/po-lots/:lotId/split", asyncHandler(splitPoLot));
router.post("/po-lots/:lotId/merge-back-default", asyncHandler(mergePoLotBackToDefault));
router.post("/po-lots/:lotId/merge", asyncHandler(mergePoLots));
router.post("/po-lots/:lotId/transfer-lines", asyncHandler(transferPoLotLines));
router.patch("/po-lots/:lotId/move-slot", asyncHandler(movePoLotSlot));

export default router;
