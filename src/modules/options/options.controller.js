import { getOptions } from "./options.service.js";

export async function getDropdownOptions(req, res) {
    res.json(await getOptions({
        types: req.query.types,
        role: req.query.role
    }));
}
