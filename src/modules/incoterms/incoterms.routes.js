import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createIncoterm,
    deleteIncoterm,
    getIncotermById,
    getIncoterms,
    updateIncoterm
} from "./incoterms.controller.js";

const router = express.Router();

router.get("/", asyncHandler(getIncoterms));
router.get("/:id", asyncHandler(getIncotermById));
router.post("/", asyncHandler(createIncoterm));
router.patch("/:id", asyncHandler(updateIncoterm));
router.delete("/:id", asyncHandler(deleteIncoterm));

export default router;
