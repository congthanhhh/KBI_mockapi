import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createCurrency,
    deleteCurrency,
    getCurrencies,
    getCurrencyById,
    updateCurrency
} from "./currencies.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getCurrencies));
router.get("/:id", asyncHandler(getCurrencyById));
router.post("/", asyncHandler(createCurrency));
router.patch("/:id", asyncHandler(updateCurrency));
router.delete("/:id", asyncHandler(deleteCurrency));

export default router;
