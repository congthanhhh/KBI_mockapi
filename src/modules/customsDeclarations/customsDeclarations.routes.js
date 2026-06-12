import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    cancelCustomsDeclaration,
    clearCustomsDeclaration,
    createCustomsDeclarationLine,
    createShipmentCustomsDeclaration,
    deleteCustomsDeclarationLine,
    getCustomsDeclarationById,
    getCustomsDeclarationLines,
    getShipmentCustomsDeclarations,
    openDraftCustomsDeclaration,
    openOfficialCustomsDeclaration,
    updateCustomsDeclaration,
    updateCustomsDeclarationLine
} from "./customsDeclarations.controller.js";

const router = express.Router();

router.get("/shipments/:shipmentId/customs-declarations", asyncHandler(getShipmentCustomsDeclarations));
router.post("/shipments/:shipmentId/customs-declarations", asyncHandler(createShipmentCustomsDeclaration));

router.get("/customs-declarations/:id/lines", asyncHandler(getCustomsDeclarationLines));
router.post("/customs-declarations/:id/lines", asyncHandler(createCustomsDeclarationLine));

router.post("/customs-declarations/:id/open-draft", asyncHandler(openDraftCustomsDeclaration));
router.post("/customs-declarations/:id/open-official", asyncHandler(openOfficialCustomsDeclaration));
router.post("/customs-declarations/:id/clear", asyncHandler(clearCustomsDeclaration));
router.post("/customs-declarations/:id/cancel", asyncHandler(cancelCustomsDeclaration));

router.get("/customs-declarations/:id", asyncHandler(getCustomsDeclarationById));
router.patch("/customs-declarations/:id", asyncHandler(updateCustomsDeclaration));

router.patch("/customs-declaration-lines/:lineId", asyncHandler(updateCustomsDeclarationLine));
router.delete("/customs-declaration-lines/:lineId", asyncHandler(deleteCustomsDeclarationLine));

export default router;
