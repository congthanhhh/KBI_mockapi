import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getDropdownOptions } from "./options.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getDropdownOptions));

export default router;
