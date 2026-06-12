import { mockJsonRepository as repo } from "../../repositories/MockJsonRepository.js";
import { error as apiError } from "../../utils/apiResponse.js";

const searchableFields = [
    "currency_code",
    "currency_name",
    "incoterm_code",
    "incoterm_name",
    "mode_code",
    "mode_name",
    "supplier_code",
    "supplier_name",
    "group_code",
    "group_name",
    "item_code",
    "item_name",
    "hs_code"
];

export async function listCollection(collectionName, query = {}) {
    const rows = await active(collectionName);
    const filtered = rows.filter((row) => matchesQuery(row, query));
    const page = Number(query.page || 1);
    const limit = Number(query.limit || filtered.length || 20);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

    return {
        data,
        total: filtered.length,
        pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

export async function getRecord(collectionName, id) {
    const record = await repo.findById(collectionName, id);

    if (!record) {
        throw apiError("NOT_FOUND", "Record not found", { id }, 404);
    }

    return record;
}

export async function createRecord(collectionName, idPrefix, body) {
    const rows = await active(collectionName);
    return repo.insert(collectionName, {
        id: nextId(rows, idPrefix),
        ...body
    });
}

export async function updateRecord(collectionName, id, body) {
    await getRecord(collectionName, id);
    return repo.update(collectionName, id, body);
}

export async function deleteRecord(collectionName, id) {
    await getRecord(collectionName, id);
    return repo.softDelete(collectionName, id);
}

export async function deleteItem(id) {
    const item = await deleteRecord("item-master", id);
    const profiles = await active("item-customs-profiles");
    const matchingProfiles = profiles.filter((profile) => profile.item_id === id);

    for (const profile of matchingProfiles) {
        await repo.softDelete("item-customs-profiles", profile.id);
    }

    return {
        id: item.id,
        is_delete: item.is_delete,
        delete_at: item.delete_at,
        deleted_tax_profiles: matchingProfiles.length
    };
}

export async function listItemTaxProfiles(itemId) {
    return (await active("item-customs-profiles")).filter((profile) => profile.item_id === itemId);
}

export async function createItemTaxProfile(itemId, body) {
    await getRecord("item-master", itemId);
    const profiles = await active("item-customs-profiles");
    return repo.insert("item-customs-profiles", {
        id: nextId(profiles, "icp"),
        item_id: itemId,
        ...body
    });
}

export async function getOptions(query = {}) {
    const requestedTypes = String(query.types || "currencies,incoterms,transport_modes,suppliers")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    const [currencies, incoterms, transportModes, suppliers] = await Promise.all([
        active("currencies"),
        active("incoterms"),
        active("transport-modes"),
        active("suppliers")
    ]);
    const data = {};

    if (requestedTypes.includes("currencies")) {
        data.currencies = currencies.map((row) => option(row.id, row.currency_code, row.currency_name));
    }

    if (requestedTypes.includes("incoterms")) {
        data.incoterms = incoterms.map((row) => option(row.id, row.incoterm_code, row.incoterm_name));
    }

    if (requestedTypes.includes("transport_modes")) {
        data.transport_modes = transportModes.map((row) => option(row.id, row.mode_code, row.mode_name));
    }

    if (requestedTypes.includes("suppliers")) {
        const role = query.role ? String(query.role).toUpperCase() : "";
        data.suppliers = suppliers
            .filter((row) => !role || String(row.supplier_type || "").toUpperCase() === role || row.supplier_roles?.includes(role))
            .map((row) => option(row.id, row.supplier_code, row.supplier_name));
    }

    return data;
}

async function active(collectionName) {
    return (await repo.readCollection(collectionName)).filter((row) => row.is_delete !== true);
}

function matchesQuery(row, query) {
    if (query.item_group_id && row.item_group_id !== query.item_group_id) {
        return false;
    }

    if (query.is_active !== undefined && String(row.is_active) !== String(query.is_active)) {
        return false;
    }

    if (query.role) {
        const role = String(query.role).toUpperCase();
        const roles = row.supplier_roles || [row.supplier_type].filter(Boolean);

        if (!roles.map((value) => String(value).toUpperCase()).includes(role)) {
            return false;
        }
    }

    if (query.country && String(row.country).toLowerCase() !== String(query.country).toLowerCase()) {
        return false;
    }

    const search = String(query.q || query.search || "").trim().toLowerCase();

    if (!search) {
        return true;
    }

    return searchableFields.some((field) => String(row[field] || "").toLowerCase().includes(search));
}

function nextId(rows, prefix) {
    const max = rows.reduce((highest, row) => {
        const match = String(row.id).match(new RegExp(`^${prefix}_(\\d+)$`));
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `${prefix}_${String(max + 1).padStart(3, "0")}`;
}

function option(value, code, name) {
    return {
        value,
        label: code ? `${code} - ${name}` : name
    };
}
