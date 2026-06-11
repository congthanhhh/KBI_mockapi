import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { transportModeColumns } from "./transportModes.constants.js";
import {
    createTransportMode,
    findTransportModeById,
    findTransportModes,
    softDeleteTransportMode,
    updateTransportMode
} from "./transportModes.repository.js";

export async function listTransportModes({ search, modeType, isInternational, isActive, page, limit, offset }) {
    const { transportModes, total } = await findTransportModes({
        search,
        modeType,
        isInternational,
        isActive,
        limit,
        offset
    });

    return {
        data: transportModes,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getTransportMode(id) {
    const transportMode = await findTransportModeById(id);

    if (!transportMode) {
        throw httpError(404, "Transport mode not found");
    }

    return transportMode;
}

const allowedModeTypes = ["SEA", "AIR", "ROAD", "RAIL", "MULTIMODAL", "TRUCKING", "OTHER"];

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

function validateTransportModeFields(body) {
    if (body.mode_type && !allowedModeTypes.includes(body.mode_type)) {
        throw httpError(400, `mode_type must be one of ${allowedModeTypes.join(", ")}`);
    }
}

export async function addTransportMode(body) {
    requireField(body, "mode_code");
    requireField(body, "mode_name");
    requireField(body, "mode_type");
    validateTransportModeFields(body);

    return createTransportMode(pickAllowedFields(body, transportModeColumns));
}

export async function editTransportMode(id, body) {
    const fields = pickAllowedFields(body, transportModeColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    for (const field of ["mode_code", "mode_name", "mode_type"]) {
        if (Object.hasOwn(body, field)) {
            requireField(body, field);
        }
    }

    validateTransportModeFields(body);

    const transportMode = await updateTransportMode(id, fields);

    if (!transportMode) {
        throw httpError(404, "Transport mode not found");
    }

    return transportMode;
}

export async function removeTransportMode(id) {
    const transportMode = await softDeleteTransportMode(id);

    if (!transportMode) {
        throw httpError(404, "Transport mode not found");
    }

    return transportMode;
}
