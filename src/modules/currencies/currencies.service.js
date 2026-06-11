import { buildPaginationMeta } from "../../utils/pagination.js";
import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { currencyColumns } from "./currencies.constants.js";
import {
    createCurrency,
    findCurrencies,
    findCurrencyById,
    softDeleteCurrency,
    updateCurrency
} from "./currencies.repository.js";

export async function listCurrencies({ search, isActive, page, limit, offset }) {
    const { currencies, total } = await findCurrencies({ search, isActive, limit, offset });

    return {
        data: currencies,
        total,
        pagination: buildPaginationMeta({ page, limit, total })
    };
}

export async function getCurrency(id) {
    const currency = await findCurrencyById(id);

    if (!currency) {
        throw httpError(404, "Currency not found");
    }

    return currency;
}

function requireField(body, field) {
    if (!Object.hasOwn(body, field) || body[field] === null || body[field] === "") {
        throw httpError(400, `${field} is required`);
    }
}

function validateCurrencyFields(body) {
    if (!Object.hasOwn(body, "decimal_places")) {
        return;
    }

    const decimalPlaces = Number(body.decimal_places);

    if (
        body.decimal_places === null
        || body.decimal_places === ""
        || !Number.isInteger(decimalPlaces)
        || decimalPlaces < 0
        || decimalPlaces > 6
    ) {
        throw httpError(400, "decimal_places must be an integer between 0 and 6");
    }
}

export async function addCurrency(body) {
    requireField(body, "currency_code");
    requireField(body, "currency_name");
    validateCurrencyFields(body);

    return createCurrency(pickAllowedFields(body, currencyColumns));
}

export async function editCurrency(id, body) {
    const fields = pickAllowedFields(body, currencyColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    if (Object.hasOwn(body, "currency_code")) {
        requireField(body, "currency_code");
    }

    if (Object.hasOwn(body, "currency_name")) {
        requireField(body, "currency_name");
    }

    validateCurrencyFields(body);

    const currency = await updateCurrency(id, fields);

    if (!currency) {
        throw httpError(404, "Currency not found");
    }

    return currency;
}

export async function removeCurrency(id) {
    const currency = await softDeleteCurrency(id);

    if (!currency) {
        throw httpError(404, "Currency not found");
    }

    return currency;
}
