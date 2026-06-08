import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

export async function updateTaxProfile(id, fields) {
    const profile = await prisma.itemTaxProfile.findFirst({
        where: {
            id,
            is_delete: false
        }
    });

    if (!profile) {
        return null;
    }

    return prisma.itemTaxProfile.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteTaxProfile(id) {
    const profile = await prisma.itemTaxProfile.findFirst({
        where: {
            id,
            is_delete: false
        }
    });

    if (!profile) {
        return null;
    }

    return prisma.itemTaxProfile.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });
}
