import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier
} from "./suppliers.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getSuppliers));
router.get("/:id", asyncHandler(getSupplierById));
router.post("/", asyncHandler(createSupplier));
router.patch("/:id", asyncHandler(updateSupplier));
router.delete("/:id", asyncHandler(deleteSupplier));

export default router;
