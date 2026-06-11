import { findCurrencyOptions } from "../currencies/currencies.repository.js";
import { findIncotermOptions } from "../incoterms/incoterms.repository.js";
import { findSupplierOptions } from "../suppliers/suppliers.repository.js";
import { findTransportModeOptions } from "../transportModes/transportModes.repository.js";
import { parseTypes } from "../../utils/queryParams.js";

const optionTypes = [
    "currencies",
    "incoterms",
    "transport_modes",
    "suppliers"
];

function mapCurrencyOption(currency) {
    return {
        label: currency.currency_code,
        value: currency.currency_code
    };
}

function mapIncotermOption(incoterm) {
    return {
        label: incoterm.incoterm_code,
        value: incoterm.incoterm_code
    };
}

function mapTransportModeOption(transportMode) {
    return {
        label: transportMode.mode_name,
        value: transportMode.mode_code
    };
}

function mapSupplierOption(supplier) {
    return {
        label: supplier.supplier_name,
        value: supplier.id
    };
}

export async function getOptions({ types, role }) {
    const requestedTypes = parseTypes(types, optionTypes);
    const data = {};

    const loaders = {
        currencies: async () => {
            data.currencies = (await findCurrencyOptions()).map(mapCurrencyOption);
        },
        incoterms: async () => {
            data.incoterms = (await findIncotermOptions()).map(mapIncotermOption);
        },
        transport_modes: async () => {
            data.transport_modes = (await findTransportModeOptions()).map(mapTransportModeOption);
        },
        suppliers: async () => {
            data.suppliers = (await findSupplierOptions({ role })).map(mapSupplierOption);
        }
    };

    await Promise.all(requestedTypes.map((type) => loaders[type]()));

    return {
        data,
        meta: {},
        errors: []
    };
}
