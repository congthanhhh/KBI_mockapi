import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { taxProfileColumns } from "./itemTaxProfiles.constants.js";
import { softDeleteTaxProfile, updateTaxProfile } from "./itemTaxProfiles.repository.js";

function validateRate(value, field) {
    const numberValue = Number(value);

    if (value === null || value === "" || numberValue < 0 || numberValue > 100 || Number.isNaN(numberValue)) {
        throw httpError(400, `${field} must be between 0 and 100`);
    }
}

function validateTaxProfileFields(body) {
    for (const field of ["import_duty_rate", "vat_rate", "preferential_import_duty_rate"]) {
        if (Object.hasOwn(body, field)) {
            validateRate(body[field], field);
        }
    }
}

export async function editTaxProfile(id, body) {
    const fields = pickAllowedFields(body, taxProfileColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

    validateTaxProfileFields(body);

    const profile = await updateTaxProfile(id, fields);

    if (!profile) {
        throw httpError(404, "Item tax profile not found");
    }

    return profile;
}

export async function removeTaxProfile(id) {
    const profile = await softDeleteTaxProfile(id);

    if (!profile) {
        throw httpError(404, "Item tax profile not found");
    }

    return profile;
}
