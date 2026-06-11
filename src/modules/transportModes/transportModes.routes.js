import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createTransportMode,
    deleteTransportMode,
    getTransportModeById,
    getTransportModes,
    updateTransportMode
} from "./transportModes.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getTransportModes));
router.get("/:id", asyncHandler(getTransportModeById));
router.post("/", asyncHandler(createTransportMode));
router.patch("/:id", asyncHandler(updateTransportMode));
router.delete("/:id", asyncHandler(deleteTransportMode));

export default router;
