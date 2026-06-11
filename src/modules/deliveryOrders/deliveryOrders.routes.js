import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    assignToShipment,
    cancelById,
    closeById,
    confirmQuotation,
    createDeliveryOrder,
    createDeliveryOrderFromLots,
    deleteDeliveryOrder,
    getDeliveryOrderById,
    getDeliveryOrderLines,
    getDeliveryOrderLots,
    getDeliveryOrders,
    getPurchaseOrderDeliveryOrders,
    readyForQuotation,
    updateDeliveryOrder
} from "./deliveryOrders.controller.js";

const router = express.Router();

router.get("/purchase-orders/:id/delivery-orders", asyncHandler(getPurchaseOrderDeliveryOrders));

router.get("/delivery-orders", asyncHandler(getDeliveryOrders));
router.post("/delivery-orders/from-lots", asyncHandler(createDeliveryOrderFromLots));
router.post("/delivery-orders", asyncHandler(createDeliveryOrder));
router.get("/delivery-orders/:id/lots", asyncHandler(getDeliveryOrderLots));
router.get("/delivery-orders/:id/lines", asyncHandler(getDeliveryOrderLines));
router.get("/delivery-orders/:id", asyncHandler(getDeliveryOrderById));
router.patch("/delivery-orders/:id", asyncHandler(updateDeliveryOrder));
router.delete("/delivery-orders/:id", asyncHandler(deleteDeliveryOrder));

router.post("/delivery-orders/:id/ready-for-quotation", asyncHandler(readyForQuotation));
router.post("/delivery-orders/:id/confirm-quotation", asyncHandler(confirmQuotation));
router.post("/delivery-orders/:id/assign-to-shipment", asyncHandler(assignToShipment));
router.post("/delivery-orders/:id/cancel", asyncHandler(cancelById));
router.post("/delivery-orders/:id/close", asyncHandler(closeById));

export default router;
