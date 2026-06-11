import express from "express";
import currenciesRouter from "../modules/currencies/currencies.routes.js";
import deliveryOrdersRouter from "../modules/deliveryOrders/deliveryOrders.routes.js";
import healthRouter from "../modules/health/health.routes.js";
import incotermsRouter from "../modules/incoterms/incoterms.routes.js";
import itemGroupsRouter from "../modules/itemGroups/itemGroups.routes.js";
import itemTaxProfilesRouter from "../modules/itemTaxProfiles/itemTaxProfiles.routes.js";
import itemsRouter from "../modules/items/items.routes.js";
import optionsRouter from "../modules/options/options.routes.js";
import purchaseOrdersRouter from "../modules/purchaseOrders/purchaseOrders.routes.js";
import quotationsRouter from "../modules/quotations/quotations.routes.js";
import shipmentsRouter from "../modules/shipments/shipments.routes.js";
import suppliersRouter from "../modules/suppliers/suppliers.routes.js";
import transportModesRouter from "../modules/transportModes/transportModes.routes.js";

const router = express.Router();

router.use("/health", healthRouter);
router.use("/currencies", currenciesRouter);
router.use("/incoterms", incotermsRouter);
router.use("/transport-modes", transportModesRouter);
router.use("/suppliers", suppliersRouter);
router.use("/options", optionsRouter);
router.use("/item-groups", itemGroupsRouter);
router.use("/items", itemsRouter);
router.use("/item-tax-profiles", itemTaxProfilesRouter);
router.use("/v1", purchaseOrdersRouter);
router.use("/v1", deliveryOrdersRouter);
router.use("/v1", quotationsRouter);
router.use("/v1", shipmentsRouter);

export default router;
