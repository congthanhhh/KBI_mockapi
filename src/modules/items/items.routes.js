import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createItem,
    createItemTaxProfile,
    deleteItem,
    getItemById,
    getItems,
    getItemTaxProfiles,
    updateItem
} from "./items.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getItems));
router.get("/:id/tax-profile", asyncHandler(getItemTaxProfiles));
router.post("/:id/tax-profile", asyncHandler(createItemTaxProfile));
router.get("/:id", asyncHandler(getItemById));
router.post("/", asyncHandler(createItem));
router.put("/:id", asyncHandler(updateItem));
router.delete("/:id", asyncHandler(deleteItem));

export default router;
