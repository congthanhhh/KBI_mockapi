import { parsePagination } from "../../utils/pagination.js";
import { parseOptionalBoolean } from "../../utils/queryParams.js";
import {
    addTransportMode,
    editTransportMode,
    getTransportMode,
    listTransportModes,
    removeTransportMode
} from "./transportModes.service.js";

export async function getTransportModes(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listTransportModes({
        search: req.query.search || req.query.q,
        modeType: req.query.mode_type,
        isInternational: parseOptionalBoolean(req.query.is_international),
        isActive: parseOptionalBoolean(req.query.is_active),
        ...pagination
    });

    res.json(result);
}

export async function getTransportModeById(req, res) {
    res.json({
        data: await getTransportMode(req.params.id)
    });
}

export async function createTransportMode(req, res) {
    res.status(201).json({
        data: await addTransportMode(req.body),
        message: "Created successfully"
    });
}

export async function updateTransportMode(req, res) {
    res.json({
        data: await editTransportMode(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteTransportMode(req, res) {
    res.json({
        data: await removeTransportMode(req.params.id),
        message: "Deleted successfully"
    });
}
