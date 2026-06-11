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

function validateNonNegativeNumber(value, field) {
    if (value === null || value === "" || Number(value) < 0 || Number.isNaN(Number(value))) {
        throw httpError(400, `${field} must be greater than or equal to 0`);
    }
}

function validateNonNegativeInteger(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || !Number.isInteger(numberValue) || numberValue < 0) {
        throw httpError(400, `${field} must be a non-negative integer`);
    }
}

function validateRate(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || numberValue > 100 || Number.isNaN(numberValue)) {
        throw httpError(400, `${field} must be between 0 and 100`);
    }
}

function validateItemFields(body) {
    if (Object.hasOwn(body, "lead_time_days")) {
        validateNonNegativeInteger(body.lead_time_days, "lead_time_days");
    }

    if (Object.hasOwn(body, "moq")) {
        validateNonNegativeNumber(body.moq, "moq");
    }
}

function validateTaxProfileFields(body) {
    for (const field of ["import_duty_rate", "vat_rate", "preferential_import_duty_rate"]) {
        if (Object.hasOwn(body, field)) {
            validateRate(body[field], field);
        }
    }
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

export async function addItem(body) {
    requireField(body, "item_code");
    requireField(body, "item_name");

    validateItemFields(body);

    return createItem(pickAllowedFields(body, itemColumns));
}

export async function editItem(id, body) {
    const fields = pickAllowedFields(body, itemColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    if (Object.hasOwn(body, "item_code")) {
        requireField(body, "item_code");
    }

    if (Object.hasOwn(body, "item_name")) {
        requireField(body, "item_name");
    }

    validateItemFields(body);

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
    validateTaxProfileFields(body);

    return createTaxProfileForItem(itemId, pickAllowedFields(body, taxProfileColumns));
}
