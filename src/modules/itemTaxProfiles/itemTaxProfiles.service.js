import { httpError } from "../../utils/httpError.js";
import { pickAllowedFields } from "../../utils/requestFields.js";
import { taxProfileColumns } from "./itemTaxProfiles.constants.js";
import { softDeleteTaxProfile, updateTaxProfile } from "./itemTaxProfiles.repository.js";

export async function editTaxProfile(id, body) {
    const fields = pickAllowedFields(body, taxProfileColumns);

    if (!fields.length) {
        throw httpError(400, "No valid fields to update");
    }

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
