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
    "supplier_type",
    "contact_name",
    "contact_email",
    "contact_phone",
    "email",
    "phone",
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

export async function listSuppliers(query = {}) {
    const rows = await active("suppliers");
    const normalizedRows = await Promise.all(rows.map((row) => normalizeSupplier(row)));
    return paginate(normalizedRows.filter((row) => matchesQuery(row, query)), query);
}

export async function getSupplier(id) {
    return normalizeSupplier(await getRecord("suppliers", id));
}

export async function createSupplier(body) {
    const rows = await active("suppliers");
    const record = await repo.insert("suppliers", {
        id: nextId(rows, "sup"),
        ...normalizeSupplierPayload(body)
    });

    await syncSupplierTransportModes(record.id, body);

    return getSupplier(record.id);
}

export async function updateSupplier(id, body) {
    await getRecord("suppliers", id);
    const record = await repo.update("suppliers", id, normalizeSupplierPayload(body));

    await syncSupplierTransportModes(id, body);

    return getSupplier(record.id);
}

export async function listItems(query = {}) {
    const rows = await active("item-master");
    const normalizedRows = await Promise.all(rows.map((row) => normalizeItem(row)));
    return paginate(normalizedRows.filter((row) => matchesQuery(row, query)), query);
}

export async function getItem(id) {
    return normalizeItem(await getRecord("item-master", id));
}

