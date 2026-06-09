import { parsePagination } from "../../utils/pagination.js";
import {
    addItem,
    addItemTaxProfile,
    editItem,
    getItem,
    listItems,
    listItemTaxProfiles,
    removeItem
} from "./items.service.js";

export async function getItems(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listItems({
        q: req.query.q,
        itemGroupId: req.query.item_group_id,
        ...pagination
    });

    res.json(result);
}

export async function getItemById(req, res) {
    res.json({
        data: await getItem(req.params.id)
    });
}

export async function createItem(req, res) {
    res.status(201).json({
        data: await addItem(req.body),
        message: "Created successfully"
    });
}

export async function updateItem(req, res) {
    res.json({
        data: await editItem(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteItem(req, res) {
    res.json({
        data: await removeItem(req.params.id),
        message: "Deleted successfully"
    });
}

export async function getItemTaxProfiles(req, res) {
    const profiles = await listItemTaxProfiles(req.params.id);

    res.json({
        data: profiles,
        total: profiles.length
    });
}

export async function createItemTaxProfile(req, res) {
    res.status(201).json({
        data: await addItemTaxProfile(req.params.id, req.body),
        message: "Created successfully"
    });
}
