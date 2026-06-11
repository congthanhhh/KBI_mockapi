import { parsePagination } from "../../utils/pagination.js";
import { parseOptionalBoolean } from "../../utils/queryParams.js";
import {
    addCurrency,
    editCurrency,
    getCurrency,
    listCurrencies,
    removeCurrency
} from "./currencies.service.js";

export async function getCurrencies(req, res) {
    const pagination = parsePagination(req.query);
    const result = await listCurrencies({
        search: req.query.search || req.query.q,
        isActive: parseOptionalBoolean(req.query.is_active),
        ...pagination
    });

    res.json(result);
}

export async function getCurrencyById(req, res) {
    res.json({
        data: await getCurrency(req.params.id)
    });
}

export async function createCurrency(req, res) {
    res.status(201).json({
        data: await addCurrency(req.body),
        message: "Created successfully"
    });
}

export async function updateCurrency(req, res) {
    res.json({
        data: await editCurrency(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteCurrency(req, res) {
    res.json({
        data: await removeCurrency(req.params.id),
        message: "Deleted successfully"
    });
}
