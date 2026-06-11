import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    cancelShipment,
    createShipmentDocument,
    createShipmentFromDeliveryOrder,
    deleteShipmentDocument,
    getShipmentById,
    getShipmentDocuments,
    getShipmentLines,
    getShipmentMilestones,
    getShipments,
    markShipmentMilestoneDone,
    updateShipment,
    updateShipmentDocument
} from "./shipments.controller.js";

const router = express.Router();

router.post("/shipments/from-delivery-order", asyncHandler(createShipmentFromDeliveryOrder));
router.get("/shipments", asyncHandler(getShipments));

router.get("/shipments/:id/lines", asyncHandler(getShipmentLines));
router.get("/shipments/:id/milestones", asyncHandler(getShipmentMilestones));
router.post("/shipments/:id/milestones/:milestoneCode/done", asyncHandler(markShipmentMilestoneDone));
router.get("/shipments/:id/documents", asyncHandler(getShipmentDocuments));
router.post("/shipments/:id/documents", asyncHandler(createShipmentDocument));
router.post("/shipments/:id/cancel", asyncHandler(cancelShipment));

router.get("/shipments/:id", asyncHandler(getShipmentById));
router.patch("/shipments/:id", asyncHandler(updateShipment));

router.patch("/shipment-documents/:documentId", asyncHandler(updateShipmentDocument));
router.delete("/shipment-documents/:documentId", asyncHandler(deleteShipmentDocument));

export default router;
