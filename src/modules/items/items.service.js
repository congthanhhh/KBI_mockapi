import { buildPaginationMeta } from "../../utils/pagination.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { httpError } from "../../utils/httpError.js";
import { itemColumns, taxProfileColumns } from "./items.constants.js";
import {
    createItem,
    createTaxProfileForItem,
    findItemById,
    findItems,
    findTaxProfilesByItemId,
    softDeleteItem,
    updateItem
} from "./items.repository.js";

export async function listItems({ q, itemGroupId, page, limit, offset }) {
    const { items, total } = await findItems({ q, itemGroupId, limit, offset });

    return {
        data: items,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getItem(id) {
    const item = await findItemById(id);

    if (!item) {
        throw httpError(404, "Item not found");
    }

    return item;
}

export async function addItem(body) {
    if (!Object.hasOwn(body, "item_code")) {
        throw httpError(400, "item_code is required");
    }

    if (!Object.hasOwn(body, "item_name")) {
        throw httpError(400, "item_name is required");
    }

    return createItem(pickAllowedFields(body, itemColumns));
}

export async function editItem(id, body) {
    const fields = pickAllowedFields(body, itemColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    const item = await updateItem(id, fields);

    if (!item) {
        throw httpError(404, "Item not found");
    }

    return item;
}

export async function removeItem(id) {
    const item = await softDeleteItem(id);

    if (!item) {
        throw httpError(404, "Item not found");
    }

    return item;
}

export async function listItemTaxProfiles(itemId) {
    await getItem(itemId);

    return findTaxProfilesByItemId(itemId);
}

export async function addItemTaxProfile(itemId, body) {
    await getItem(itemId);

    return createTaxProfileForItem(itemId, pickAllowedFields(body, taxProfileColumns));
}
