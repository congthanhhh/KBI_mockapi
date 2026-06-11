import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    cancelQuotationById,
    confirmQuotationByKbiById,
    createDeliveryOrderQuotation,
    createQuotationChargeLine,
    createQuotationVersion,
    deleteQuotation,
    deleteQuotationChargeLine,
    expireQuotationById,
    getDeliveryOrderQuotations,
    getQuotationById,
    getQuotationChargeLines,
    getQuotationEvents,
    getQuotationVersions,
    getQuotations,
    receiveQuotationById,
    rejectQuotationById,
    requestQuotationById,
    submitQuotationToKbiById,
    updateQuotation,
    updateQuotationChargeLine
} from "./quotations.controller.js";

const router = express.Router();

router.get("/delivery-orders/:deliveryOrderId/quotations", asyncHandler(getDeliveryOrderQuotations));
router.post("/delivery-orders/:deliveryOrderId/quotations", asyncHandler(createDeliveryOrderQuotation));

router.get("/quotations", asyncHandler(getQuotations));
router.get("/quotations/:quotationId/versions", asyncHandler(getQuotationVersions));
router.post("/quotations/:quotationId/create-version", asyncHandler(createQuotationVersion));
router.get("/quotations/:quotationId/charge-lines", asyncHandler(getQuotationChargeLines));
router.post("/quotations/:quotationId/charge-lines", asyncHandler(createQuotationChargeLine));
router.get("/quotations/:quotationId/events", asyncHandler(getQuotationEvents));

router.post("/quotations/:quotationId/request", asyncHandler(requestQuotationById));
router.post("/quotations/:quotationId/receive", asyncHandler(receiveQuotationById));
router.post("/quotations/:quotationId/submit-to-kbi", asyncHandler(submitQuotationToKbiById));
router.post("/quotations/:quotationId/confirm-by-kbi", asyncHandler(confirmQuotationByKbiById));
router.post("/quotations/:quotationId/reject", asyncHandler(rejectQuotationById));
router.post("/quotations/:quotationId/cancel", asyncHandler(cancelQuotationById));
router.post("/quotations/:quotationId/expire", asyncHandler(expireQuotationById));

router.get("/quotations/:quotationId", asyncHandler(getQuotationById));
router.patch("/quotations/:quotationId", asyncHandler(updateQuotation));
router.delete("/quotations/:quotationId", asyncHandler(deleteQuotation));

router.patch("/quotation-charge-lines/:lineId", asyncHandler(updateQuotationChargeLine));
router.delete("/quotation-charge-lines/:lineId", asyncHandler(deleteQuotationChargeLine));

export default router;
