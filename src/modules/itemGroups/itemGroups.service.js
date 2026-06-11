import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { itemGroupColumns } from "./itemGroups.constants.js";
import {
    createItemGroup,
    findItemGroupById,
    findItemGroups,
    softDeleteItemGroup,
    updateItemGroup
} from "./itemGroups.repository.js";

export async function listItemGroups({ q, page, limit, offset }) {
    const { itemGroups, total } = await findItemGroups({ q, limit, offset });

    return {
        data: itemGroups,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getItemGroup(id) {
    const itemGroup = await findItemGroupById(id);

    if (!itemGroup) {
        throw httpError(404, "Item group not found");
    }

    return itemGroup;
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

export async function addItemGroup(body) {
    requireField(body, "group_name");

    return createItemGroup(pickAllowedFields(body, itemGroupColumns));
}

export async function editItemGroup(id, body) {
    const fields = pickAllowedFields(body, itemGroupColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    if (Object.hasOwn(body, "group_name")) {
        requireField(body, "group_name");
    }

    const itemGroup = await updateItemGroup(id, fields);

    if (!itemGroup) {
        throw httpError(404, "Item group not found");
    }

    return itemGroup;
}

export async function removeItemGroup(id) {
    const itemGroup = await softDeleteItemGroup(id);

    if (!itemGroup) {
        throw httpError(404, "Item group not found");
    }

    return itemGroup;
}
