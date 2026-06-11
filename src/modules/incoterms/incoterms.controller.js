import { parsePagination } from "../../utils/pagination.js";
import { parseOptionalBoolean } from "../../utils/queryParams.js";
import {
    addIncoterm,
    editIncoterm,
    getIncoterm,
    listIncoterms,
    removeIncoterm
} from "./incoterms.service.js";

export async function getIncoterms(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listIncoterms({
        search: req.query.search || req.query.q,
        isActive: parseOptionalBoolean(req.query.is_active),
        ...pagination
    });

    res.json(result);
}

export async function getIncotermById(req, res) {
    res.json({
        data: await getIncoterm(req.params.id)
    });
}

export async function createIncoterm(req, res) {
    res.status(201).json({
        data: await addIncoterm(req.body),
        message: "Created successfully"
    });
}

export async function updateIncoterm(req, res) {
    res.json({
        data: await editIncoterm(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteIncoterm(req, res) {
    res.json({
        data: await removeIncoterm(req.params.id),
        message: "Deleted successfully"
    });
}
