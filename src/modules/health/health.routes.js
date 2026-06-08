import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getHealth } from "./health.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getHealth));

export default router;
