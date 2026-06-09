import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createItemGroup,
    deleteItemGroup,
    getItemGroupById,
    getItemGroupItems,
    getItemGroups,
    updateItemGroup
} from "./itemGroups.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getItemGroups));
router.get("/:id/items", asyncHandler(getItemGroupItems));
router.get("/:id", asyncHandler(getItemGroupById));
router.post("/", asyncHandler(createItemGroup));
router.put("/:id", asyncHandler(updateItemGroup));
router.delete("/:id", asyncHandler(deleteItemGroup));

export default router;
