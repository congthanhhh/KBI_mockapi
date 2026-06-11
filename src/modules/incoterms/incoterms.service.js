import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { incotermColumns } from "./incoterms.constants.js";
import {
    createIncoterm,
    findIncotermById,
    findIncoterms,
    softDeleteIncoterm,
    updateIncoterm
} from "./incoterms.repository.js";

export async function listIncoterms({ search, isActive, page, limit, offset }) {
    const { incoterms, total } = await findIncoterms({ search, isActive, limit, offset });

    return {
        data: incoterms,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getIncoterm(id) {
    const incoterm = await findIncotermById(id);

    if (!incoterm) {
        throw httpError(404, "Incoterm not found");
    }

    return incoterm;
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

export async function addIncoterm(body) {
    requireField(body, "incoterm_code");
    requireField(body, "incoterm_name");

    return createIncoterm(pickAllowedFields(body, incotermColumns));
}

export async function editIncoterm(id, body) {
    const fields = pickAllowedFields(body, incotermColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    if (Object.hasOwn(body, "incoterm_code")) {
        requireField(body, "incoterm_code");
    }

    if (Object.hasOwn(body, "incoterm_name")) {
        requireField(body, "incoterm_name");
    }

    const incoterm = await updateIncoterm(id, fields);

    if (!incoterm) {
        throw httpError(404, "Incoterm not found");
    }

    return incoterm;
}

export async function removeIncoterm(id) {
    const incoterm = await softDeleteIncoterm(id);

    if (!incoterm) {
        throw httpError(404, "Incoterm not found");
    }

    return incoterm;
}
