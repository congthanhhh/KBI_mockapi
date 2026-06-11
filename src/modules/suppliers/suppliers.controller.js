import { parsePagination } from "../../utils/pagination.js";
import { parseOptionalBoolean } from "../../utils/queryParams.js";
import {
    addSupplier,
    editSupplier,
    getSupplier,
    listSuppliers,
    removeSupplier
} from "./suppliers.service.js";

export async function getSuppliers(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listSuppliers({
        search: req.query.search || req.query.q,
        role: req.query.role,
        country: req.query.country,
        isActive: parseOptionalBoolean(req.query.is_active),
        ...pagination
    });

    res.json(result);
}

export async function getSupplierById(req, res) {
    res.json({
        data: await getSupplier(req.params.id)
    });
}

export async function createSupplier(req, res) {
    res.status(201).json({
        data: await addSupplier(req.body),
        message: "Created successfully"
    });
}

export async function updateSupplier(req, res) {
    res.json({
        data: await editSupplier(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteSupplier(req, res) {
    res.json({
        data: await removeSupplier(req.params.id),
        message: "Deleted successfully"
    });
}
