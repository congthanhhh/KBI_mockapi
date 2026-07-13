import * as service from "./mockMasterData.service.js";

export async function getOptions(req, res) {
    res.json({ data: await service.getOptions(req.query) });
}

export const listCurrencies = list("currencies");
export const getCurrency = detail("currencies");
export const createCurrency = create("currencies", "cur");
export const updateCurrency = update("currencies");
export const deleteCurrency = remove("currencies");

export const listIncoterms = list("incoterms");
export const getIncoterm = detail("incoterms");
export const createIncoterm = create("incoterms", "inc");
export const updateIncoterm = update("incoterms");
export const deleteIncoterm = remove("incoterms");

export const listTransportModes = list("transport-modes");
export const getTransportMode = detail("transport-modes");
export const createTransportMode = create("transport-modes", "tm");
export const updateTransportMode = update("transport-modes");
export const deleteTransportMode = remove("transport-modes");

export const listChargeCodes = list("charge-codes");
export const getChargeCode = detail("charge-codes");
export const createChargeCode = create("charge-codes", "chg");
export const updateChargeCode = update("charge-codes");
export const deleteChargeCode = remove("charge-codes");

export const listUoms = list("uoms");
export const getUom = detail("uoms");
export const createUom = create("uoms", "uom");
export const updateUom = update("uoms");
export const deleteUom = remove("uoms");

export const listContainerTypes = list("container-types");
export const getContainerType = detail("container-types");
export const createContainerType = create("container-types", "ct");
export const updateContainerType = update("container-types");
export const deleteContainerType = remove("container-types");

export const listDocumentTypes = list("document-types");
export const getDocumentType = detail("document-types");
export const createDocumentType = create("document-types", "doct");
export const updateDocumentType = update("document-types");
export const deleteDocumentType = remove("document-types");

export const listForwarders = list("forwarders");
export const getForwarder = detail("forwarders");
export const createForwarder = create("forwarders", "fwd");
export const updateForwarder = update("forwarders");
export const deleteForwarder = remove("forwarders");

export const listCarriers = list("carriers");
export const getCarrier = detail("carriers");
export const createCarrier = create("carriers", "carr");
export const updateCarrier = update("carriers");
export const deleteCarrier = remove("carriers");

export const listTaskTemplates = list("task-templates");
export const getTaskTemplate = detail("task-templates");
export const createTaskTemplate = create("task-templates", "tt");
export const updateTaskTemplate = update("task-templates");
export const deleteTaskTemplate = remove("task-templates");

export async function listSuppliers(req, res) {
    res.json(await service.listSuppliers(req.query));
}

export async function getSupplier(req, res) {
    res.json({
        data: await service.getSupplier(req.params.id)
    });
}

export async function createSupplier(req, res) {
    res.status(201).json({
        data: await service.createSupplier(req.body),
        message: "Record created"
    });
}

export async function updateSupplier(req, res) {
    res.json({
        data: await service.updateSupplier(req.params.id, req.body),
        message: "Record updated"
    });
}

export const deleteSupplier = remove("suppliers");

export const listItemGroups = list("item-groups");
export const getItemGroup = detail("item-groups");
export const createItemGroup = create("item-groups", "grp");
export const updateItemGroup = update("item-groups");
export const deleteItemGroup = remove("item-groups");

export async function listItemsByGroup(req, res) {
    res.json(await service.listItemsByGroup(req.params.id, req.query));
}

export async function listItems(req, res) {
    res.json(await service.listItems(req.query));
}

export async function getItem(req, res) {
    res.json({
        data: await service.getItem(req.params.id)
    });
}

export const createItem = create("item-master", "item");
export const updateItem = update("item-master");

export async function deleteItem(req, res) {
    res.json({
        data: await service.deleteItem(req.params.id),
        message: "Item deleted"
    });
}

export async function listItemTaxProfiles(req, res) {
    const data = await service.listItemTaxProfiles(req.params.id);
    res.json({
        data,
        total: data.length
    });
}

export async function createItemTaxProfile(req, res) {
    res.status(201).json({
        data: await service.createItemTaxProfile(req.params.id, req.body),
        message: "Item tax profile created"
    });
}

export const updateItemTaxProfile = update("item-customs-profiles");
export const deleteItemTaxProfile = remove("item-customs-profiles");

function list(collectionName) {
    return async (req, res) => {
        res.json(await service.listCollection(collectionName, req.query));
    };
}

function detail(collectionName) {
    return async (req, res) => {
        res.json({
            data: await service.getRecord(collectionName, req.params.id)
        });
    };
}

function create(collectionName, idPrefix) {
    return async (req, res) => {
        res.status(201).json({
            data: await service.createRecord(collectionName, idPrefix, req.body),
            message: "Record created"
        });
    };
}

function update(collectionName) {
    return async (req, res) => {
        res.json({
            data: await service.updateRecord(collectionName, req.params.id, req.body),
            message: "Record updated"
        });
    };
}

function remove(collectionName) {
    return async (req, res) => {
        res.json({
            data: await service.deleteRecord(collectionName, req.params.id),
            message: "Record deleted"
        });
    };
}
