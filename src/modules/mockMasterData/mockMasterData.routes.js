import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./mockMasterData.controller.js";

const router = express.Router();

router.get("/options", asyncHandler(controller.getOptions));

router.get("/currencies", asyncHandler(controller.listCurrencies));
router.get("/currencies/:id", asyncHandler(controller.getCurrency));
router.post("/currencies", asyncHandler(controller.createCurrency));
router.patch("/currencies/:id", asyncHandler(controller.updateCurrency));
router.delete("/currencies/:id", asyncHandler(controller.deleteCurrency));

router.get("/incoterms", asyncHandler(controller.listIncoterms));
router.get("/incoterms/:id", asyncHandler(controller.getIncoterm));
router.post("/incoterms", asyncHandler(controller.createIncoterm));
router.patch("/incoterms/:id", asyncHandler(controller.updateIncoterm));
router.delete("/incoterms/:id", asyncHandler(controller.deleteIncoterm));

router.get("/transport-modes", asyncHandler(controller.listTransportModes));
router.get("/transport-modes/:id", asyncHandler(controller.getTransportMode));
router.post("/transport-modes", asyncHandler(controller.createTransportMode));
router.patch("/transport-modes/:id", asyncHandler(controller.updateTransportMode));
router.delete("/transport-modes/:id", asyncHandler(controller.deleteTransportMode));

router.get("/forwarders", asyncHandler(controller.listForwarders));
router.get("/forwarders/:id", asyncHandler(controller.getForwarder));
router.post("/forwarders", asyncHandler(controller.createForwarder));
router.patch("/forwarders/:id", asyncHandler(controller.updateForwarder));
router.delete("/forwarders/:id", asyncHandler(controller.deleteForwarder));

router.get("/carriers", asyncHandler(controller.listCarriers));
router.get("/carriers/:id", asyncHandler(controller.getCarrier));
router.post("/carriers", asyncHandler(controller.createCarrier));
router.patch("/carriers/:id", asyncHandler(controller.updateCarrier));
router.delete("/carriers/:id", asyncHandler(controller.deleteCarrier));

router.get("/task-templates", asyncHandler(controller.listTaskTemplates));
router.get("/task-templates/:id", asyncHandler(controller.getTaskTemplate));
router.post("/task-templates", asyncHandler(controller.createTaskTemplate));
router.patch("/task-templates/:id", asyncHandler(controller.updateTaskTemplate));
router.delete("/task-templates/:id", asyncHandler(controller.deleteTaskTemplate));

router.get("/suppliers", asyncHandler(controller.listSuppliers));
router.get("/suppliers/:id", asyncHandler(controller.getSupplier));
router.post("/suppliers", asyncHandler(controller.createSupplier));
router.patch("/suppliers/:id", asyncHandler(controller.updateSupplier));
router.delete("/suppliers/:id", asyncHandler(controller.deleteSupplier));

router.get("/item-groups", asyncHandler(controller.listItemGroups));
router.get("/item-groups/:id", asyncHandler(controller.getItemGroup));
router.get("/item-groups/:id/items", asyncHandler(controller.listItemsByGroup));
router.post("/item-groups", asyncHandler(controller.createItemGroup));
router.put("/item-groups/:id", asyncHandler(controller.updateItemGroup));
router.delete("/item-groups/:id", asyncHandler(controller.deleteItemGroup));

router.get("/items", asyncHandler(controller.listItems));
router.get("/items/:id", asyncHandler(controller.getItem));
router.post("/items", asyncHandler(controller.createItem));
router.put("/items/:id", asyncHandler(controller.updateItem));
router.delete("/items/:id", asyncHandler(controller.deleteItem));

router.get("/items/:id/tax-profile", asyncHandler(controller.listItemTaxProfiles));
router.post("/items/:id/tax-profile", asyncHandler(controller.createItemTaxProfile));
router.put("/item-tax-profiles/:id", asyncHandler(controller.updateItemTaxProfile));
router.delete("/item-tax-profiles/:id", asyncHandler(controller.deleteItemTaxProfile));

export default router;
