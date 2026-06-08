import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildItemWhere(q) {
    const where = {
        is_delete: false
    };

    if (!q) {
        return where;
    }

    const searchableColumns = [
        "item_code",
        "item_group_name",
        "item_name_vi",
        "item_name_en",
        "model",
        "description",
        "default_hs_code",
        "classification_code",
        "note"
    ];

    where.OR = searchableColumns.map((column) => ({
        [column]: {
            contains: q,
            mode: "insensitive"
        }
    }));

    return where;
}

export async function findItems({ q, limit, offset }) {
    const where = buildItemWhere(q);

    const [items, total] = await Promise.all([
        prisma.masterItem.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { create_at: "desc" },
                { id: "desc" }
            ]
        }),
        prisma.masterItem.count({ where })
    ]);

    return {
        items,
        total
    };
}

export async function findItemById(id) {
    return prisma.masterItem.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createItem(fields) {
    return prisma.masterItem.create({
        data: fieldsToData(fields)
    });
}

export async function updateItem(id, fields) {
    const item = await findItemById(id);

    if (!item) {
        return null;
    }

    return prisma.masterItem.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteItem(id) {
    return prisma.$transaction(async (tx) => {
        const item = await tx.masterItem.findFirst({
            where: {
                id,
                is_delete: false
            }
        });

        if (!item) {
            return null;
        }

        const deletedItem = await tx.masterItem.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });

        const deletedProfiles = await tx.itemTaxProfile.updateMany({
            where: {
                item_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });

        return {
            ...deletedItem,
            deleted_tax_profiles: deletedProfiles.count
        };
    });
}

export async function findTaxProfilesByItemId(itemId) {
    return prisma.itemTaxProfile.findMany({
        where: {
            item_id: itemId,
            is_delete: false
        },
        orderBy: [
            { create_at: "desc" },
            { id: "desc" }
        ]
    });
}

export async function createTaxProfileForItem(itemId, fields) {
    return prisma.itemTaxProfile.create({
        data: {
            item_id: itemId,
            ...fieldsToData(fields)
        }
    });
}
