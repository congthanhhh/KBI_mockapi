import { editTaxProfile, removeTaxProfile } from "./itemTaxProfiles.service.js";

export async function updateItemTaxProfile(req, res) {
    res.json({
        data: await editTaxProfile(req.params.id, req.body),
        message: "Updated successfully"
    });
}

export async function deleteItemTaxProfile(req, res) {
    res.json({
        data: await removeTaxProfile(req.params.id),
        message: "Deleted successfully"
    });
}
