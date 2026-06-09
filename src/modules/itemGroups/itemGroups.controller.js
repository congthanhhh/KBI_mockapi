import { parsePagination } from "../../utils/pagination.js";
import { listItems } from "../items/items.service.js";
import {
    addItemGroup,
    editItemGroup,
    getItemGroup,
    listItemGroups,
    removeItemGroup
} from "./itemGroups.service.js";

export async function getItemGroups(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listItemGroups({
        q: req.query.q,
        ...pagination
    });

    res.json(result);
}

export async function getItemGroupById(req, res) {
    res.json({
        data: await getItemGroup(req.params.id)
    });
}

export async function getItemGroupItems(req, res) {
    await getItemGroup(req.params.id);

    const pagination = parsePagination(req.query);
    const result = await listItems({
        q: req.query.q,
        itemGroupId: req.params.id,
        ...pagination
    });

    res.json(result);
}

export async function createItemGroup(req, res) {
    res.status(201).json({
        data: await addItemGroup(req.body),
        message: "Created successfully"
    });
}

export async function updateItemGroup(req, res) {
    res.json({
        data: await editItemGroup(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteItemGroup(req, res) {
    res.json({
        data: await removeItemGroup(req.params.id),
        message: "Deleted successfully"
    });
}
