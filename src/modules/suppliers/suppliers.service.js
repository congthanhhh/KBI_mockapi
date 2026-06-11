import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { supplierColumns, supplierRelationColumns } from "./suppliers.constants.js";
import {
    createSupplier,
    findSupplierById,
    findSuppliers,
    softDeleteSupplier,
    updateSupplier
} from "./suppliers.repository.js";

export async function listSuppliers({ search, role, country, isActive, page, limit, offset }) {
    const { suppliers, total } = await findSuppliers({
        search,
        role,
        country,
        isActive,
        limit,
        offset
    });

    return {
        data: suppliers,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getSupplier(id) {
    const supplier = await findSupplierById(id);

    if (!supplier) {
        throw httpError(404, "Supplier not found");
    }

    return supplier;
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

function validateSupplierFields(body) {
    if (!Object.hasOwn(body, "lead_time_days")) {
        return;
    }

    const leadTimeDays = Number(body.lead_time_days);

    if (
        body.lead_time_days === null
        || body.lead_time_days === ""
        || !Number.isInteger(leadTimeDays)
        || leadTimeDays < 0
    ) {
        throw httpError(400, "lead_time_days must be a non-negative integer");
    }
}

export async function addSupplier(body) {
    requireField(body, "supplier_code");
    requireField(body, "supplier_name");
    validateSupplierFields(body);

    return createSupplier(
        pickAllowedFields(body, supplierColumns),
        pickAllowedFields(body, supplierRelationColumns)
    );
}

export async function editSupplier(id, body) {
    const fields = pickAllowedFields(body, supplierColumns);
    const relationFields = pickAllowedFields(body, supplierRelationColumns);

    if (!fields.length && !relationFields.length) {
        throw httpError(400, "No valid fields to update");
    }

    if (Object.hasOwn(body, "supplier_code")) {
        requireField(body, "supplier_code");
    }

    if (Object.hasOwn(body, "supplier_name")) {
        requireField(body, "supplier_name");
    }

    validateSupplierFields(body);

    const supplier = await updateSupplier(id, fields, relationFields);

    if (!supplier) {
        throw httpError(404, "Supplier not found");
    }

    return supplier;
}

export async function removeSupplier(id) {
    const supplier = await softDeleteSupplier(id);

    if (!supplier) {
        throw httpError(404, "Supplier not found");
    }

    return supplier;
}
