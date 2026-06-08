import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    deleteItemTaxProfile,
    updateItemTaxProfile
} from "./itemTaxProfiles.controller.js";

const router = express.Router();

router.put("/:id", asyncHandler(updateItemTaxProfile));
router.delete("/:id", asyncHandler(deleteItemTaxProfile));

export default router;
