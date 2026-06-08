import express from "express";
import healthRouter from "../modules/health/health.routes.js";
import itemTaxProfilesRouter from "../modules/itemTaxProfiles/itemTaxProfiles.routes.js";
import itemsRouter from "../modules/items/items.routes.js";

const router = express.Router();

router.use("/health", healthRouter);
router.use("/items", itemsRouter);
router.use("/item-tax-profiles", itemTaxProfilesRouter);

export default router;