export async function listItemsByGroup(groupId, query = {}) {
    return listItems({
        ...query,
        item_group_id: groupId
    });
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
    return (await active("item-customs-profiles"))
        .filter((profile) => profile.item_id === itemId)
        .map(normalizeItemTaxProfile);
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
        const normalizedSuppliers = await Promise.all(suppliers.map((row) => normalizeSupplier(row)));

        data.suppliers = normalizedSuppliers
            .filter((row) => !role || row.supplier_roles.includes(role))
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

function paginate(filtered, query = {}) {
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

async function normalizeSupplier(row) {
    const [currencies, incoterms, transportModes, supplierTransportModes] = await Promise.all([
        active("currencies"),
        active("incoterms"),
        active("transport-modes"),
        active("supplier-transport-modes")
    ]);
    const defaultCurrency = findByIdOrCode(currencies, row.default_currency_id, row.default_currency_code, "currency_code");
    const defaultIncoterm = findByIdOrCode(incoterms, row.default_incoterm_id, row.default_incoterm_code, "incoterm_code");
    const normalizedTransportModes = transportModes.map(normalizeTransportMode);
    const transportModeIds = new Set([
        ...supplierTransportModes
            .filter((mode) => mode.supplier_id === row.id)
            .map((mode) => mode.transport_mode_id),
        ...(Array.isArray(row.transport_mode_ids) ? row.transport_mode_ids : [])
    ]);
    const defaultTransportModeId = row.default_transport_mode_id || null;

    return {
        ...row,
        supplier_roles: normalizeSupplierRoles(row),
        address: row.address ?? null,
        contact_name: row.contact_name ?? null,
        contact_email: row.contact_email ?? row.email ?? null,
        contact_phone: row.contact_phone ?? row.phone ?? null,
        payment_term: row.payment_term ?? null,
        default_currency_code: row.default_currency_code ?? defaultCurrency?.currency_code ?? null,
        default_incoterm_code: row.default_incoterm_code ?? defaultIncoterm?.incoterm_code ?? null,
        default_currency_id: row.default_currency_id ?? defaultCurrency?.id ?? null,
        default_incoterm_id: row.default_incoterm_id ?? defaultIncoterm?.id ?? null,
        default_currency: defaultCurrency ? normalizeCurrency(defaultCurrency) : null,
        default_incoterm: defaultIncoterm ?? null,
        lead_time_days: row.lead_time_days ?? null,
        is_active: row.is_active !== false,
        supplier_transport_modes: Array.from(transportModeIds).map((transportModeId) => {
            const link = supplierTransportModes.find(
                (mode) => mode.supplier_id === row.id && mode.transport_mode_id === transportModeId
            );

            return {
                id: link?.id ?? `${row.id}_${transportModeId}`,
                supplier_id: row.id,
                transport_mode_id: transportModeId,
                is_default: link?.is_default === true || transportModeId === defaultTransportModeId,
                is_active: link?.is_active !== false,
                create_at: link?.create_at ?? row.create_at,
                update_at: link?.update_at ?? row.update_at,
                delete_at: link?.delete_at ?? null,
                is_delete: link?.is_delete ?? false,
                transport_mode: normalizedTransportModes.find((mode) => mode.id === transportModeId) ?? null
            };
        })
    };
}

function normalizeSupplierPayload(body) {
    const supplierRoles = Array.isArray(body.supplier_roles) && body.supplier_roles.length > 0
        ? body.supplier_roles.map((role) => String(role).toUpperCase())
        : undefined;
    const payload = { ...body };

    if (supplierRoles) {
        payload.supplier_roles = supplierRoles;
    }

    if (body.contact_email !== undefined || body.email !== undefined) {
        payload.contact_email = body.contact_email ?? body.email;
    }

    if (body.contact_phone !== undefined || body.phone !== undefined) {
        payload.contact_phone = body.contact_phone ?? body.phone;
    }

    return payload;
}

async function syncSupplierTransportModes(supplierId, body) {
    if (!Array.isArray(body.transport_mode_ids) && body.default_transport_mode_id === undefined) {
        return;
    }

    const now = new Date().toISOString();
    const rows = await repo.readCollection("supplier-transport-modes");
    const transportModeIds = Array.from(new Set(body.transport_mode_ids || []));
    const activeRows = rows.map((row) => {
        if (row.supplier_id !== supplierId || row.is_delete === true) {
            return row;
        }

        return {
            ...row,
            update_at: now,
            delete_at: now,
            is_delete: true
        };
    });

    const nextRows = transportModeIds.reduce((acc, transportModeId, index) => {
        acc.push({
            create_at: now,
            update_at: now,
            delete_at: null,
            is_delete: false,
            id: nextId([...rows, ...acc], "stm"),
            supplier_id: supplierId,
            transport_mode_id: transportModeId,
            is_default: transportModeId === body.default_transport_mode_id || (!body.default_transport_mode_id && index === 0),
            is_active: true
        });

        return acc;
    }, activeRows);

    await repo.writeCollection("supplier-transport-modes", nextRows);
}

function normalizeSupplierRoles(row) {
    const roles = Array.isArray(row.supplier_roles) ? row.supplier_roles : [];
    const legacyRole = mapLegacySupplierRole(row.supplier_type);
    return Array.from(new Set([...roles, legacyRole].filter(Boolean).map((role) => String(role).toUpperCase())));
}

function mapLegacySupplierRole(role) {
    const normalized = String(role || "").toUpperCase();

    if (normalized === "MANUFACTURER") {
        return "SUPPLIER";
    }

    if (normalized === "TRUCKING") {
        return "TRUCKING_VENDOR";
    }

    return normalized || null;
}

async function normalizeItem(row) {
    const [itemGroups, taxProfiles] = await Promise.all([
        active("item-groups"),
        active("item-customs-profiles")
    ]);
    const itemGroup = itemGroups.find((group) => group.id === row.item_group_id) || null;

    return {
        ...row,
        item_description: row.item_description ?? row.description ?? null,
        is_new: row.is_new ?? true,
        lead_time_days: row.lead_time_days ?? null,
        moq: row.moq ?? null,
        is_active: row.is_active !== false,
        item_group: itemGroup
            ? {
                id: itemGroup.id,
                group_code: itemGroup.group_code ?? null,
                group_name: itemGroup.group_name,
                description: itemGroup.description ?? null,
                default_hs_code: itemGroup.default_hs_code ?? null
            }
            : null,
        customs_profiles: taxProfiles
            .filter((profile) => profile.item_id === row.id)
            .map(normalizeItemTaxProfile)
    };
}

function normalizeItemTaxProfile(profile) {
    return {
        ...profile,
        preferential_import_duty_rate: profile.preferential_import_duty_rate ?? profile.preferential_tax_rate ?? null,
        is_default: profile.is_default ?? false
    };
}

function normalizeCurrency(currency) {
    return {
        ...currency,
        decimal_places: currency.decimal_places ?? (currency.currency_code === "VND" ? 0 : 2),
        is_active: currency.is_active !== false
    };
}

function normalizeTransportMode(mode) {
    const modeType = mode.mode_type ?? inferTransportModeType(mode.mode_code);

    return {
        ...mode,
        mode_type: modeType,
        description: mode.description ?? null,
        is_international: mode.is_international ?? modeType !== "ROAD",
        is_active: mode.is_active !== false
    };
}

function inferTransportModeType(modeCode) {
    const normalized = String(modeCode || "").toUpperCase();

    if (normalized.includes("AIR")) {
        return "AIR";
    }

    if (normalized.includes("TRUCK") || normalized.includes("ROAD")) {
        return "ROAD";
    }

    return "SEA";
}

function findByIdOrCode(rows, id, code, codeField) {
    return rows.find((row) => row.id === id || (code && row[codeField] === code)) || null;
}
